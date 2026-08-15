import { answerWithContext } from '../../lib/claudeRAG';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { documentId, query } = req.body;

  if (!documentId || !query) {
    return res.status(400).json({ error: 'documentId and query are required' });
  }

  try {
    const result = await answerWithContext(query, documentId);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to get answer' });
  }
}
