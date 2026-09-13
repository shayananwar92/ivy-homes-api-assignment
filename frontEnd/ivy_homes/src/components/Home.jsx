import { useEffect, useState } from 'react';
import { fetchAllPages } from '../api';
import { useAuth } from '../context/AuthContext';
import HeroStats from './HeroStats';
import PremiumCollection from './PremiumCollection';

export default function Home() {
  const { token } = useAuth();

  const [listings, setListings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setListings([]);
      setProjects([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadHomeData = async () => {
      try {
        setLoading(true);

        const [listingData, projectData] = await Promise.all([
          fetchAllPages('/v1/listings'),
          fetchAllPages('/v1/projects')
        ]);

        const uniqueListings = Array.from(
          new Map(
            listingData.map((listing) => [
              listing.listing_id,
              listing
            ])
          ).values()
        );

        const uniqueProjects = Array.from(
          new Map(
            projectData.map((project) => [
              project.project_id,
              project
            ])
          ).values()
        );

        if (!cancelled) {
          setListings(uniqueListings);
          setProjects(uniqueProjects);
        }
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHomeData();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const getTopProperties = (bhk) =>
    listings
      .filter(
        (property) =>
          property.is_live === true &&
          Number(property.price) > 0 &&
          Number(property.bedroom) === bhk
      )
      .sort(
        (a, b) => Number(b.price) - Number(a.price)
      )
      .slice(0, 3);

  const activeCount = listings.filter(
    (listing) =>
      listing.is_live === true &&
      Number(listing.price) > 0
  ).length;

  if (loading) {
    return <div className="home-state">Loading Ivy Homes...</div>;
  }

  return (
    <div className="home-page">
      <HeroStats
        uniqueCount={listings.length}
        projectsCount={projects.length}
        activeCount={activeCount}
        loggedIn={Boolean(token)}
      />

      {token && (
        <>
          <PremiumCollection
            title="Premium 4 BHK Estates"
            properties={getTopProperties(4)}
          />

          <PremiumCollection
            title="Premium 3 BHK Residences"
            properties={getTopProperties(3)}
          />

          <PremiumCollection
            title="Premium 2 BHK Apartments"
            properties={getTopProperties(2)}
          />
        </>
      )}
    </div>
  );
}