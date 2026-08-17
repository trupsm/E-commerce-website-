const Stripe = require("stripe");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getStripe = () => {
    return new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_key");
};




const handleStripeWebhook =
    async (req, res) => {

        const signature =
            req.headers[
            "stripe-signature"
            ];


        let event;


        try {
            const stripe = getStripe();
            event =
                stripe.webhooks.constructEvent(
                    req.body,
                    signature,
                    process.env
                        .STRIPE_WEBHOOK_SECRET
                );

        } catch (error) {

            console.error(
                "Stripe webhook signature verification failed:",
                error.message
            );


            return res
                .status(400)
                .send(
                    `Webhook Error: ${error.message}`
                );
        }


        try {

            switch (
            event.type
            ) {

                // ====================================
                // Payment succeeded
                // ====================================

                case "payment_intent.succeeded": {
                    const paymentIntent = event.data.object;
                    const orderId = paymentIntent.metadata?.orderId;

                    if (!orderId) {
                        break;
                    }

                    const order = await Order.findById(orderId);
                    if (order && order.paymentStatus !== "paid") {
                        order.paymentStatus = "paid";
                        order.paidAt = new Date();
                        order.paymentResult = {
                            gatewayTransactionId: paymentIntent.id,
                            status: "COMPLETED",
                            updatedAt: new Date().toISOString(),
                            email: paymentIntent.receipt_email || "",
                        };
                        await order.save();

                        // Decrement stock for ordered items
                        for (const item of order.items) {
                            await Product.findByIdAndUpdate(item.product, {
                                $inc: { stock: -item.quantity }
                            });
                        }

                        // Clear the user's cart in database
                        await Cart.findOneAndUpdate(
                            { user: order.user },
                            { $set: { items: [] } }
                        );

                        console.log(`Order ${orderId} marked paid, stock decremented, and cart cleared.`);
                    }

                    break;
                }



                // ====================================
                // Payment failed
                // ====================================

                case "payment_intent.payment_failed": {

                    const paymentIntent =
                        event.data.object;


                    const orderId =
                        paymentIntent
                            .metadata
                            .orderId;


                    if (!orderId) {
                        break;
                    }


                    await Order.findByIdAndUpdate(
                        orderId,
                        {
                            paymentStatus:
                                "failed"
                        }
                    );


                    break;
                }


                default:

                    console.log(
                        `Unhandled Stripe event: ${event.type}`
                    );

            }


            res.json({
                received: true
            });

        } catch (error) {

            console.error(
                "Stripe webhook processing failed:",
                error
            );


            res.status(500).json({
                success: false
            });
        }
    };


module.exports = {
    handleStripeWebhook
};