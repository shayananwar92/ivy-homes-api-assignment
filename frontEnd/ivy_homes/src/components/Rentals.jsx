import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAllPages } from '../api';
import { Link } from 'react-router-dom';

export default function Rentals() {
  const { token } = useAuth();

  const [rentals, setRentals] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [bhkFilter, setBhkFilter] = useState('All');
  const [furnishingFilter, setFurnishingFilter] = useState('All');

  useEffect(() => {
    if (!token) {
      setRentals([]);
      setVisibleCount(12);
      setError('');
      return;
    }

    let cancelled = false;

    async function loadRentals() {
      try {
        setLoading(true);
        setError('');

        const data = await fetchAllPages('/v1/rentals');

        const uniqueRentals = Array.from(
          new Map(
            data.map(rental => [
              rental.listing_id,
              rental
            ])
          ).values()
        );

        if (!cancelled) {
          setRentals(uniqueRentals);
          setVisibleCount(12);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load rentals:', err);
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRentals();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const filteredRentals = useMemo(() => {
    return rentals.filter(rental => {
      const locality = String(
        rental.locality || ''
      ).toLowerCase();

      const furnishing = String(
        rental.furnishing || ''
      ).toLowerCase();

      const matchesSearch =
        locality.includes(searchTerm.toLowerCase());

      const matchesBhk =
        bhkFilter === 'All' ||
        String(rental.bedroom) === bhkFilter;

      const matchesFurnishing =
        furnishingFilter === 'All' ||
        furnishing === furnishingFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesBhk &&
        matchesFurnishing
      );
    });
  }, [
    rentals,
    searchTerm,
    bhkFilter,
    furnishingFilter
  ]);

  const visibleRentals =
    filteredRentals.slice(0, visibleCount);

  const hasMore =
    visibleCount < filteredRentals.length;

if (!token) {
  return (
    <div className="auth-required">
      <p>
        Please <Link to="/login">sign in</Link> to view rentals.
      </p>
    </div>
  );
}

  return (
    <div
      className="search-manager"
      style={{ padding: '2rem 0' }}
    >
      <div className="search-header">
        <h2>Rental Directory</h2>

        <p>
          {loading
            ? 'Loading rentals...'
            : `Showing ${visibleRentals.length} of ${filteredRentals.length} results`}
        </p>
      </div>

      <div
        className="search-controls"
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}
      >
        <input
          type="text"
          placeholder="Search locality..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setVisibleCount(12);
          }}
          className="filter-input"
        />

        <select
          value={bhkFilter}
          onChange={e => {
            setBhkFilter(e.target.value);
            setVisibleCount(12);
          }}
          className="filter-select"
        >
          <option value="All">Any BHK</option>
          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4 BHK</option>
          <option value="5">5 BHK</option>
        </select>

        <select
          value={furnishingFilter}
          onChange={e => {
            setFurnishingFilter(e.target.value);
            setVisibleCount(12);
          }}
          className="filter-select"
        >
          <option value="All">Any Furnishing</option>
          <option value="fully-furnished">Fully Furnished</option>
          <option value="semi-furnished">Semi Furnished</option>
          <option value="unfurnished">Unfurnished</option>
        </select>
      </div>

      {loading && rentals.length === 0 && (
        <div className="no-results">
          Loading rentals...
        </div>
      )}

      {error && (
        <div className="no-results">
          Failed to load rentals: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="property-grid">
            {visibleRentals.length > 0 ? (
              visibleRentals.map(rental => (
                <div
                  key={rental.listing_id}
                  className="property-card"
                >
                  <h3>
                    {rental.bedroom} BHK {rental.property_type}
                  </h3>

                  <p className="property-locality">
                    {rental.locality}
                  </p>

                  <div
                    style={{
                      borderTop: '1px solid var(--border-color, #333)',
                      marginTop: '1.25rem',
                      paddingTop: '1.25rem',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <small style={{ opacity: 0.7 }}>
                        Monthly Rent
                      </small>
                      <p style={{ margin: '0.25rem 0 0' }}>
                        <strong>
                          ₹{Number(
                            rental.price
                          ).toLocaleString('en-IN')}
                        </strong>
                      </p>
                    </div>

                    <div>
                      <small style={{ opacity: 0.7 }}>
                        Carpet Area
                      </small>
                      <p style={{ margin: '0.25rem 0 0' }}>
                        {rental.carpet_area} sqft
                      </p>
                    </div>

                    <div>
                      <small style={{ opacity: 0.7 }}>
                        Security Deposit
                      </small>
                      <p style={{ margin: '0.25rem 0 0' }}>
                        ₹{Number(
                          rental.deposit || 0
                        ).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div>
                      <small style={{ opacity: 0.7 }}>
                        Furnishing
                      </small>
                      <p style={{ margin: '0.25rem 0 0' }}>
                        {rental.furnishing || 'Unspecified'}
                      </p>
                    </div>

                    <div>
                      <small style={{ opacity: 0.7 }}>
                        Floor
                      </small>
                      <p style={{ margin: '0.25rem 0 0' }}>
                        {rental.floor} / {rental.total_floors}
                      </p>
                    </div>

                    <div>
                      <small style={{ opacity: 0.7 }}>
                        Bathrooms
                      </small>
                      <p style={{ margin: '0.25rem 0 0' }}>
                        {rental.bathroom}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '1.25rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-color, #333)',
                      fontSize: '0.85rem',
                      opacity: 0.7
                    }}
                  >
                    Listing ID: {rental.listing_id}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                No rentals match your search criteria.
              </div>
            )}
          </div>

          {hasMore && (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem'
              }}
            >
              <button
                onClick={() =>
                  setVisibleCount(
                    count => count + 12
                  )
                }
                className="accent-btn"
              >
                Load More
              </button>
            </div>
          )}

          {!hasMore && filteredRentals.length > 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                opacity: 0.7
              }}
            >
              All rentals loaded.
            </div>
          )}
        </>
      )}
    </div>
  );
}