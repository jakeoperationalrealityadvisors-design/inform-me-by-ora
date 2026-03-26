import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FEATURE_ACCESS = {
    trial: {
        maxForms: 5, maxUsers: 3, maxReports: 10,
        automation: false, analytics: false, ai: false,
        advancedRoles: false, apiAccess: false,
    },
    basic: {
        maxForms: 50, maxUsers: 25, maxReports: -1,
        automation: false, analytics: true, ai: false,
        advancedRoles: false, apiAccess: false,
    },
    pro: {
        maxForms: -1, maxUsers: 100, maxReports: -1,
        automation: true, analytics: true, ai: true,
        advancedRoles: true, apiAccess: false,
    },
    enterprise: {
        maxForms: -1, maxUsers: -1, maxReports: -1,
        automation: true, analytics: true, ai: true,
        advancedRoles: true, apiAccess: true,
    },
};

// Launch tiers map to pro feature level
const PLAN_FEATURE_LEVEL = {
    trial:      'trial',
    launch_1:   'pro',
    launch_10:  'pro',
    basic:      'basic',
    pro:        'pro',
    enterprise: 'enterprise',
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        let user = null;
        try { user = await base44.auth.me(); } catch (_) {}

        if (!user) {
            // Return trial-level access for unauthenticated/guest users
            return Response.json({
                planKey: 'trial', planName: 'Free Trial', status: 'trial',
                isActive: true, isTrial: true, isPaid: false, isLaunchTier: false,
                currentPeriodEnd: null, cancelAtPeriodEnd: false, billingInterval: null,
                featureLevel: 'trial', limits: FEATURE_ACCESS.trial,
            });
        }

        const subs = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: user.email });
        const sub = subs?.[0];

        const planKey = sub?.plan_key || 'trial';
        const status = sub?.status || 'trial';
        // past_due and canceled = no paid access; trial users always have trial access
        const isActive = status === 'active' || status === 'trialing' || planKey === 'trial';
        const featureLevel = PLAN_FEATURE_LEVEL[isActive ? planKey : 'trial'];

        return Response.json({
            planKey,
            planName: sub?.plan_name || 'Free Trial',
            status,
            isActive,
            isTrial: planKey === 'trial',
            isPaid: planKey !== 'trial' && isActive,
            isLaunchTier: sub?.is_launch_tier || false,
            currentPeriodEnd: sub?.current_period_end || null,
            cancelAtPeriodEnd: sub?.cancel_at_period_end || false,
            billingInterval: sub?.billing_interval || null,
            featureLevel,
            limits: FEATURE_ACCESS[featureLevel] || FEATURE_ACCESS.trial,
        });
    } catch (error) {
        console.error('checkSubscription error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});