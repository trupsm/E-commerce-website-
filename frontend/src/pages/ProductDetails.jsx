import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../api/productApi";
import useCart from "../hooks/useCart";
import Loader from "../components/common/Loader";

const getFallbackImage = (product) => {
  const name = (product?.name || "").toLowerCase();
  const cat = (product?.category?.name || "").toLowerCase();

  if (name.includes("shoe") || cat.includes("footwear")) {
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80";
  }
  if (name.includes("shirt") || name.includes("cloth") || cat.includes("clothing")) {
    return "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=1000&auto=format&fit=crop&q=80";
  }
  if (name.includes("headphone") || name.includes("audio")) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80";
  }
  if (name.includes("laptop") || name.includes("computer")) {
    return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1000&auto=format&fit=crop&q=80";
  }
  return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80";
};

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getProductById(id);
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load product details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    await addToCart(product, quantity);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  if (loading) {
    return (
      <div className="page-container">
        <Loader text="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error || "Product not found"}</div>
        <Link to="/" className="btn btn-secondary btn-sm">
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  const firstImage = product.images && product.images.length > 0 ? product.images[0] : null;
  const isDummyUrl = firstImage && firstImage.includes("example.com");
  const imageUrl = firstImage && !isDummyUrl ? firstImage : getFallbackImage(product);

  return (
    <div className="page-container">
      <Link to="/" className="btn-back">
        ← Back to Catalog
      </Link>

      <div className="product-details-layout">
        {/* Product Image */}
        <div className="details-image-card">
          <img
            src={imageUrl}
            alt={product.name}
            className="details-image"
            onError={(e) => {
              e.target.src = getFallbackImage(product);
            }}
          />
          {product.stock <= 0 ? (
            <span className="stock-badge out-of-stock">Out of Stock</span>
          ) : product.stock < 5 ? (
            <span className="stock-badge low-stock">Only {product.stock} left in stock</span>
          ) : (
            <span className="stock-badge in-stock">In Stock ({product.stock})</span>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="details-info-card">
          {product.category?.name && (
            <span className="product-category">{product.category.name}</span>
          )}

          <h1 className="details-title">{product.name}</h1>

          {product.brand && (
            <p className="details-brand">
              Brand: <span>{product.brand}</span>
            </p>
          )}

          <div className="details-rating">
            <span className="stars">★ {product.rating ? product.rating.toFixed(1) : "New"}</span>
            {product.numReviews > 0 && (
              <span className="review-count">({product.numReviews} customer reviews)</span>
            )}
          </div>

          <div className="details-price">${product.price?.toFixed(2)}</div>

          <div className="details-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {/* Cart Quantity & Action */}
          {product.stock > 0 && (
            <div className="details-action-box">
              <div className="quantity-selector">
                <label htmlFor="qty">Quantity:</label>
                <select
                  id="qty"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                >
                  {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn btn-primary btn-lg add-to-cart-btn"
              >
                🛒 Add to Cart ({quantity})
              </button>
            </div>
          )}

          {addedMessage && (
            <div className="alert alert-success" style={{ marginTop: "16px" }}>
              ✅ Added {quantity} item(s) to your cart!{" "}
              <Link to="/cart" style={{ color: "inherit", fontWeight: 600 }}>View Cart →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
