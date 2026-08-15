import { useState } from 'react';

export default function TestChat() {
  const [documentId, setDocumentId] = useState('');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, query }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Test Chat with Claude</h1>
      <form onSubmit={handleAsk}>
        <div>
          <label>Document ID: </label>
          <input
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            style={{ width: 400 }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Question: </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 400 }}
          />
        </div>
        <button type="submit" style={{ marginTop: 10 }}>
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>
      {result?.answer && (
        <div style={{ marginTop: 20, background: '#eee', padding: 15 }}>
          <strong>Answer:</strong>
          <p>{result.answer}</p>
        </div>
      )}
    </div>
  );
}