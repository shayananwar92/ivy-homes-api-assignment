import { Link } from 'react-router-dom';

export default function PropertyCard({ property }) {
  return (
    <Link 
      to={`/listing/${property.listing_id}`} 
      className="property-card"
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <h3>{property.bedroom} BHK {property.property_type}</h3>
      <p className="property-locality">{property.locality}</p>
      
      <div className="property-details">
        <p>Price: <strong>₹{property.price.toLocaleString('en-IN')}</strong></p>
        <p>Area: <span>{property.carpet_area} sqft</span></p>
      </div>
    </Link>
  );
}