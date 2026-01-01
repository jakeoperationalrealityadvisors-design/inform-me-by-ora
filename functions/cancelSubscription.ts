import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId, isTest } = await req.json();

        if (!organizationId) {
            return Response.json({ error: 'Organization ID required' }, { status: 400 });
        }

        // Verify user has permission
        if (user.role !== 'admin' && user.organization_id !== organizationId) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (isTest) {
            // Test mode - just log the action
            return Response.json({ 
                success: true,
                message: 'Test cancellation successful',
                test: true
            });
        }

        // Production cancellation would integrate with Stripe API
        // const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
        // const org = await getOrganization(organizationId);
        // await stripe.subscriptions.cancel(org.stripe_subscription_id);

        // Update organization status
        await base44.asServiceRole.entities.Organization.update(organizationId, {
            status: 'cancelled',
            plan_type: 'trial'
        });

        // Create billing record
        await base44.asServiceRole.entities.BillingHistory.create({
            organization_id: organizationId,
            amount: 0,
            status: 'refunded',
            plan_type: 'cancelled',
            transaction_id: 'cancel_' + Date.now()
        });

        return Response.json({ 
            success: true,
            message: 'Subscription cancelled successfully' 
        });
    } catch (error) {
        console.error('Cancellation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});