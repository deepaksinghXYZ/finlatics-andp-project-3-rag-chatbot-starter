// lib/claudeRAG.js
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Streams Claude's response over SSE with citation instructions
 * @param {string} query - User query
 * @param {Array<any>} contextChunks - Top 5 retrieved chunks
 * @param {any} res - Next.js HTTP response object (SSE)
 */
export async function streamClaudeResponse(query, contextChunks, res) {
  // Format top-5 chunks as context
  const contextString = contextChunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1} - Chunk #${chunk.chunk_index || index + 1}]:\n${chunk.content || chunk.text}`
    )
    .join('\n\n');

  const systemPrompt = `You are a helpful and accurate document assistant.
Answer the user's questions based ONLY on the provided context below.
Always include citations referencing the source when you state facts (e.g., "[Source 1]").
If the context does not contain the answer, state clearly that the answer cannot be found in the document.

--- CONTEXT ---
${contextString}
----------------`;

  // Set headers for Server-Sent Events (SSE)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: query }],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta?.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Claude streaming error:', err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
}

