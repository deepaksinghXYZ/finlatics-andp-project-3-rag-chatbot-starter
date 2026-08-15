import { useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
      }
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to Slideyy</h1>
        <p style={styles.subtitle}>
          {isSignup ? 'Create your account' : 'Log in to continue'}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <p style={styles.switchText}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span style={styles.switchLink} onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? 'Log In' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #7a2e3a 0%, #b8607d 50%, #e8a0b4 100%)',
    fontFamily: "'Comfortaa', sans-serif",
  },
  card: {
    background: '#fff',
    padding: '40px',
    borderRadius: '16px',
    width: '360px',
    boxShadow: '0 10px 40px rgba(122, 46, 58, 0.3)',
    textAlign: 'center',
  },
  title: {
    color: '#7a2e3a',
    marginBottom: '4px',
    fontSize: '28px',
    fontFamily: "'Lilita One', sans-serif",
    fontWeight: 700,
  },
  subtitle: {
    color: '#a06070',
    marginBottom: '24px',
    fontSize: '14px',
    fontFamily: "'Comfortaa', sans-serif",
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '12px',
    border: '1px solid #e8a0b4',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: "'Comfortaa', sans-serif",
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#b8607d',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
    fontFamily: "'Comfortaa', sans-serif",
  },
  error: {
    color: '#c0392b',
    fontSize: '13px',
    marginBottom: '10px',
    fontFamily: "'Comfortaa', sans-serif",
  },
  switchText: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#a06070',
    fontFamily: "'Comfortaa', sans-serif",
  },
  switchLink: {
    color: '#7a2e3a',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};