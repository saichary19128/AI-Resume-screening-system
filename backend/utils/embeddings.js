// const OpenAI = require('openai');

// const USE_MOCK = process.env.MOCK_OPENAI === 'true';

// let client = null;
// if (!USE_MOCK) {
//   client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// }

// /* =========================
//    Mock embedding generator
// ========================= */
// function pseudoEmbedding(text, dim = 1536) {
//   const emb = new Array(dim);
//   let h = 2166136261 >>> 0;

//   for (let i = 0; i < text.length; i++) {
//     h ^= text.charCodeAt(i);
//     h = Math.imul(h, 16777619) >>> 0;
//   }

//   for (let i = 0; i < dim; i++) {
//     const val = (((h >>> (i % 24)) & 0xff) - 128) / 128;
//     emb[i] = val;
//   }

//   return emb;
// }

// /* =========================
//    Get embedding
// ========================= */
// async function getEmbedding(text) {
//   if (!text) return [];

//   if (USE_MOCK) {
//     return pseudoEmbedding(text);
//   }

//   const resp = await client.embeddings.create({
//     model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
//     input: text,
//   });

//   return resp.data[0].embedding;
// }

// /* =========================
//    Cosine similarity
// ========================= */
// function cosineSimilarity(vecA, vecB) {
//   if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

//   let dot = 0,
//     magA = 0,
//     magB = 0;

//   for (let i = 0; i < vecA.length; i++) {
//     dot += vecA[i] * vecB[i];
//     magA += vecA[i] * vecA[i];
//     magB += vecB[i] * vecB[i];
//   }

//   magA = Math.sqrt(magA);
//   magB = Math.sqrt(magB);

//   if (magA === 0 || magB === 0) return 0;

//   const similarity = dot / (magA * magB);

//   // Convert from -1..1 to 0..1
//   return (similarity + 1) / 2;
// }

// module.exports = { getEmbedding, cosineSimilarity };

const OpenAI = require('openai');

const USE_MOCK = process.env.MOCK_OPENAI === 'true';

let client = null;
if (!USE_MOCK) {
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/* ---------- Better Mock embedding ---------- */
/* Creates word-sensitive deterministic vectors */
function pseudoEmbedding(text, dim = 1536) {
  const emb = new Array(dim).fill(0);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  for (const word of words) {
    let h = 2166136261 >>> 0;

    for (let i = 0; i < word.length; i++) {
      h ^= word.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }

    const index = h % dim;
    emb[index] += 1;
  }

  /* normalize vector */
  let mag = Math.sqrt(emb.reduce((s, v) => s + v * v, 0));
  if (mag === 0) return emb;

  return emb.map(v => v / mag);
}

/* ---------- Embedding ---------- */
async function getEmbedding(text) {
  if (!text) return [];

  if (USE_MOCK) {
    return pseudoEmbedding(text);
  }

  const resp = await client.embeddings.create({
    model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    input: text,
  });

  return resp.data[0].embedding;
}

/* ---------- Cosine similarity ---------- */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dot = 0,
    magA = 0,
    magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  if (magA === 0 || magB === 0) return 0;

  const similarity = dot / (magA * magB);

  // convert -1..1 → 0..1
  return ((similarity + 1) / 2) * 100;
}

module.exports = { getEmbedding, cosineSimilarity };