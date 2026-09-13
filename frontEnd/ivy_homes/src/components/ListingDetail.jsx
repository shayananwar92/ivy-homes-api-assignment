import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAllPages } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ListingDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Please log in to view this listing.');
      return;
    }

    let cancelled = false;

    async function loadListing() {
      try {
        setLoading(true);
        setError('');

        const listings = await fetchAllPages('/v1/listings');

        const uniqueListings = Array.from(
          new Map(
            listings.map(listing => [
              listing.listing_id,
              listing
            ])
          ).values()
        );

        const found = uniqueListings.find(
          listing => listing.listing_id === id
        );

        if (!found) {
          throw new Error('Listing not found.');
        }

        if (!cancelled) {
          setProperty(found);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load listing:', err);
          setProperty(null);
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadListing();

    return () => {
      cancelled = true;
    };
  }, [id, token]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>
          Please <Link to="/login">login</Link> to view this property.
        </h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        Loading property...
      </div>
    );
  }

  if (error || !property) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Property Not Found</h2>
        {error && <p>{error}</p>}
        <p style={{ marginTop: '1rem' }}>
          <Link to="/search">← Back to Search</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="listing-detail-page">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}
      >
        <Link
          to="/search"
          className="back-link"
          style={{ marginBottom: 0 }}
        >
          ← Back to Search
        </Link>

        {user && (
          <button className="accent-btn">
            ☆ Save Property
          </button>
        )}
      </div>

      <div className="detail-header">
        <h1>
          {property.bedroom} BHK {property.property_type}
        </h1>

        <p className="locality-tag">
          {property.locality}
        </p>

        <h2 className="price-tag">
          ₹{Number(property.price).toLocaleString('en-IN')}
        </h2>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3>Specifications</h3>

          <ul>
            <li>
              <strong>Carpet Area:</strong>{' '}
              {property.carpet_area} sqft
            </li>

            <li>
              <strong>Super Built-up Area:</strong>{' '}
              {property.super_built_up_area} sqft
            </li>

            <li>
              <strong>Furnishing:</strong>{' '}
              {property.furnishing || 'Unspecified'}
            </li>

            <li>
              <strong>Bathrooms:</strong>{' '}
              {property.bathroom}
            </li>

            <li>
              <strong>Balcony:</strong>{' '}
              {property.balcony ?? 'Unspecified'}
            </li>

            <li>
              <strong>Floor:</strong>{' '}
              {property.floor} out of {property.total_floors}
            </li>

            <li>
              <strong>Facing:</strong>{' '}
              {property.facing_direction || 'Unspecified'}
            </li>

            <li>
              <strong>Parking:</strong>{' '}
              {property.covered_parking ?? 0}
            </li>
          </ul>
        </div>

        <div className="detail-card">
          <h3>Listing Info</h3>

          <ul>
            <li>
              <strong>Listing ID:</strong>{' '}
              {property.listing_id}
            </li>

            <li>
              <strong>Project ID:</strong>{' '}
              {property.project_id || 'Standalone'}
            </li>

            <li>
              <strong>Status:</strong>{' '}
              {property.is_live ? 'Live' : 'Offline'}
            </li>

            <li>
              <strong>Verified:</strong>{' '}
              {property.is_verified ? 'Yes' : 'No'}
            </li>

            <li>
              <strong>Posted By:</strong>{' '}
              {property.posted_by || 'Unspecified'}
            </li>

            <li>
              <strong>Posted On:</strong>{' '}
              {property.posted_at
                ? new Date(property.posted_at).toLocaleDateString()
                : 'Unspecified'}
            </li>

            <li>
              <strong>Coordinates:</strong>{' '}
              {property.latitude}, {property.longitude}
            </li>
          </ul>
        </div>
      </div>

      {property.description && (
        <div
          className="detail-card"
          style={{ marginTop: '2rem' }}
        >
          <h3>Description</h3>
          <p>{property.description}</p>
        </div>
      )}
    </div>
  );
}