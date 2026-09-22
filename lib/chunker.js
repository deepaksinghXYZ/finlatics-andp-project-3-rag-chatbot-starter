/**
 * Splits document text into chunks of ~500 tokens with ~50 token overlap.
 * 1 token is approximately 0.75 words (or ~4 characters).
 * 500 tokens ≈ 375 words; 50 tokens ≈ 38 words.
 *
 * @param {string} text - Raw extracted document text
 * @param {number} chunkSizeWords - Words per chunk (~375 words)
 * @param {number} chunkOverlapWords - Overlap in words (~38 words)
 * @returns {Array<{text: string, chunkIndex: number, tokenCount: number}>}
 */
export function chunkText(text, chunkSizeWords = 375, chunkOverlapWords = 38) {
  if (!text || typeof text !== 'string') return [];

  // Split text by whitespace into words
  const words = text.trim().split(/\s+/);
  if (words.length === 0 || words[0] === '') return [];

  const chunks = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSizeWords, words.length);
    const chunkWords = words.slice(startIndex, endIndex);
    const chunkString = chunkWords.join(' ');

    chunks.push({
      text: chunkString,
      chunkIndex,
      tokenCount: Math.round(chunkWords.length / 0.75), // approximate token count
    });

    chunkIndex++;
    startIndex += chunkSizeWords - chunkOverlapWords;

    if (endIndex === words.length) break;
  }

  return chunks;
}


