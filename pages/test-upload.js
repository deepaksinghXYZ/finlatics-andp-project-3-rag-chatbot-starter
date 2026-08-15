import { useState } from 'react';

export default function TestUpload() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file) {
      alert('Please choose a file first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/documents', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Test Upload PDF</h1>
      <form onSubmit={handleUpload}>
        <input type="file" name="file" accept=".pdf" />
        <button type="submit">
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {result && (
        <pre style={{ marginTop: 20, background: '#eee', padding: 10 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}