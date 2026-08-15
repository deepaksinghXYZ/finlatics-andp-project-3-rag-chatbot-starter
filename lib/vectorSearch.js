// Demo vector search module
import supabase from './db';
import { getEmbedding } from './embedder';

export async function searchSimilarChunks(query, documentId, matchCount = 5) {
  const queryEmbedding = await getEmbedding(query);

  const { data, error } = await supabase.rpc('match_embeddings', {
    query_embedding: queryEmbedding,
    match_document_id: documentId,
    match_count: matchCount,
  });

  if (error) {
    console.error('Vector search error:', error);
    throw error;
  }

  return data;
}
 