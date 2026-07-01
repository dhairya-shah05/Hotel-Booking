import Stripe from "stripe";
import Booking from "../models/booking.js";

// API to handle stripe webhooks

export const stripeWebhooks = async (request, response) => {
    // Stripe gateway initialize
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        response.status(400).send(`Webhook Error: ${error.message}`)
    }

    if(event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        const session = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntentId,
        });

        const {bookingId} = session.data[0].metadata;
        // Mark Payment as Paid
        await Booking.findByIdAndUpdate(bookingId, {isPaid: true, paymentMethod: "Stripe"})
    } else {
        console.log("Unhandled Even Type: ", event.type)
    }
    response.json({received:true})
}