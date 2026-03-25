import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

// Server-side price ID map — resolved from secrets
function getPriceId(planKey) {
    const map = {
        launch_1:   Deno.env.get('STRIPE_PRICE_LAUNCH_1'),
        launch_10:  Deno.env.get('STRIPE_PRICE_LAUNCH_10'),
        basic:      Deno.env.get('STRIPE_PRICE_BASIC'),
        pro:        Deno.env.get('STRIPE_PRICE_PRO'),
        enterprise: Deno.env.get('STRIPE_PRICE_ENTERPRISE'),
    };
    return map[planKey] || null;
}

const PLAN_META = {
    launch_1:   { name: 'Launch Access',    isLaunchTier: true,  cap: 50 },
    launch_10:  { name: 'Founding Access',  isLaunchTier: true,  cap: 50 },
    basic:      { name: 'Basic',            isLaunchTier: false, cap: null },
    pro:        { name: 'Professional',     isLaunchTier: false, cap: null },
    enterprise: { name: 'Enterprise',       isLaunchTier: false, cap: null },
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { planKey, successUrl, cancelUrl } = await req.json();
        const plan = PLAN_META[planKey];
        if (!plan) return Response.json({ error: 'Invalid plan key' }, { status: 400 });

        const priceId = getPriceId(planKey);
        if (!priceId) return Response.json({ error: `Price ID not configured for plan: ${planKey}` }, { status: 500 });

        // Enforce launch tier caps
        if (plan.isLaunchTier) {
            const existing = await base44.asServiceRole.entities.UserSubscription.filter({
                plan_key: planKey,
                status: 'active',
            });
            if (existing.length >= plan.cap) {
                return Response.json({
                    error: `Sorry, all ${plan.cap} ${plan.name} spots have been taken.`,
                    capReached: true,
                }, { status: 409 });
            }
        }

        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

        // Find or create Stripe customer
        const existing = await stripe.customers.list({ email: user.email, limit: 1 });
        let customer = existing.data.length > 0
            ? existing.data[0]
            : await stripe.customers.create({
                email: user.email,
                name: user.full_name,
                metadata: { user_id: user.id, app: 'InformMe' },
            });

        const appUrl = req.headers.get('origin') || 'https://app.base44.com';

        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            metadata: {
                user_id: user.id,
                user_email: user.email,
                plan_key: planKey,
                app: 'InformMe',
            },
            subscription_data: {
                metadata: {
                    user_id: user.id,
                    user_email: user.email,
                    plan_key: planKey,
                    app: 'InformMe',
                },
            },
            success_url: successUrl || `${appUrl}/CustomerPortal?success=true`,
            cancel_url: cancelUrl || `${appUrl}/Pricing`,
        });

        return Response.json({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Checkout error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});