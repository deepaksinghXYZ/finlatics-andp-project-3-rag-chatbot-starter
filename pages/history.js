import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import supabase from '../lib/supabaseClient';

export default function History() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [requestsByDoc, setRequestsByDoc] = useState({});
  const [fetching, setFetching] = useState(true);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [expandedReq, setExpandedReq] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user]);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setFetching(true);
    console.log('=== DEBUG user.id ===', user?.id);

    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    console.log('=== DEBUG docs ===', docs);
    console.log('=== DEBUG docsError ===', docsError);

    if (docsError || !docs) {
      setFetching(false);
      return;
    }

    const { data: requests, error: reqError } = await supabase
      .from('requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    console.log('=== DEBUG requests ===', requests);
    console.log('=== DEBUG reqError ===', reqError);

    const grouped = {};
    (requests || []).forEach((r) => {
      if (!grouped[r.document_id]) grouped[r.document_id] = [];
      grouped[r.document_id].push(r);
    });

    setDocuments(docs);
    setRequestsByDoc(grouped);
    setFetching(false);
  };

  if (loading || !user) return null;

  const typeLabel = { quiz: 'Quiz', summary: 'Summary', flashcard: 'Flashcard', chat: 'Chat' };

  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.title}>History</h1>

        {fetching && <p style={styles.emptyText}>Loading...</p>}

        {!fetching && documents.length === 0 && (
          <p style={styles.emptyText}>No documents yet. Go upload one! 🐰</p>
        )}

        <div style={styles.list}>
          {documents.map((doc) => {
            const docRequests = requestsByDoc[doc.id] || [];
            const isDocExpanded = expandedDoc === doc.id;

            return (
              <div key={doc.id} style={styles.docCard}>
                <div style={styles.docHeader}>
                  <div
                    style={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => setExpandedDoc(isDocExpanded ? null : doc.id)}
                  >
                    <p style={styles.docName}>{doc.filename}</p>
                    <p style={styles.docMeta}>
                      Uploaded {new Date(doc.created_at).toLocaleDateString()} · {docRequests.length} activity
                    </p>
                  </div>
                  <span style={styles.actionBtn} onClick={() => router.push(`/chat?doc=${doc.id}`)}>
                    Chat
                  </span>
                  <span style={styles.actionBtn} onClick={() => router.push(`/request?doc=${doc.id}`)}>
                    Request
                  </span>
                  <span style={styles.chevron}>{isDocExpanded ? '▲' : '▼'}</span>
                </div>

                {isDocExpanded && (
                  <div style={styles.activityList}>
                    {docRequests.length === 0 && (
                      <p style={{ color: '#a06070', fontSize: '13px' }}>No activity yet.</p>
                    )}
                    {docRequests.map((req) => (
                      <div key={req.id} style={styles.activityItem}>
                        <div
                          style={styles.activityHeader}
                          onClick={() =>
                            setExpandedReq(expandedReq === req.id ? null : req.id)
                          }
                        >
                          <span style={styles.badge}>{typeLabel[req.type] || req.type}</span>
                          <span style={styles.date}>
                            {new Date(req.created_at).toLocaleString()}
                          </span>
                        </div>
                        {expandedReq === req.id && (
                          <pre style={styles.resultText}>{req.result}</pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
  emptyText: { color: '#fff', fontSize: '15px' },
  list: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  docCard: {
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  docHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 22px',
  },
  docName: {
    color: '#7a2e3a',
    fontWeight: 'bold',
    fontSize: '15px',
    marginBottom: '4px',
  },
  docMeta: {
    color: '#a06070',
    fontSize: '12px',
  },
  actionBtn: {
    background: '#fce4ec',
    color: '#7a2e3a',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginRight: '8px',
    whiteSpace: 'nowrap',
  },
  chevron: { color: '#a06070', cursor: 'pointer' },
  activityList: {
    borderTop: '1px solid #f0d9e0',
    padding: '10px 22px 18px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  activityItem: {
    background: '#fff9fb',
    borderRadius: '10px',
    padding: '10px 14px',
  },
  activityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  badge: {
    background: '#fce4ec',
    color: '#7a2e3a',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  date: { color: '#a06070', fontSize: '11px' },
  resultText: {
    whiteSpace: 'pre-wrap',
    marginTop: '10px',
    fontFamily: "'Comfortaa', sans-serif",
    fontSize: '13px',
    color: '#333',
  },
};