import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAllPages } from '../api';
import { Link } from 'react-router-dom';

export default function Insights() {
  const { token } = useAuth();

  const [listings, setListings] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setListings([]);
      setRentals([]);
      setProjects([]);
      setError('');
      return;
    }

    let cancelled = false;

    async function loadInsights() {
      try {
        setLoading(true);
        setError('');

        const [listingData, rentalData, projectData] =
          await Promise.all([
            fetchAllPages('/v1/listings'),
            fetchAllPages('/v1/rentals'),
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

        const uniqueRentals = Array.from(
          new Map(
            rentalData.map(rental => [
              rental.listing_id,
              rental
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
          setRentals(uniqueRentals);
          setProjects(uniqueProjects);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load insights:', err);
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInsights();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const stats = useMemo(() => {
    const activeListings = listings.filter(
      listing => listing.is_live === true
    );

    const prices = activeListings
      .map(listing => Number(listing.price))
      .filter(price => Number.isFinite(price) && price > 0)
      .sort((a, b) => a - b);

    const pricePerSqft = activeListings
      .map(listing => {
        const price = Number(listing.price);
        const area = Number(listing.carpet_area);

        if (
          !Number.isFinite(price) ||
          !Number.isFinite(area) ||
          price <= 0 ||
          area <= 0
        ) {
          return null;
        }

        return price / area;
      })
      .filter(value => value !== null)
      .sort((a, b) => a - b);

    const median = values => {
      if (values.length === 0) {
        return 0;
      }

      const middle = Math.floor(values.length / 2);

      return values.length % 2 === 0
        ? (values[middle - 1] + values[middle]) / 2
        : values[middle];
    };

    return {
      uniqueListings: listings.length,
      activeListings: activeListings.length,
      uniqueRentals: rentals.length,
      uniqueProjects: projects.length,
      medianPrice: median(prices),
      medianPricePerSqft: median(pricePerSqft)
    };
  }, [listings, rentals, projects]);

if (!token) {
  return (
    <div className="auth-required">
      <p>
        Please <Link to="/login">sign in</Link> to view insights.
      </p>
    </div>
  );
}

  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '4rem'
        }}
      >
        Loading insights...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="no-results"
        style={{
          textAlign: 'center',
          padding: '4rem'
        }}
      >
        Failed to load insights: {error}
      </div>
    );
  }

  return (
    <div
      className="search-manager"
      style={{ padding: '2rem 0' }}
    >
      <div className="search-header">
        <h2>Market Insights</h2>
        <p>
          Live insights calculated from the current property data.
        </p>
      </div>

      <div className="property-grid">
        <div className="property-card">
          <h3>Unique Properties</h3>
          <p
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: '1rem 0 0'
            }}
          >
            {stats.uniqueListings}
          </p>
        </div>

        <div className="property-card">
          <h3>Active Listings</h3>
          <p
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: '1rem 0 0'
            }}
          >
            {stats.activeListings}
          </p>
        </div>

        <div className="property-card">
          <h3>Rental Properties</h3>
          <p
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: '1rem 0 0'
            }}
          >
            {stats.uniqueRentals}
          </p>
        </div>

        <div className="property-card">
          <h3>Builder Projects</h3>
          <p
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: '1rem 0 0'
            }}
          >
            {stats.uniqueProjects}
          </p>
        </div>

        <div className="property-card">
          <h3>Median Listing Price</h3>
          <p
            style={{
              fontSize: '1.6rem',
              fontWeight: '700',
              margin: '1rem 0 0'
            }}
          >
            ₹{stats.medianPrice.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="property-card">
          <h3>Median Price / Sqft</h3>
          <p
            style={{
              fontSize: '1.6rem',
              fontWeight: '700',
              margin: '1rem 0 0'
            }}
          >
            ₹{stats.medianPricePerSqft.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}