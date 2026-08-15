import { useState, useEffect } from "react";
import { getProducts, getCategories } from "../api/productApi";
import ProductFilter from "../components/product/ProductFilter";
import ProductGrid from "../components/product/ProductGrid";
import Pagination from "../components/common/Pagination";
import Navbar from "../components/common/Navbar";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const initialFilterState = {
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
    page: 1,
    limit: 8,
  };

  const [filters, setFilters] = useState(initialFilterState);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });

  // Fetch Categories on Mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        if (res.success && res.categories) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchCats();
  }, []);

  // Fetch Products whenever filters change
  useEffect(() => {
    const fetchProds = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getProducts(filters);
        if (res.success) {
          setProducts(res.products || []);
          const pageInfo = res.pagination || {};
          setPagination({
            currentPage: pageInfo.currentPage || res.page || 1,
            totalPages: pageInfo.totalPages || res.pages || 1,
            totalProducts: pageInfo.totalProducts || res.total || 0,
          });
        } else {
          setError(res.message || "Failed to load products");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "An error occurred while fetching products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProds();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, page: 1, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilterState);
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <Navbar activePage="shop" />

      {/* Storefront / Catalog Section */}
      <section className="catalog-section" id="catalog" style={{ paddingTop: "20px" }}>
        {/* Horizontal Top Filter Toolbar Navbar */}
        <ProductFilter
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Header Title */}
        <div className="catalog-header" style={{ textAlign: "left", marginBottom: "24px" }}>
          <h2>Storefront Catalog</h2>
          <p>Browse our hand-picked selection of top products</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {/* Product Grid */}
        <ProductGrid products={products} loading={loading} />

        {/* Pagination Controls */}
        {!loading && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </section>
    </div>
  );
};

export default Products;
