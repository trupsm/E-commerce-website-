import { useState } from "react";
import { Link } from "react-router-dom";
import useCart from "../../hooks/useCart";

const getFallbackImage = (product) => {
  const name = (product.name || "").toLowerCase();
  const cat = (product.category?.name || "").toLowerCase();

  if (name.includes("shoe") || cat.includes("footwear")) {
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80";
  }
  if (name.includes("shirt") || name.includes("cloth") || cat.includes("clothing")) {
    return "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("headphone") || name.includes("audio")) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80";
  }
  if (name.includes("laptop") || name.includes("computer")) {
    return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80";
  }
  return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const firstImage = product.images && product.images.length > 0 ? product.images[0] : null;
  const isDummyUrl = firstImage && firstImage.includes("example.com");
  
  const imageUrl = firstImage && !isDummyUrl ? firstImage : getFallbackImage(product);

  const handleAdd = async () => {
    await addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-image-wrapper">
        <img
          src={imageUrl}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = getFallbackImage(product);
          }}
        />
        {product.stock <= 0 ? (
          <span className="stock-badge out-of-stock">Out of Stock</span>
        ) : product.stock < 5 ? (
          <span className="stock-badge low-stock">Only {product.stock} left!</span>
        ) : null}
      </Link>

      <div className="product-info">
        {product.category?.name && (
          <span className="product-category">{product.category.name}</span>
        )}

        <h3 className="product-title">
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h3>

        {product.brand && <p className="product-brand">{product.brand}</p>}

        <div className="product-rating">
          <span className="stars">★ {product.rating ? product.rating.toFixed(1) : "New"}</span>
          {product.numReviews > 0 && (
            <span className="review-count">({product.numReviews})</span>
          )}
        </div>

        <div className="product-footer">
          <div className="product-footer-top">
            <div className="product-price">${product.price?.toFixed(2)}</div>
          </div>
          <div className="product-actions">
            {product.stock > 0 && (
              <button
                onClick={handleAdd}
                className={`btn btn-sm ${added ? "btn-added" : "btn-primary"}`}
                disabled={added}
              >
                {added ? "✓ Added" : "Add to Cart"}
              </button>
            )}
            <Link
              to={`/products/${product._id}`}
              className="btn btn-secondary btn-sm"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
