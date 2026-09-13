import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  const navClass = ({ isActive }) =>
    `nav-link ${isActive ? 'active' : ''}`;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <NavLink to="/" className={navClass} end>
          Ivy Homes
        </NavLink>
      </div>

      <div className="nav-links">
        <NavLink to="/search" className={navClass}>
          Directory
        </NavLink>

        <NavLink to="/rentals" className={navClass}>
          Rentals
        </NavLink>

        <NavLink to="/projects" className={navClass}>
          Projects
        </NavLink>

        <NavLink to="/insights" className={navClass}>
          Insights
        </NavLink>

        {user && (
          <NavLink to="/saved" className={navClass}>
            Saved
          </NavLink>
        )}

        {user ? (
          <>
            <span className="user-email">{user}</span>

            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login" className="login-btn">
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}