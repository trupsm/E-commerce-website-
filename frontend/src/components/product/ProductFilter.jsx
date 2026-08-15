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
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "16px 24px",
        marginBottom: "32px",
        backdropFilter: "blur(16px)",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", flex: 1, minWidth: "280px" }}>
        {/* Search */}
        <div style={{ position: "relative", minWidth: "200px", flex: "1 1 200px" }}>
          <input
            type="text"
            name="search"
            placeholder="🔍 Search products..."
            value={filters.search || ""}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              background: "rgba(10, 14, 23, 0.6)",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
            }}
          />
        </div>

        {/* Category Dropdown */}
        <div style={{ minWidth: "170px", flex: "1 1 170px" }}>
          <select
            name="category"
            value={filters.category || ""}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              background: "rgba(10, 14, 23, 0.6)",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <option value="">🏷️ Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "230px", flex: "1 1 230px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", whiteSpace: "nowrap", fontWeight: "600" }}>
            Sort By:
          </span>
          <select
            name="sort"
            value={filters.sort || "newest"}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              background: "rgba(10, 14, 23, 0.6)",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <option value="newest">✨ Newest Arrivals</option>
            <option value="price_asc">💵 Price: Low to High</option>
            <option value="price_desc">💎 Price: High to Low</option>
            <option value="rating">⭐ Highest Rated</option>
            <option value="name_asc">🔤 Name: A to Z</option>
          </select>
        </div>

        {/* Price Inputs with Explicit Label */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "240px", flex: "1 1 240px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", whiteSpace: "nowrap", fontWeight: "600" }}>
            Price ($):
          </span>
          <input
            type="number"
            name="minPrice"
            placeholder="Min $"
            min="0"
            value={filters.minPrice || ""}
            onChange={handleChange}
            style={{
              width: "85px",
              padding: "10px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              background: "rgba(10, 14, 23, 0.6)",
              color: "var(--text-primary)",
              fontSize: "0.88rem",
            }}
          />
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>-</span>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max $"
            min="0"
            value={filters.maxPrice || ""}
            onChange={handleChange}
            style={{
              width: "85px",
              padding: "10px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              background: "rgba(10, 14, 23, 0.6)",
              color: "var(--text-primary)",
              fontSize: "0.88rem",
            }}
          />
        </div>
      </div>

      {/* Reset Action Button */}
      <button
        type="button"
        onClick={onResetFilters}
        className="btn btn-secondary btn-sm"
        style={{ padding: "10px 16px", whiteSpace: "nowrap" }}
      >
        🔄 Reset Filters
      </button>
    </div>
  );
};

export default ProductFilter;
