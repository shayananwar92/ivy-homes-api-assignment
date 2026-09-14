import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropertyCard from './PropertyCard';
import { fetchAllPages } from '../api';

const getStorageKey = (user) => `ivy:favourites:${user}`;

export default function SavedProperties() {
  const { token, user } = useAuth();

  const [savedIds, setSavedIds] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) {
      setSavedIds([]);
      setSavedListings([]);
      setLoading(false);
      return;
    }

    const stored = localStorage.getItem(getStorageKey(user));

    try {
      setSavedIds(stored ? JSON.parse(stored) : []);
    } catch {
      setSavedIds([]);
    }
  }, [token, user]);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    let cancelled = false;

    const loadSavedListings = async () => {
      try {
        setLoading(true);

        const listings = await fetchAllPages('/v1/listings');

        const uniqueListings = Array.from(
          new Map(
            listings.map((listing) => [
              listing.listing_id,
              listing
            ])
          ).values()
        );

        const stored = localStorage.getItem(getStorageKey(user));

        let ids = [];

        try {
          ids = stored ? JSON.parse(stored) : [];
        } catch {
          ids = [];
        }

        const matchingListings = uniqueListings.filter((listing) =>
          ids.includes(listing.listing_id)
        );

        if (!cancelled) {
          setSavedIds(ids);
          setSavedListings(matchingListings);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load saved properties:', error);
          setSavedListings([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSavedListings();

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  const handleRemove = (listingId) => {
    const updatedIds = savedIds.filter((id) => id !== listingId);

    localStorage.setItem(
      getStorageKey(user),
      JSON.stringify(updatedIds)
    );

    setSavedIds(updatedIds);
    setSavedListings((current) =>
      current.filter((listing) => listing.listing_id !== listingId)
    );
  };

  if (!user) {
    return (
      <div className="auth-required">
        <p>
          Please <Link to="/login">sign in</Link> to view saved properties.
        </p>
      </div>
    );
  }

  return (
    <div className="saved-page">
      <div className="search-header">
        <h2>Your Saved Properties</h2>
        <p>
          {savedListings.length}{' '}
          {savedListings.length === 1 ? 'property' : 'properties'} saved
        </p>
      </div>

      {loading ? (
        <div className="no-results">
          Loading saved properties...
        </div>
      ) : savedListings.length > 0 ? (
        <div className="property-grid">
          {savedListings.map((property) => (
            <PropertyCard
              key={property.listing_id}
              property={property}
              isSaved={true}
              onSaveToggle={() => handleRemove(property.listing_id)}
            />
          ))}
        </div>
      ) : (
        <div className="no-results">
          You haven't saved any properties yet.{' '}
          <Link to="/search">Go explore the directory.</Link>
        </div>
      )}
    </div>
  );
}