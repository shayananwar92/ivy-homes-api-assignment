import { useEffect, useState } from 'react';
import { fetchAllPages } from '../api';
import HeroStats from './HeroStats';
import PremiumCollection from './PremiumCollection';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadHomeData() {
      try {
        const [listingData, projectData] = await Promise.all([
          fetchAllPages('/v1/listings'),
          fetchAllPages('/v1/projects')
        ]);

        const uniqueListings = Array.from(
          new Map(
            listingData.map(listing => [
              listing.listing_id,
              listing
            ])
          ).values()
        );

        const uniqueProjects = Array.from(
          new Map(
            projectData.map(project => [
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
        console.error(
          'Failed to load homepage data:',
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      cancelled = true;
    };
  }, []);

  const getTopProperties = bhkCount => {
    return listings
      .filter(
        property =>
          property.is_live === true &&
          Number(property.price) > 0 &&
          Number(property.bedroom) === bhkCount
      )
      .sort(
        (a, b) =>
          Number(b.price) - Number(a.price)
      )
      .slice(0, 3);
  };

  const top4BHK = getTopProperties(4);
  const top3BHK = getTopProperties(3);
  const top2BHK = getTopProperties(2);

  const activeCount = listings.filter(
    listing => listing.is_live === true
  ).length;

  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '4rem'
        }}
      >
        Loading Ivy Homes...
      </div>
    );
  }

  return (
    <div className="home-page">
      <HeroStats
        uniqueCount={listings.length}
        projectsCount={projects.length}
        activeCount={activeCount}
      />

      <PremiumCollection
        title="Premium 4 BHK Estates"
        properties={top4BHK}
      />

      <PremiumCollection
        title="Premium 3 BHK Residences"
        properties={top3BHK}
      />

      <PremiumCollection
        title="Premium 2 BHK Apartments"
        properties={top2BHK}
      />
    </div>
  );
}