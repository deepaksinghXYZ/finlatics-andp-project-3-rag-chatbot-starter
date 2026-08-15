import { useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';

export default function Account() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user]);

  if (loading || !user) return null;

  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.title}>Account</h1>

        <div style={styles.card}>
          <div style={styles.avatar}>🐰</div>
          <p style={styles.email}>{user.email}</p>
          <p style={styles.since}>
            Member since {new Date(user.created_at).toLocaleDateString()}
          </p>

          <button onClick={logout} style={styles.logoutButton}>
            Log Out
          </button>
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
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  avatar: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  email: {
    color: '#7a2e3a',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '6px',
  },
  since: {
    color: '#a06070',
    fontSize: '13px',
    marginBottom: '24px',
  },
  logoutButton: {
    background: '#b8607d',
    color: '#fff',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
};