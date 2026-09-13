import { Link } from 'react-router-dom';

export default function HeroStats({
  uniqueCount,
  projectsCount,
  activeCount,
  loggedIn
}) {
  return (
    <section className="hero-stats">
      <p className="hero-kicker">IVY HOMES · HYDERABAD</p>

      <h1>Find your next home.</h1>

      <p className="hero-description">
        Explore properties, rentals and builder projects across Hyderabad.
      </p>

      {loggedIn ? (
        <div className="stats-row">
          <div>
            <h2>{uniqueCount}</h2>
            <p>Properties</p>
          </div>

          <div>
            <h2>{projectsCount}</h2>
            <p>Projects</p>
          </div>

          <div>
            <h2>{activeCount}</h2>
            <p>Active Listings</p>
          </div>
        </div>
      ) : (
        <div className="hero-cta">
          <p>Sign in to view live property data.</p>
          <Link to="/login" className="hero-login-btn">
            Sign in →
          </Link>
        </div>
      )}
    </section>
  );
}