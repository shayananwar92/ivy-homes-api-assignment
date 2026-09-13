export default function SearchFilterBar({ 
  searchTerm, setSearchTerm, 
  bhkFilter, setBhkFilter, 
  typeFilter, setTypeFilter,
  priceMin, setPriceMin,
  priceMax, setPriceMax,
  furnishingFilter, setFurnishingFilter
}) {
  return (
    <div className="search-controls">
      {/* Locality Search */}
      <input 
        type="text" 
        placeholder="Search locality..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="filter-input"
      />

      {/* Price Range */}
      <input 
        type="number" 
        placeholder="Min Price (₹)" 
        value={priceMin}
        onChange={(e) => setPriceMin(e.target.value)}
        className="filter-input"
        style={{ minWidth: '130px' }}
      />
      <input 
        type="number" 
        placeholder="Max Price (₹)" 
        value={priceMax}
        onChange={(e) => setPriceMax(e.target.value)}
        className="filter-input"
        style={{ minWidth: '130px' }}
      />

      {/* Bedrooms */}
      <select value={bhkFilter} onChange={(e) => setBhkFilter(e.target.value)} className="filter-select">
        <option value="All">Any BHK</option>
        <option value="1">1 BHK</option>
        <option value="2">2 BHK</option>
        <option value="3">3 BHK</option>
        <option value="4">4 BHK</option>
        <option value="5">5 BHK</option>
      </select>

      {/* Furnishing */}
      <select value={furnishingFilter} onChange={(e) => setFurnishingFilter(e.target.value)} className="filter-select">
        <option value="All">Any Furnishing</option>
        <option value="fully-furnished">Fully Furnished</option>
        <option value="semi-furnished">Semi Furnished</option>
        <option value="unfurnished">Unfurnished</option>
      </select>
      
      {/* Property Type (Bonus, keeping it since it's useful) */}
      <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="filter-select">
        <option value="All">Any Type</option>
        <option value="apartment">Apartment</option>
        <option value="independent house">Independent House</option>
        <option value="villa">Villa</option>
      </select>
    </div>
  );
}