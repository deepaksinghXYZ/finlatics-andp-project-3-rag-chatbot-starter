import { useState } from 'react';

export default function TestSearch() {
  const [documentId, setDocumentId] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, query }),
    });

    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Test Vector Search</h1>
      <form onSubmit={handleSearch}>
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
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {results && (
        <pre style={{ marginTop: 20, background: '#eee', padding: 10 }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      )}
    </div>
  );
}