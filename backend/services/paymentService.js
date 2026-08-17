const Stripe = require("stripe");

const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        throw new Error("STRIPE_SECRET_KEY is not defined in backend/.env");
    }
    return new Stripe(key);
};



// ======================================================
// Create Payment Intent
// ======================================================

const createPaymentIntent = async ({
    amount,
    currency = "inr",
    orderId,
    userId
}) => {
    const stripe = getStripe();
    const paymentIntent =
        await stripe.paymentIntents.create({
            amount,
            currency,

            automatic_payment_methods: {
                enabled: true
            },

            metadata: {
                orderId: orderId.toString(),
                userId: userId.toString()
            }
        });

    return paymentIntent;
};

// ======================================================
// Retrieve Payment Intent
// ======================================================

const getPaymentIntent = async (
    paymentIntentId
) => {
    const stripe = getStripe();
    return stripe.paymentIntents.retrieve(
        paymentIntentId
    );
};



module.exports = {
    createPaymentIntent,
    getPaymentIntent
};