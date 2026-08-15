import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import supabase from '../lib/supabaseClient';

export default function Request() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { doc } = router.query;

  const [file, setFile] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [docName, setDocName] = useState('');
  const [type, setType] = useState('quiz');
  const [status, setStatus] = useState('idle');
  const [rawResult, setRawResult] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [flashcardData, setFlashcardData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user]);

  useEffect(() => {
    if (doc && user) loadExistingDoc(doc);
  }, [doc, user]);

  if (loading || !user) return null;

  const loadExistingDoc = async (docId) => {
    const { data } = await supabase.from('documents').select('*').eq('id', docId).single();
    if (data) {
      setDocumentId(data.id);
      setDocName(data.filename);
    }
  };

  const resetResults = () => {
    setRawResult('');
    setQuizData(null);
    setFlashcardData(null);
    setSelectedAnswers({});
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    resetResults();

    let docId = documentId;

    if (!docId) {
      if (!file) return alert('Please choose a PDF first');

      setStatus('uploading');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const uploadRes = await fetch('/api/documents', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadData.document) {
        setStatus('idle');
        return alert('Upload failed');
      }
      docId = uploadData.document.id;
      setDocumentId(docId);
      setDocName(uploadData.document.filename);
    }

    setStatus('generating');
    const genRes = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: docId, userId: user.id, type }),
    });
    const genData = await genRes.json();

    if (genData.request) {
      const resultText = genData.request.result;

      if (type === 'quiz' || type === 'flashcard') {
        try {
          const cleaned = resultText.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (type === 'quiz') setQuizData(parsed);
          else setFlashcardData(parsed);
        } catch {
          setRawResult(resultText);
        }
      } else {
        setRawResult(resultText);
      }
    }
    setStatus('done');
  };

  const handleAnswer = (qIndex, oIndex) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: oIndex }));
  };

  const startNewUpload = () => {
    setDocumentId(null);
    setDocName('');
    setFile(null);
    resetResults();
    router.push('/request', undefined, { shallow: true });
  };

  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.title}>Make a Request</h1>

        <form onSubmit={handleGenerate} style={styles.form}>
          {!documentId ? (
            <label style={styles.fileBox}>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <div style={styles.fileBoxBunny}>🐰</div>
              <div style={styles.fileBoxText}>
                {file ? file.name : 'Choose your file'}
              </div>
            </label>
          ) : (
            <div style={styles.existingDoc}>
              📄 {docName}
              <span style={styles.changeFile} onClick={startNewUpload}>
                Use a different file
              </span>
            </div>
          )}

          <div style={styles.typeSelector}>
            {['quiz', 'summary', 'flashcard'].map((t) => (
              <div
                key={t}
                onClick={() => setType(t)}
                style={{
                  ...styles.typeOption,
                  ...(type === t ? styles.typeOptionActive : {}),
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </div>
            ))}
          </div>

          <button
            type="submit"
            style={styles.button}
            disabled={status === 'uploading' || status === 'generating'}
          >
            {status === 'uploading' && 'Uploading...'}
            {status === 'generating' && 'Generating...'}
            {(status === 'idle' || status === 'done') && 'Generate'}
          </button>
        </form>

        {quizData && (
          <div style={styles.resultBox}>
            <h3 style={styles.resultTitle}>Quiz</h3>
            {quizData.map((q, qIndex) => (
              <div key={qIndex} style={styles.quizQuestion}>
                <p style={styles.quizQuestionText}>
                  {qIndex + 1}. {q.question}
                </p>
                {q.options.map((opt, oIndex) => {
                  const isSelected = selectedAnswers[qIndex] === oIndex;
                  const isCorrect = oIndex === q.correctIndex;
                  const hasAnswered = selectedAnswers[qIndex] !== undefined;

                  let bg = '#fff';
                  if (hasAnswered && isSelected && isCorrect) bg = '#c8f7c5';
                  if (hasAnswered && isSelected && !isCorrect) bg = '#ffc9c9';
                  if (hasAnswered && !isSelected && isCorrect) bg = '#e6ffe6';

                  return (
                    <div
                      key={oIndex}
                      onClick={() => !hasAnswered && handleAnswer(qIndex, oIndex)}
                      style={{ ...styles.quizOption, background: bg }}
                    >
                      {opt}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {flashcardData && (
          <div style={styles.resultBox}>
            <h3 style={styles.resultTitle}>Flashcards</h3>
            <div style={styles.flashcardGrid}>
              {flashcardData.map((f, i) => (
                <FlashcardItem key={i} front={f.front} back={f.back} />
              ))}
            </div>
          </div>
        )}

        {rawResult && (
          <div style={styles.resultBox}>
            <h3 style={styles.resultTitle}>Result</h3>
            <pre style={styles.resultText}>{rawResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

function FlashcardItem({ front, back }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div onClick={() => setFlipped(!flipped)} style={styles.flashcard}>
      {flipped ? back : front}
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
  form: {
    background: '#fff',
    padding: '36px',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '560px',
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
    marginBottom: '20px',
    cursor: 'pointer',
    textAlign: 'center',
  },
  fileBoxBunny: { fontSize: '44px', marginBottom: '10px' },
  fileBoxText: { color: '#7a2e3a', fontSize: '16px', fontWeight: 'bold' },
  existingDoc: {
    background: '#fff9fb',
    border: '1px solid #e8a0b4',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px',
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
  typeSelector: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px',
    justifyContent: 'center',
  },
  typeOption: {
    padding: '10px 18px',
    borderRadius: '10px',
    border: '1px solid #e8a0b4',
    color: '#7a2e3a',
    cursor: 'pointer',
    fontSize: '14px',
  },
  typeOptionActive: {
    background: '#7a2e3a',
    color: '#fff',
  },
  button: {
    background: '#b8607d',
    color: '#fff',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    width: '100%',
  },
  resultBox: {
    background: '#fff',
    marginTop: '24px',
    padding: '32px',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '560px',
  },
  resultTitle: {
    color: '#7a2e3a',
    fontFamily: "'Lilita One', sans-serif",
    marginBottom: '16px',
    fontSize: '22px',
    textAlign: 'center',
  },
  resultText: {
    whiteSpace: 'pre-wrap',
    fontFamily: "'Comfortaa', sans-serif",
    fontSize: '14px',
    color: '#333',
  },
  quizQuestion: { marginBottom: '20px' },
  quizQuestionText: { color: '#7a2e3a', fontWeight: 'bold', marginBottom: '8px' },
  quizOption: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e8a0b4',
    marginBottom: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
  },
  flashcardGrid: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  flashcard: {
    background: '#fce4ec',
    border: '1px solid #e8a0b4',
    borderRadius: '12px',
    padding: '20px',
    width: '160px',
    minHeight: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#7a2e3a',
  },
};