import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropertyCard from './PropertyCard';
import SearchFilterBar from './SearchFilterBar';
import { fetchAllPages } from '../api';

export default function SearchManager() {
  const { token } = useAuth();

  const [listings, setListings] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [bhkFilter, setBhkFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [furnishingFilter, setFurnishingFilter] = useState('All');

  useEffect(() => {
    if (!token) {
      setListings([]);
      setVisibleCount(12);
      setError('');
      return;
    }

    let cancelled = false;

    const loadListings = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await fetchAllPages('/v1/listings');

        const uniqueListings = Array.from(
          new Map(
            data.map((listing) => [listing.listing_id, listing])
          ).values()
        );

        if (!cancelled) {
          setListings(uniqueListings);
          setVisibleCount(12);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load listings:', err);
          setError(err.message || 'Unable to load properties.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadListings();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    setVisibleCount(12);
  }, [
    searchTerm,
    bhkFilter,
    typeFilter,
    priceRange,
    furnishingFilter
  ]);

  const filteredProperties = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const type = typeFilter.toLowerCase();
    const furnishing = furnishingFilter.toLowerCase();

    const priceRanges = {
      under50: { min: 0, max: 5000000 },
      '50to100': { min: 5000000, max: 10000000 },
      '100to200': { min: 10000000, max: 20000000 },
      '200to500': { min: 20000000, max: 50000000 },
      over500: { min: 50000000, max: Infinity }
    };

    const selectedRange = priceRanges[priceRange];

    return listings.filter((prop) => {
      const locality = String(prop.locality || '').toLowerCase();
      const propertyType = String(prop.property_type || '').toLowerCase();
      const propertyFurnishing = String(prop.furnishing || '').toLowerCase();
      const price = Number(prop.price);

      const matchesPrice =
        priceRange === 'All' ||
        (
          selectedRange &&
          price >= selectedRange.min &&
          price < selectedRange.max
        );

      return (
        prop.is_live === true &&
        price > 0 &&
        locality.includes(search) &&
        (bhkFilter === 'All' ||
          String(prop.bedroom) === bhkFilter) &&
        (typeFilter === 'All' ||
          propertyType === type) &&
        matchesPrice &&
        (furnishingFilter === 'All' ||
          propertyFurnishing === furnishing)
      );
    });
  }, [
    listings,
    searchTerm,
    bhkFilter,
    typeFilter,
    priceRange,
    furnishingFilter
  ]);

  const visibleProperties = filteredProperties.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProperties.length;

  if (!token) {
    return (
      <div className="auth-required">
        <p>
          Please <Link to="/login">sign in</Link> to browse properties.
        </p>
      </div>
    );
  }

  return (
    <div className="search-manager">
      <div className="search-header">
        <div>
          <h2>Property Directory</h2>
          <p>
            {loading
              ? 'Loading properties...'
              : `${filteredProperties.length} properties found`}
          </p>
        </div>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        bhkFilter={bhkFilter}
        setBhkFilter={setBhkFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        furnishingFilter={furnishingFilter}
        setFurnishingFilter={setFurnishingFilter}
      />

      {loading && listings.length === 0 && (
        <div className="no-results">Loading properties...</div>
      )}

      {error && (
        <div className="no-results search-error">
          Failed to load properties: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {visibleProperties.length > 0 ? (
            <div className="property-grid">
              {visibleProperties.map((property) => (
                <PropertyCard
                  key={property.listing_id}
                  property={property}
                />
              ))}
            </div>
          ) : (
            <div className="no-results">
              No properties match your search criteria.
            </div>
          )}

          {hasMore && (
            <div className="load-more">
              <button
                className="accent-btn"
                onClick={() => setVisibleCount((count) => count + 12)}
              >
                Load More
              </button>
            </div>
          )}

          {!hasMore && filteredProperties.length > 0 && (
            <div className="load-more all-loaded">
              All properties loaded.
            </div>
          )}
        </>
      )}
    </div>
  );
}