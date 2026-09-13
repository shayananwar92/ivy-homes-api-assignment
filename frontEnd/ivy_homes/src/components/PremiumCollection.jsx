import PropertyCard from './PropertyCard';

export default function PremiumCollection({ title, properties }) {
  return (
    <section className="premium-collection">
      <h2>{title}</h2>
      
      <div className="property-grid">
        {properties.map(prop => (
          <PropertyCard key={prop.listing_id} property={prop} />
        ))}
      </div>
      
    </section>
  );
}