import ProductCard from "./ProductCard";
import Loader from "../common/Loader";

const ProductGrid = ({ products = [], loading, error }) => {
  if (loading) {
    return <Loader text="Loading products..." />;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <h3>No Products Found</h3>
        <p>Try adjusting your search query or removing filters.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
