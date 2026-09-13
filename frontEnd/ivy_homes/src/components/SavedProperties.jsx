import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropertyCard from './PropertyCard';

export default function SavedProperties() {
  const { token, user } = useAuth();
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('https://solve.ivy.homes/v1/favourites', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Key': 'IVY26-355F3CA5026E'
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.results) {
        setSavedListings(data.results);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error("Failed to fetch favorites", err);
      setLoading(false);
    });
  }, [token]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Please <Link to="/login" style={{ color: 'var(--accent)' }}>login</Link> to view saved properties.</h2>
      </div>
    );
  }

  return (
    <div className="saved-page" style={{ padding: '2rem 0' }}>
      <div className="search-header">
        <h2>Your Saved Properties</h2>
        <p>{savedListings.length} {savedListings.length === 1 ? 'property' : 'properties'} saved</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading favorites...</div>
      ) : savedListings.length > 0 ? (
        <div className="property-grid">
          {savedListings.map(prop => (
            <PropertyCard key={prop.listing_id} property={prop} />
          ))}
        </div>
      ) : (
        <div className="no-results" style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'var(--card-bg)', borderRadius: '8px' }}>
          You haven't saved any properties yet. <Link to="/search" style={{ color: 'var(--accent)' }}>Go explore the directory.</Link>
        </div>
      )}
    </div>
  );
}