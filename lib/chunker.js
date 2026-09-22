// lib/chunker.js
import { encode, decode } from 'gpt-tokenizer';

/**
 * Splits document text into chunks of 500 tokens with 50-token overlap
 * @param {string} text - Extracted document text
 * @param {number} chunkSize - Target token size (500)
 * @param {number} chunkOverlap - Overlap token size (50)
 * @returns {Array<{text: string, chunkIndex: number, tokenCount: number}>}
 */
export function chunkText(text, chunkSize = 500, chunkOverlap = 50) {
  if (!text || typeof text !== 'string') return [];

  const tokens = encode(text);
  const chunks = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < tokens.length) {
    const endIndex = Math.min(startIndex + chunkSize, tokens.length);
    const chunkTokens = tokens.slice(startIndex, endIndex);
    const chunkString = decode(chunkTokens);

    chunks.push({
      text: chunkString.trim(),
      chunkIndex,
      tokenCount: chunkTokens.length,
    });

    chunkIndex++;
    startIndex += chunkSize - chunkOverlap;

    if (endIndex === tokens.length) break;
  }

  return chunks;
}

