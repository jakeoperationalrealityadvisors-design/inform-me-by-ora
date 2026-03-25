import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
        const { returnUrl } = await req.json().catch(() => ({}));

        // Get customer ID from UserSubscription record first
        const subs = await base44.entities.UserSubscription.filter({ user_email: user.email });
        let customerId = subs?.[0]?.stripe_customer_id;

        // Fallback: search Stripe directly
        if (!customerId) {
            const customers = await stripe.customers.list({ email: user.email, limit: 1 });
            if (customers.data.length === 0) {
                return Response.json({ error: 'No billing account found. Please subscribe first.' }, { status: 404 });
            }
            customerId = customers.data[0].id;
        }

        const appUrl = req.headers.get('origin') || 'https://app.base44.com';
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || `${appUrl}/CustomerPortal`,
        });

        return Response.json({ url: session.url });
    } catch (error) {
        console.error('Portal session error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});