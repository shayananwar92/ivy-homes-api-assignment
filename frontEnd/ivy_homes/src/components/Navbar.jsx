import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Ivy Homes</Link>
      </div>

      <div className="nav-links">
        <Link to="/search">Directory</Link>

        <Link to="/rentals">Rentals</Link>

        <Link to="/projects">Projects</Link>

        <Link to="/insights">Insights</Link>

        {user && (
          <Link to="/saved">Saved</Link>
        )}

        {user ? (
          <>
            <span className="user-email">
              {user}
            </span>

            <button
              onClick={logout}
              className="accent-btn logout-btn"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="accent-btn login-btn"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}