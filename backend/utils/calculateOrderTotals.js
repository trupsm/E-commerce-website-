const TAX_RATE = 0.18;
const FREE_SHIPPING_THRESHOLD = 1000;
const STANDARD_SHIPPING_COST = 100;

// Calculate Order Totals
const calculateOrderTotals = (items) => {
    const subtotal = items.reduce((total, item) => { return (total + item.price * item.quantity); }, 0);
    const tax = subtotal * TAX_RATE;
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
    const total = subtotal + tax + shippingCost;
    return {
        subtotal,
        tax,
        shippingCost,
        total
    };
};
module.exports = calculateOrderTotals;