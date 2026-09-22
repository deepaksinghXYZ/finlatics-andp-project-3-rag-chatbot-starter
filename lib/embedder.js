// lib/embedder.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates an embedding vector for a given text snippet
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function getEmbedding(text) {
  const cleanText = text.replace(/\n/g, ' ');
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small', // or 'text-embedding-ada-002'
    input: cleanText,
  });

  return response.data[0].embedding;
}

/**
 * Batch generate embeddings for multiple chunks
 * @param {Array<string>} texts
 * @returns {Promise<Array<number[]>>}
 */
export async function getBatchEmbeddings(texts) {
  const cleanTexts = texts.map((t) => t.replace(/\n/g, ' '));
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: cleanTexts,
  });

  return response.data.map((item) => item.embedding);
}


