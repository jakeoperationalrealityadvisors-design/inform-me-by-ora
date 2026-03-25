import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const PLAN_PRICES = {
    basic:      { amount: 2900,  name: 'Basic Plan',        interval: 'month', forms: 50,   users: 25  },
    professional: { amount: 7900, name: 'Professional Plan', interval: 'month', forms: -1,   users: 100 },
    enterprise: { amount: 19900, name: 'Enterprise Plan',   interval: 'month', forms: -1,   users: -1  },
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { planId, successUrl, cancelUrl } = await req.json();

        if (!PLAN_PRICES[planId]) {
            return Response.json({ error: 'Invalid plan' }, { status: 400 });
        }

        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
        const plan = PLAN_PRICES[planId];

        // Find or create Stripe customer
        const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 });
        let customer;
        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
        } else {
            customer = await stripe.customers.create({
                email: user.email,
                name: user.full_name,
                metadata: { user_id: user.id }
            });
        }

        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: plan.name,
                        description: `InformMe ${plan.name} — ${plan.forms === -1 ? 'Unlimited' : plan.forms} forms, ${plan.users === -1 ? 'Unlimited' : plan.users} users`,
                    },
                    unit_amount: plan.amount,
                    recurring: { interval: plan.interval },
                },
                quantity: 1,
            }],
            metadata: {
                user_id: user.id,
                user_email: user.email,
                plan_id: planId,
            },
            subscription_data: {
                metadata: {
                    user_id: user.id,
                    user_email: user.email,
                    plan_id: planId,
                }
            },
            success_url: successUrl || 'https://app.base44.com/CustomerPortal?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: cancelUrl || 'https://app.base44.com/Pricing',
        });

        return Response.json({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Checkout error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});