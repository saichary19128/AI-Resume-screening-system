const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { parsePDFBuffer } = require('./utils/pdfParser');
const { getEmbedding, cosineSimilarity } = require('./utils/embeddings');
const { Candidate, Job, Match, User } = require('./models');

const router = express.Router();
const upload = multer();

let openaiClient = null;

async function getOpenAIClient() {
  if (!openaiClient) {
    const OpenAI = (await import('openai')).default;
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}


router.post('/uploadResume', upload.single('resume'), async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const text = await parsePDFBuffer(req.file.buffer);
    const embedding = await getEmbedding(text);

    const candidate = new Candidate({
      name,
      email,
      resumeText: text,
      resumeEmbedding: embedding,
    });

    await candidate.save();

    res.json({
      candidateId: candidate._id,
      message: 'Resume uploaded and processed',
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/jobs', async (req, res) => {
  try {
    const { title, description } = req.body;

    const embedding = await getEmbedding(description);

    const job = new Job({
      title,
      description,
      jobEmbedding: embedding,
    });

    await job.save();
    res.json(job);
  } catch (err) {
    console.error("Job creation error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/match', async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;

    const candidate = await Candidate.findById(candidateId);
    const job = await Job.findById(jobId);

    if (!candidate || !job)
      return res.status(404).json({ error: 'Candidate or Job not found' });

    const score = cosineSimilarity(
      candidate.resumeEmbedding,
      job.jobEmbedding
    );

    let assistantText = "Suggestions unavailable.";

    try {
      const suggestPrompt = `
Job Description:
${job.description}

Resume:
${candidate.resumeText.slice(0, 3000)}

Give summary and improvement suggestions.
`;

      const client = await getOpenAIClient();

      const gptResp = await client.chat.completions.create({
        model: process.env.SUGGESTION_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: suggestPrompt }],
        max_tokens: 400,
      });

      assistantText = gptResp.choices[0].message.content;

    } catch (aiErr) {
      console.log("OpenAI skipped:", aiErr.message);
    }

    const match = new Match({
      candidate: candidate._id,
      job: job._id,
      score,
      suggestions: assistantText,
    });

    await match.save();

    res.json({
      score,
      suggestions: assistantText,
      matchId: match._id,
    });

  } catch (err) {
    console.error("Match error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/analytics/job/:jobId', async (req, res) => {
  try {
    const jobId = req.params.jobId;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.json({ avgScore: 0, count: 0 });
    }

    const agg = await Match.aggregate([
      {
        $match: {
          job: new mongoose.Types.ObjectId(jobId),
        },
      },
      {
        $group: {
          _id: '$job',
          avgScore: { $avg: '$score' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(agg[0] || { avgScore: 0, count: 0 });

  } catch (err) {
    console.error("Analytics error:", err);
    res.json({ avgScore: 0, count: 0 });
  }
});

router.get("/candidate/:id", async (req, res) => {
  try {
    const cand = await Candidate.findById(req.params.id);
    res.json(cand);
  } catch {
    res.status(500).json({ error: "Candidate fetch failed" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role: role || "hr",
    });

    await user.save();

    res.json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
    });

  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
