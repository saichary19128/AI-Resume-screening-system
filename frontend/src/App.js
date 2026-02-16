import React, { useState } from "react";
import ResumePreview from "./components/ResumePreview";
import API from "./api";

function App() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [jobId, setJobId] = useState("");
  const [result, setResult] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  async function uploadResume(e) {
    e.preventDefault();
    if (!file) return alert("Choose a PDF");

    const form = new FormData();
    form.append("resume", file);
    form.append("name", name);
    form.append("email", email);

    const resp = await API.post("/uploadResume", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setCandidateId(resp.data.candidateId);
  }

  async function createJob(e) {
    e.preventDefault();

    const resp = await API.post("/jobs", {
      title: jobTitle,
      description: jobDesc,
    });

    setJobId(resp.data._id);
  }

  async function runMatch() {
    if (!candidateId || !jobId)
      return alert("Need candidateId and jobId");

    const resp = await API.post("/match", {
      candidateId,
      jobId,
    });

    setResult(resp.data);
  }

  async function fetchAnalytics() {
    if (!jobId) return alert("Create a job first demonstrated");

    const resp = await API.get(`/analytics/job/${jobId}`);
    setAnalytics(resp.data);
  }

  function renderSuggestions(raw) {
    if (!raw) return null;

    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return (
        <div className="mt-3">
          <h6>Summary</h6>
          <p>{parsed.summary}</p>

          <h6>Suggestions</h6>
          <ul>
            {parsed.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      );
    } catch {
      return <pre>{raw}</pre>;
    }
  }

  return (
    <>
      {/* Navbar */}
      {/* Hero Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #1e3c72, #2a5298, #0f2027)",
          color: "white",
          padding: "50px 20px",
          marginBottom: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        <div className="container text-center">
          <h1
            style={{
              fontSize: "3.2rem",
              fontWeight: "800",
              letterSpacing: "1px",
              marginBottom: "10px",
              fontFamily:
                "'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
          >
            AI Resume Screener
          </h1>

          <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>
            Smart AI-based Candidate & Job Matching Platform
          </p>
        </div>
      </div>

      <div className="container mb-5">

        {/* Upload Resume */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title">1️⃣ Upload Resume</h5>

            <div className="row g-2 mb-2">
              <div className="col-md-3">
                <input
                  className="form-control"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <input
                  type="file"
                  className="form-control"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <div className="col-md-3">
                <button
                  className="btn btn-primary w-100"
                  onClick={uploadResume}
                >
                  Upload
                </button>
              </div>
            </div>

            {/* {candidateId && (
              <div className="alert alert-success mt-2">
                Candidate saved (ID: {candidateId})
              </div>
            )} */}
            {candidateId && (
              <>
                <p className="text-sm text-gray-600">
                  ✅ Candidate saved (ID: {candidateId})
                </p>

                <ResumePreview candidateId={candidateId} />
              </>
            )}
          </div>
        </div>

        {/* Create Job */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title">2️⃣ Create Job</h5>

            <input
              className="form-control mb-2"
              placeholder="Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />

            <textarea
              rows="4"
              className="form-control"
              placeholder="Job Description"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />

            <div className="mt-3">
              <button
                className="btn btn-success me-2"
                onClick={createJob}
              >
                Create Job
              </button>

              <button
                className="btn btn-secondary"
                onClick={fetchAnalytics}
              >
                View Analytics
              </button>
            </div>

            {jobId && (
              <div className="alert alert-success mt-3">
                Job created (ID: {jobId})
              </div>
            )}
          </div>
        </div>

        {/* Analytics */}
        {analytics && (
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5>📊 Job Analytics</h5>
              <p>
                <strong>Average Score:</strong>{" "}
                {analytics.avgScore?.toFixed(2) || 0}%
              </p>
              <p>
                <strong>Total Candidates:</strong>{" "}
                {analytics.count || 0}
              </p>
            </div>
          </div>
        )}

        {/* Match */}
        <div className="card shadow-sm">
          <div className="card-body">
            <h5>3️⃣ Match</h5>

            <button
              className="btn btn-warning"
              onClick={runMatch}
            >
              Run Match
            </button>

            {result && (
              <div className="alert alert-info mt-3">
                <h6>
                  Match Score:{" "}
                  <span className="text-success">
                    {parseFloat(result.score).toFixed(2)}%
                  </span>
                </h6>

                {renderSuggestions(result.suggestions)}
              </div>
            )}
          </div>
        </div>

      </div>
      {/* Footer */}
      <footer className="bg-dark text-light text-center py-5 mt-7">
        <div className="container">
          © {new Date().getFullYear()} AI Resume Screener • MERN + AI
        </div>
      </footer>
    </>
  );
}

export default App;