const ProductFilter = ({
  categories = [],
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  return (
    <div className="filter-card">
      <div className="filter-header">
        <h3>🔍 Filter & Sort</h3>
        <button onClick={onResetFilters} className="btn-link">
          Reset All
        </button>
      </div>

      <div className="filter-grid">
        {/* Search */}
        <div className="form-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            name="search"
            placeholder="Search products..."
            value={filters.search || ""}
            onChange={handleChange}
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={filters.category || ""}
            onChange={handleChange}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="form-group">
          <label htmlFor="sort">Sort By</label>
          <select
            id="sort"
            name="sort"
            value={filters.sort || "newest"}
            onChange={handleChange}
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="form-group price-range-group">
          <label>Price Range ($)</label>
          <div className="price-inputs">
            <input
              type="number"
              name="minPrice"
              placeholder="Min"
              min="0"
              value={filters.minPrice || ""}
              onChange={handleChange}
            />
            <span className="price-dash">-</span>
            <input
              type="number"
              name="maxPrice"
              placeholder="Max"
              min="0"
              value={filters.maxPrice || ""}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
