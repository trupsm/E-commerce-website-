import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getProducts, getCategories } from "../api/productApi";
import ProductFilter from "../components/product/ProductFilter";
import ProductGrid from "../components/product/ProductGrid";
import Pagination from "../components/common/Pagination";

const Products = () => {
  const { user, logout } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
    page: 1,
    limit: 8,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });

  // Fetch Categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch Products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.category) params.category = filters.category;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.sort) params.sort = filters.sort;
        params.page = filters.page;
        params.limit = filters.limit;

        const data = await getProducts(params);
        if (data.success) {
          setProducts(data.products || []);
          if (data.pagination) {
            setPagination({
              currentPage: data.pagination.currentPage,
              totalPages: data.pagination.totalPages,
              totalProducts: data.pagination.totalProducts,
            });
          }
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (newFilter) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilter,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
      page: 1,
      limit: 8,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="nav-brand">
          <Link to="/" style={{ textDecoration: "none" }}>
            <h1>Vyoma - A World Of Choices</h1>
          </Link>
        </div>
        <nav className="nav-links">
          {user ? (
            <div className="user-profile">
              <Link to="/profile" className="user-badge" style={{ textDecoration: "none" }}>
                👤 {user.name}
              </Link>
              <button onClick={logout} className="btn btn-secondary btn-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Storefront / Catalog Section */}
      <section className="catalog-section" id="catalog">
        <div className="catalog-header">
          <h2>Storefront Catalog</h2>
          <p>Browse our hand-picked selection of top products</p>
        </div>

        <div className="catalog-layout">
          {/* Filters Sidebar */}
          <aside className="catalog-sidebar">
            <ProductFilter
              categories={categories}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />
          </aside>

          {/* Products Grid + Pagination */}
          <main className="catalog-main">
            <ProductGrid
              products={products}
              loading={loading}
              error={error}
            />

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </main>
        </div>
      </section>
    </div>
  );
};

export default Products;
