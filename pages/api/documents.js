import formidable from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import supabase from '../../lib/db';
import { chunkText } from '../../lib/chunker';
import { getEmbedding } from '../../lib/embedder';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({});

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to parse file' });
    }

    const file = files.file?.[0] || files.file;
    console.log('=== DEBUG fields ===', fields);
    const userId = fields.userId?.[0] || fields.userId;
    console.log('=== DEBUG userId ===', userId);

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = fs.readFileSync(file.filepath);
    const pdfData = await pdfParse(fileBuffer);
    const fullText = pdfData.text;

    const chunks = chunkText(fullText);

    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({ filename: file.originalFilename, user_id: userId || null })
      .select()
      .single();

    if (docError) {
      console.error(docError);
      return res.status(500).json({ error: 'Failed to save document' });
    }

    let savedCount = 0;
    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);

      const { error: embError } = await supabase.from('embeddings').insert({
        document_id: doc.id,
        content: chunk,
        embedding: embedding,
      });

      if (embError) {
        console.error('Embedding save error:', embError);
      } else {
        savedCount++;
      }
    }

    return res.status(200).json({
      document: doc,
      totalChunks: chunks.length,
      savedEmbeddings: savedCount,
    });
  });
}