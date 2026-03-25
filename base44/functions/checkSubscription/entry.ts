import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const PLAN_LIMITS = {
    trial:        { forms: 5,  users: 3,   reports: 10,  automation: false, analytics: false, ai: false },
    basic:        { forms: 50, users: 25,  reports: -1,  automation: false, analytics: true,  ai: false },
    professional: { forms: -1, users: 100, reports: -1,  automation: true,  analytics: true,  ai: true  },
    enterprise:   { forms: -1, users: -1,  reports: -1,  automation: true,  analytics: true,  ai: true  },
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        let plan = user.subscription_plan || 'trial';
        let status = user.subscription_status || 'trial';
        let periodEnd = user.subscription_current_period_end || null;

        // If user has a Stripe subscription ID, verify with Stripe for source of truth
        if (user.stripe_subscription_id) {
            try {
                const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
                const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
                status = subscription.status;

                if (status !== 'active' && status !== 'trialing') {
                    plan = 'trial';
                }

                periodEnd = subscription.current_period_end;
            } catch (stripeErr) {
                console.warn('Stripe verification failed, using cached data:', stripeErr.message);
            }
        }

        const isActive = status === 'active' || status === 'trialing' || plan === 'trial';
        const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.trial;

        return Response.json({
            plan,
            status,
            isActive,
            periodEnd,
            limits,
            isTrial: plan === 'trial',
            isPaid: plan !== 'trial' && isActive,
        });
    } catch (error) {
        console.error('Check subscription error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});