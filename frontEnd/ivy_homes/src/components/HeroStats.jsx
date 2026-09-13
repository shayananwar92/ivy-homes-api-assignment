export default function HeroStats({ uniqueCount, projectsCount, activeCount }) {
  return (
    <section className="hero-stats">
      <h1>Find Your Next Home in Hyderabad</h1>
      <p>Explore properties across Hyderabad.</p>
      
      <div className="stats-row">
        <div>
          <h2>{uniqueCount}</h2>
          <p>Exclusive Properties</p>
        </div>
        <div>
          <h2>{projectsCount}</h2>
          <p>Builder Projects</p>
        </div>
        <div>
          <h2>{activeCount}</h2>
          <p>Active Listings</p>
        </div>
      </div>
    </section>
  );
}