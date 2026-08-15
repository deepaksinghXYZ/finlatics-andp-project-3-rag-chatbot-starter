import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/AuthContext';

export default function Sidebar() {
  const router = useRouter();
  const { logout } = useAuth();

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Request', path: '/request' },
    { label: 'Chat', path: '/chat'}, 
    { label: 'History', path: '/history' },
    { label: 'Account', path: '/account' },
  ];

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>Slideyy</h2>
      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path} style={{ textDecoration: 'none' }}>
            <div
              style={{
                ...styles.navItem,
                ...(router.pathname === item.path ? styles.navItemActive : {}),
              }}
            >
              {item.label}
            </div>
          </Link>
        ))}
      </nav>
      <button onClick={logout} style={styles.logoutButton}>
        Log Out
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '220px',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #7a2e3a 0%, #b8607d 100%)',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Comfortaa', sans-serif",
  },
  logo: {
    color: '#fff',
    fontSize: '24px',
    marginBottom: '32px',
    textAlign: 'center',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navItem: {
    color: '#7a2e3a',
    padding: '12px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    border: '1px solid #f0d9e0',
    background: '#ffffff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
  },
  navItemActive: {
    background: '#fce4ec',
    color: '#7a2e3a',
    fontWeight: 'bold',
    border: '1px solid #e8a0b4',
  },
  logoutButton: {
    background: 'rgba(255, 255, 255, 0.15)',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
  },
};