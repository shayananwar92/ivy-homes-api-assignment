import PropertyCard from './PropertyCard';

export default function PremiumCollection({ title, properties }) {
  return (
    <section className="premium-collection">
      <div className="collection-heading">
        <h2>{title}</h2>
        <span>{properties.length} available</span>
      </div>

      {properties.length > 0 ? (
        <div className="property-grid">
          {properties.map((property) => (
            <PropertyCard
              key={property.listing_id}
              property={property}
            />
          ))}
        </div>
      ) : (
        <div className="collection-empty">
          No matching properties available.
        </div>
      )}
    </section>
  );
}