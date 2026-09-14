import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const getStorageKey = (user) => `ivy:favourites:${user}`;

export default function PropertyCard({
  property,
  isSaved: savedProp,
  onSaveToggle
}) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(savedProp ?? false);

  useEffect(() => {
    if (savedProp !== undefined) {
      setIsSaved(savedProp);
      return;
    }

    if (!user) {
      setIsSaved(false);
      return;
    }

    try {
      const saved = JSON.parse(
        localStorage.getItem(getStorageKey(user)) || '[]'
      );

      setIsSaved(saved.includes(property.listing_id));
    } catch {
      setIsSaved(false);
    }
  }, [user, property.listing_id, savedProp]);

  const toggleSave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) return;

    try {
      const key = getStorageKey(user);
      const saved = JSON.parse(
        localStorage.getItem(key) || '[]'
      );

      const updated = saved.includes(property.listing_id)
        ? saved.filter((id) => id !== property.listing_id)
        : [...saved, property.listing_id];

      localStorage.setItem(key, JSON.stringify(updated));
      setIsSaved(updated.includes(property.listing_id));

      if (onSaveToggle && !updated.includes(property.listing_id)) {
        onSaveToggle();
      }
    } catch (error) {
      console.error('Failed to update saved property:', error);
    }
  };

  return (
    <div className="property-card">
      <Link
        to={`/listing/${property.listing_id}`}
        className="property-card-link"
      >
        <h3>
          {property.bedroom} BHK {property.property_type}
        </h3>

        <p className="property-locality">
          {property.locality}
        </p>

        <div className="property-details">
          <p>
            Price:{' '}
            <strong>
              ₹{Number(property.price).toLocaleString('en-IN')}
            </strong>
          </p>

          <p>
            Area: <span>{property.carpet_area} sqft</span>
          </p>
        </div>
      </Link>

      {user && (
        <button
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          onClick={toggleSave}
        >
          {isSaved ? '★ Saved' : '☆ Save'}
        </button>
      )}
    </div>
  );
}