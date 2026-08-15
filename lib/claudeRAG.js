import Groq from 'groq-sdk';
import { searchSimilarChunks } from './vectorSearch';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function answerWithContext(query, documentId) {
  // 1. Cari chunk yang relevan
  const chunks = await searchSimilarChunks(query, documentId, 5);

  // 2. Gabungin jadi satu teks konteks
  const context = chunks
    .map((c, i) => `[Source ${i + 1}]\n${c.content}`)
    .join('\n\n');

  // 3. Kirim ke Groq dengan konteks itu
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: `Answer the question based only on the following context from a document. If the answer isn't in the context, say so.

Context:
${context}

Question: ${query}`,
      },
    ],
  });

  return {
    answer: completion.choices[0].message.content,
    sources: chunks,
  };
}