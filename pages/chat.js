import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import supabase from '../lib/supabaseClient';

export default function Chat() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { doc } = router.query;

  const [documentId, setDocumentId] = useState(null);
  const [docName, setDocName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [asking, setAsking] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user]);

  useEffect(() => {
    if (doc && user) loadExistingChat(doc);
  }, [doc, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading || !user) return null;

  const loadExistingChat = async (docId) => {
    setLoadingChat(true);

    const { data: docData } = await supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .single();

    if (docData) {
      setDocumentId(docData.id);
      setDocName(docData.filename);
    }

    const { data: history } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('document_id', docId)
      .order('created_at', { ascending: true });

    if (history && history.length > 0) {
      setMessages(history.map((h) => ({ role: h.role, text: h.content })));
    } else {
      setMessages([{ role: 'system', text: `Loaded "${docData?.filename}". Ask me anything about it!` }]);
    }

    setLoadingChat(false);
  };

  const handleUpload = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setUploading(true);
    setMessages([]);

    const formData = new FormData();
    formData.append('file', selected);
    formData.append('userId', user.id);

    const res = await fetch('/api/documents', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.document) {
      setDocumentId(data.document.id);
      setDocName(data.document.filename);
      setMessages([
        { role: 'system', text: `Loaded "${data.document.filename}". Ask me anything about it!` },
      ]);
      router.push(`/chat?doc=${data.document.id}`, undefined, { shallow: true });
    } else {
      alert('Upload failed');
    }
    setUploading(false);
  };

  const saveMessage = async (role, content) => {
    await supabase.from('chat_messages').insert({
      document_id: documentId,
      user_id: user.id,
      role,
      content,
    });
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!input.trim() || !documentId) return;

    const question = input;
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setAsking(true);
    await saveMessage('user', question);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, query: question }),
    });
    const data = await res.json();
    const answer = data.answer || 'Sorry, something went wrong.';

    setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    setAsking(false);
    await saveMessage('assistant', answer);

    await supabase.from('requests').insert({
      user_id: user.id,
      document_id: documentId,
      type: 'chat',
      result: `Q: ${question}\nA: ${answer}`,
    });
  };

  const startNewUpload = () => {
    setDocumentId(null);
    setMessages([]);
    router.push('/chat', undefined, { shallow: true });
  };

  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.title}>Chat</h1>

        {!documentId && !loadingChat && (
          <label style={styles.fileBox}>
            <input type="file" accept=".pdf" onChange={handleUpload} style={{ display: 'none' }} />
            <div style={styles.fileBoxBunny}>🐰</div>
            <div style={styles.fileBoxText}>
              {uploading ? 'Uploading...' : 'Choose your file'}
            </div>
          </label>
        )}

        {loadingChat && <p style={{ color: '#fff' }}>Loading conversation...</p>}

        {documentId && !loadingChat && (
          <div style={styles.chatBox}>
            <div style={styles.chatHeader}>
              📄 {docName}
              <span style={styles.changeFile} onClick={startNewUpload}>
                New file
              </span>
            </div>

            <div style={styles.messages}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.bubble,
                    ...(m.role === 'user' ? styles.bubbleUser : styles.bubbleOther),
                  }}
                >
                  {m.text}
                </div>
              ))}
              {asking && <div style={{ ...styles.bubble, ...styles.bubbleOther }}>Thinking...</div>}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleAsk} style={styles.inputRow}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something about the document..."
                style={styles.input}
              />
              <button type="submit" style={styles.sendButton} disabled={asking}>
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', minHeight: '100vh', fontFamily: "'Comfortaa', sans-serif" },
  main: {
    flex: 1,
    background: 'linear-gradient(135deg, #7a2e3a 0%, #b8607d 50%, #e8a0b4 100%)',
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    color: '#ffd6e8',
    fontFamily: "'Lilita One', sans-serif",
    fontSize: '38px',
    marginBottom: '28px',
    textShadow: '0 4px 12px rgba(122,46,58,0.5)',
    textAlign: 'center',
  },
  fileBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff9fb',
    border: '2px dashed #e8a0b4',
    borderRadius: '14px',
    padding: '48px',
    cursor: 'pointer',
    textAlign: 'center',
    width: '100%',
    maxWidth: '560px',
  },
  fileBoxBunny: { fontSize: '44px', marginBottom: '10px' },
  fileBoxText: { color: '#7a2e3a', fontSize: '16px', fontWeight: 'bold' },
  chatBox: {
    background: '#fff',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    height: '520px',
    overflow: 'hidden',
  },
  chatHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #f0d9e0',
    color: '#7a2e3a',
    fontWeight: 'bold',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeFile: {
    color: '#b8607d',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 'normal',
    textDecoration: 'underline',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  bubble: {
    padding: '10px 14px',
    borderRadius: '14px',
    fontSize: '14px',
    maxWidth: '80%',
  },
  bubbleUser: {
    background: '#7a2e3a',
    color: '#fff',
    alignSelf: 'flex-end',
  },
  bubbleOther: {
    background: '#fce4ec',
    color: '#333',
    alignSelf: 'flex-start',
  },
  inputRow: {
    display: 'flex',
    borderTop: '1px solid #f0d9e0',
    padding: '12px',
    gap: '8px',
  },
  input: {
    flex: 1,
    border: '1px solid #e8a0b4',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: "'Comfortaa', sans-serif",
  },
  sendButton: {
    background: '#b8607d',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
};