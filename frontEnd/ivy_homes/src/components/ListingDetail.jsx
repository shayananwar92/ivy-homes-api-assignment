import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAllPages } from '../api';
import { useAuth } from '../context/AuthContext';

const getStorageKey = (user) => `ivy:favourites:${user}`;

export default function ListingDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      setLoading(false);
      setError('Please sign in to view this listing.');
      return;
    }

    let cancelled = false;

    const loadListing = async () => {
      try {
        setLoading(true);
        setError('');

        const listings = await fetchAllPages('/v1/listings');

        const uniqueListings = Array.from(
          new Map(
            listings.map((listing) => [
              listing.listing_id,
              listing
            ])
          ).values()
        );

        const found = uniqueListings.find(
          (listing) => listing.listing_id === id
        );

        if (!found) {
          throw new Error('Listing not found.');
        }

        const saved = JSON.parse(
          localStorage.getItem(getStorageKey(user)) || '[]'
        );

        if (!cancelled) {
          setProperty(found);
          setIsSaved(saved.includes(id));
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load listing:', err);
          setProperty(null);
          setError(err.message || 'Unable to load listing.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadListing();

    return () => {
      cancelled = true;
    };
  }, [id, token, user]);

  const toggleSave = () => {
    if (!user) return;

    try {
      const key = getStorageKey(user);
      const saved = JSON.parse(
        localStorage.getItem(key) || '[]'
      );

      const updated = saved.includes(id)
        ? saved.filter((listingId) => listingId !== id)
        : [...saved, id];

      localStorage.setItem(key, JSON.stringify(updated));
      setIsSaved(updated.includes(id));
    } catch (err) {
      console.error('Failed to update saved property:', err);
    }
  };

  if (!user) {
    return (
      <div className="auth-required">
        <p>
          Please <Link to="/login">sign in</Link> to view this property.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="no-results">
        Loading property...
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="no-results">
        <h2>Property Not Found</h2>
        {error && <p>{error}</p>}
        <p>
          <Link to="/search">← Back to Search</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="listing-detail-page">
      <div className="detail-topbar">
        <Link to="/search" className="back-link">
          ← Back to Search
        </Link>

        <button
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          onClick={toggleSave}
        >
          {isSaved ? '★ Saved' : '☆ Save Property'}
        </button>
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
              <strong>Carpet Area:</strong>
              <span>{property.carpet_area} sqft</span>
            </li>
            <li>
              <strong>Super Built-up Area:</strong>
              <span>{property.super_built_up_area} sqft</span>
            </li>
            <li>
              <strong>Furnishing:</strong>
              <span>{property.furnishing || 'Unspecified'}</span>
            </li>
            <li>
              <strong>Bathrooms:</strong>
              <span>{property.bathroom}</span>
            </li>
            <li>
              <strong>Balcony:</strong>
              <span>{property.balcony ?? 'Unspecified'}</span>
            </li>
            <li>
              <strong>Floor:</strong>
              <span>
                {property.floor} out of {property.total_floors}
              </span>
            </li>
            <li>
              <strong>Facing:</strong>
              <span>
                {property.facing_direction || 'Unspecified'}
              </span>
            </li>
            <li>
              <strong>Parking:</strong>
              <span>{property.covered_parking ?? 0}</span>
            </li>
          </ul>
        </div>

        <div className="detail-card">
          <h3>Listing Info</h3>

          <ul>
            <li>
              <strong>Listing ID:</strong>
              <span>{property.listing_id}</span>
            </li>
            <li>
              <strong>Project ID:</strong>
              <span>{property.project_id || 'Standalone'}</span>
            </li>
            <li>
              <strong>Status:</strong>
              <span>{property.is_live ? 'Live' : 'Offline'}</span>
            </li>
            <li>
              <strong>Verified:</strong>
              <span>{property.is_verified ? 'Yes' : 'No'}</span>
            </li>
            <li>
              <strong>Posted By:</strong>
              <span>{property.posted_by || 'Unspecified'}</span>
            </li>
            <li>
              <strong>Posted On:</strong>
              <span>
                {property.posted_at
                  ? new Date(property.posted_at).toLocaleDateString()
                  : 'Unspecified'}
              </span>
            </li>
            <li>
              <strong>Coordinates:</strong>
              <span>
                {property.latitude}, {property.longitude}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {property.description && (
        <div className="detail-card detail-description">
          <h3>Description</h3>
          <p>{property.description}</p>
        </div>
      )}
    </div>
  );
}