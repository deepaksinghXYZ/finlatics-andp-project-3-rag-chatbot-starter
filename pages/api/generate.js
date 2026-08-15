import Groq from 'groq-sdk';
import supabase from '../../lib/db';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PROMPTS = {
  quiz: `Create 5 multiple-choice quiz questions based on the following document content.
Respond ONLY with valid JSON in this exact format, no extra text:
[
  { "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0 }
]`,
  summary: 'Write a clear, concise summary of the following document content, covering the main points.',
  flashcard: `Create 8 flashcards based on the following document content.
Respond ONLY with valid JSON in this exact format, no extra text:
[
  { "front": "question or term", "back": "answer or explanation" }
]`,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { documentId, userId, type } = req.body;

  if (!documentId || !userId || !type || !PROMPTS[type]) {
    return res.status(400).json({ error: 'documentId, userId, and a valid type are required' });
  }

  try {
    const { data: chunks, error: chunksError } = await supabase
      .from('embeddings')
      .select('content')
      .eq('document_id', documentId)
      .limit(10);

    if (chunksError || !chunks || chunks.length === 0) {
      return res.status(404).json({ error: 'No content found for this document' });
    }

    const fullContext = chunks.map((c) => c.content).join('\n\n');

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `${PROMPTS[type]}\n\nDocument content:\n${fullContext}`,
        },
      ],
    });

    const result = completion.choices[0].message.content;

    const { data: saved, error: saveError } = await supabase
      .from('requests')
      .insert({ user_id: userId, document_id: documentId, type, result })
      .select()
      .single();

    if (saveError) {
      console.error(saveError);
      return res.status(500).json({ error: 'Failed to save request' });
    }

    return res.status(200).json({ request: saved });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate content' });
  }
}