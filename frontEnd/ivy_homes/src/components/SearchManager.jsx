import { useEffect, useMemo, useState } from 'react';
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
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [furnishingFilter, setFurnishingFilter] = useState('All');

  useEffect(() => {
    if (!token) {
      setListings([]);
      setVisibleCount(12);
      setError('');
      return;
    }

    let cancelled = false;

    async function loadListings() {
      try {
        setLoading(true);
        setError('');

        const data = await fetchAllPages('/v1/listings');

        const uniqueListings = Array.from(
          new Map(
            data.map(listing => [
              listing.listing_id,
              listing
            ])
          ).values()
        );

        if (!cancelled) {
          setListings(uniqueListings);
          setVisibleCount(12);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load listings:', err);
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const filteredProperties = useMemo(() => {
    return listings.filter(prop => {
      const locality = String(
        prop.locality || ''
      ).toLowerCase();

      const propertyType = String(
        prop.property_type || ''
      ).toLowerCase();

      const furnishing = String(
        prop.furnishing || ''
      ).toLowerCase();

      const matchesSearch =
        locality.includes(searchTerm.toLowerCase());

      const matchesBhk =
        bhkFilter === 'All' ||
        String(prop.bedroom) === bhkFilter;

      const matchesType =
        typeFilter === 'All' ||
        propertyType === typeFilter.toLowerCase();

      const matchesMinPrice =
        priceMin === '' ||
        Number(prop.price) >= Number(priceMin);

      const matchesMaxPrice =
        priceMax === '' ||
        Number(prop.price) <= Number(priceMax);

      const matchesFurnishing =
        furnishingFilter === 'All' ||
        furnishing === furnishingFilter.toLowerCase();

      return (
        prop.is_live === true &&
        Number(prop.price) > 0 &&
        matchesSearch &&
        matchesBhk &&
        matchesType &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesFurnishing
      );
    });
  }, [
    listings,
    searchTerm,
    bhkFilter,
    typeFilter,
    priceMin,
    priceMax,
    furnishingFilter
  ]);

  const visibleProperties =
    filteredProperties.slice(0, visibleCount);

  const hasMore =
    visibleCount < filteredProperties.length;

  if (!token) {
    return (
      <div
        className="no-results"
        style={{
          textAlign: 'center',
          padding: '4rem'
        }}
      >
        Please <a href="/login">login</a> to browse properties.
      </div>
    );
  }

  return (
    <div className="search-manager">
      <div className="search-header">
        <h2>Property Directory</h2>

        <p>
          {loading
            ? 'Loading properties...'
            : `Showing ${visibleProperties.length} of ${filteredProperties.length} results`}
        </p>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        bhkFilter={bhkFilter}
        setBhkFilter={setBhkFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        priceMin={priceMin}
        setPriceMin={setPriceMin}
        priceMax={priceMax}
        setPriceMax={setPriceMax}
        furnishingFilter={furnishingFilter}
        setFurnishingFilter={setFurnishingFilter}
      />

      {loading && listings.length === 0 && (
        <div className="no-results">
          Loading properties...
        </div>
      )}

      {error && (
        <div className="no-results">
          Failed to load properties: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="property-grid">
            {visibleProperties.length > 0 ? (
              visibleProperties.map(prop => (
                <PropertyCard
                  key={prop.listing_id}
                  property={prop}
                />
              ))
            ) : (
              <div className="no-results">
                No properties match your search criteria.
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

          {!hasMore &&
            filteredProperties.length > 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem'
                }}
              >
                All properties loaded.
              </div>
            )}
        </>
      )}
    </div>
  );
}