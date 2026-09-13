export default function SearchFilterBar({
  searchTerm,
  setSearchTerm,
  bhkFilter,
  setBhkFilter,
  typeFilter,
  setTypeFilter,
  priceRange,
  setPriceRange,
  furnishingFilter,
  setFurnishingFilter
}) {
  const clearFilters = () => {
    setSearchTerm('');
    setBhkFilter('All');
    setTypeFilter('All');
    setPriceRange('All');
    setFurnishingFilter('All');
  };

  return (
    <div className="search-controls">
      <input
        type="text"
        placeholder="Search by locality..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="filter-input search-input"
      />

      <div className="filter-group">
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="filter-select"
        >
          <option value="All">Any Price</option>
          <option value="under50">Under ₹50 Lakh</option>
          <option value="50to100">₹50 Lakh – ₹1 Crore</option>
          <option value="100to200">₹1 – ₹2 Crore</option>
          <option value="200to500">₹2 – ₹5 Crore</option>
          <option value="over500">₹5 Crore+</option>
        </select>

        <select
          value={bhkFilter}
          onChange={(e) => setBhkFilter(e.target.value)}
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
          onChange={(e) => setFurnishingFilter(e.target.value)}
          className="filter-select"
        >
          <option value="All">Any Furnishing</option>
          <option value="fully-furnished">Fully Furnished</option>
          <option value="semi-furnished">Semi Furnished</option>
          <option value="unfurnished">Unfurnished</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="filter-select"
        >
          <option value="All">Any Type</option>
          <option value="apartment">Apartment</option>
          <option value="independent house">Independent House</option>
          <option value="villa">Villa</option>
        </select>

        <button className="clear-filters" onClick={clearFilters}>
          Clear
        </button>
      </div>
    </div>
  );
}