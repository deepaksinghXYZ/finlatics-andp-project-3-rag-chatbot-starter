import { pipeline } from '@xenova/transformers';

let embedderPipeline = null;

async function getEmbedder() {
  if (!embedderPipeline) {
    embedderPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }
  return embedderPipeline;
}

export async function getEmbedding(text) {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}