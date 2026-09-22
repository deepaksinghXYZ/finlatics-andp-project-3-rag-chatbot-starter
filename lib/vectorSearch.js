// lib/vectorSearch.js
import { supabase } from './supabaseClient';
import { getEmbedding } from './embedder';

/**
 * Searches the pgvector database for the top 5 matching text chunks
 * @param {string} query - User question / prompt
 * @param {string} documentId - Document filter (optional)
 * @param {number} topK - Number of chunks (default 5)
 * @returns {Promise<Array<any>>}
 */
export async function searchSimilarChunks(query, documentId = null, topK = 5) {
  const queryEmbedding = await getEmbedding(query);

  const rpcParams = {
    query_embedding: queryEmbedding,
    match_count: topK,
  };

  if (documentId) {
    rpcParams.filter_document_id = documentId;
  }

  // Calls the PostgreSQL function created in enable-pgvector.sql
  const { data, error } = await supabase.rpc('match_documents', rpcParams);

  if (error) {
    console.error('Vector search error:', error);
    throw error;
  }

  return data || [];
}

