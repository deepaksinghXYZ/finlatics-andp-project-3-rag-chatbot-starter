import { useAuth } from '../lib/AuthContext';
import Sidebar from '../components/Sidebar';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user]);

  if (loading || !user) return null;

  const features = [
    { title: 'Quiz', desc: 'Turn your PDF into practice questions' },
    { title: 'Summary', desc: 'Get a quick summary of your document' },
    { title: 'Flashcard', desc: 'Study with auto-generated flashcards' },
  ];

  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.heroBunny}>🐰</div>
        <h1 style={styles.title}>Hello, Welcome to Slideyy</h1>
        <p style={styles.subtitle}>
          Turn your documents into quizzes, summaries, and flashcards
        </p>

        <button style={styles.ctaButton} onClick={() => router.push('/request')}>
          Click Request
        </button>

        <div style={styles.cardGrid}>
          {features.map((f) => (
            <div key={f.title} style={styles.card}>
              <h3 style={styles.cardTitle}>{f.title}</h3>
              <p style={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Comfortaa', sans-serif",
  },
  main: {
    flex: 1, 
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center',
  },
  heroBunny: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  title: {
    color: '#fffd6e8',
    fontSize: '42px',
    fontFamily: "'Lilita One', sans-serif",
    letterSpacing: '1px',
    marginBottom: '12px',
    textShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
  subtitle: {
    color: '#c04475',
    fontSize: '16px',
    marginBottom: '32px',
    textShadow: '0 2px 8px rgba(0,0,0,0.4)',
  },
  ctaButton: {
    background: '#fff',
    color: '#7a2e3a',
    border: 'none',
    padding: '16px 40px',
    borderRadius: '30px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: "'Comfortaa', sans-serif",
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
    marginBottom: '40px',
  },
  cardGrid: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    padding: '24px',
    width: '180px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
  cardTitle: {
    color: '#7a2e3a',
    fontSize: '18px',
    marginBottom: '6px',
    fontFamily: "'Lilita One', sans-serif",
  },
  cardDesc: {
    color: '#a06070',
    fontSize: '13px',
  },
};

