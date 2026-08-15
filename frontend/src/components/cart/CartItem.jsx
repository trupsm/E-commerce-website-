import { Link } from "react-router-dom";
import useCart from "../../hooks/useCart";

const getFallbackImage = (product) => {
  const name = (product?.name || "").toLowerCase();
  const cat = (product?.category?.name || "").toLowerCase();
  if (name.includes("shoe") || cat.includes("footwear"))
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80";
  if (name.includes("shirt") || cat.includes("clothing"))
    return "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=200&auto=format&fit=crop&q=80";
  if (name.includes("headphone") || name.includes("audio"))
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80";
  if (name.includes("laptop"))
    return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&auto=format&fit=crop&q=80";
  return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80";
};

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem, loading } = useCart();

  const product = item.product || {};
  const productId = item.productId || product._id;
  const imageUrl =
    product.images && product.images.length > 0 && !product.images[0].includes("example.com")
      ? product.images[0]
      : getFallbackImage(product);

  const itemTotal = (product.price || 0) * item.quantity;

  return (
    <div className="cart-item">
      <Link to={`/products/${productId}`} className="cart-item-image-wrapper">
        <img
          src={imageUrl}
          alt={product.name || "Product"}
          className="cart-item-image"
          onError={(e) => { e.target.src = getFallbackImage(product); }}
        />
      </Link>

      <div className="cart-item-info">
        <h4 className="cart-item-name">
          <Link to={`/products/${productId}`}>{product.name || "Product"}</Link>
        </h4>
        {product.category?.name && (
          <span className="product-category">{product.category.name}</span>
        )}
        <div className="cart-item-price">${(product.price || 0).toFixed(2)} each</div>
      </div>

      <div className="cart-item-controls">
        <div className="qty-control">
          <button
            className="qty-btn"
            onClick={() => updateQuantity(productId, item.quantity - 1)}
            disabled={loading || item.quantity <= 1}
          >
            −
          </button>
          <span className="qty-value">{item.quantity}</span>
          <button
            className="qty-btn"
            onClick={() => updateQuantity(productId, item.quantity + 1)}
            disabled={loading || item.quantity >= (product.stock || 99)}
          >
            +
          </button>
        </div>

        <div className="cart-item-total">${itemTotal.toFixed(2)}</div>

        <button
          className="btn-remove"
          onClick={() => removeItem(productId)}
          disabled={loading}
          title="Remove item"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default CartItem;
