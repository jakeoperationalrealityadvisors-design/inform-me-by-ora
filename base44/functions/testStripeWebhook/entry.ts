import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { eventType } = await req.json();

        // Simulate webhook event processing
        switch (eventType) {
            case 'checkout.session.completed':
                // Create test billing record
                await base44.asServiceRole.entities.BillingHistory.create({
                    organization_id: user.organization_id,
                    amount: 29.99,
                    currency: 'USD',
                    status: 'completed',
                    plan_type: 'professional',
                    period_start: new Date().toISOString(),
                    period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    payment_method: 'test_card',
                    transaction_id: 'test_' + Date.now()
                });
                break;

            case 'customer.subscription.updated':
                // Test subscription update
                break;

            case 'customer.subscription.deleted':
                // Test subscription cancellation
                break;

            default:
                return Response.json({ error: 'Unknown event type' }, { status: 400 });
        }

        return Response.json({ 
            success: true,
            message: `Webhook event ${eventType} processed successfully` 
        });
    } catch (error) {
        console.error('Webhook test error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});