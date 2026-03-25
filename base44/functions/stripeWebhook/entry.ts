import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const PLAN_MAP = {
    2900:  'basic',
    7900:  'professional',
    19900: 'enterprise',
};

async function updateUserSubscription(base44, userEmail, planId, status, stripeData = {}) {
    // Find user by email
    const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
    if (!users || users.length === 0) {
        console.error('User not found:', userEmail);
        return;
    }
    const user = users[0];

    // Update user with subscription info
    await base44.asServiceRole.entities.User.update(user.id, {
        subscription_plan: planId,
        subscription_status: status,
        stripe_customer_id: stripeData.customerId || user.stripe_customer_id,
        stripe_subscription_id: stripeData.subscriptionId || user.stripe_subscription_id,
        subscription_current_period_end: stripeData.periodEnd || null,
    });

    // Find org and update it too
    if (user.organization_id) {
        await base44.asServiceRole.entities.Organization.update(user.organization_id, {
            plan_type: status === 'active' ? planId : 'trial',
            status: status === 'active' ? 'active' : 'trial_expired',
        });
    }

    // Log billing history
    if (stripeData.amount) {
        await base44.asServiceRole.entities.BillingHistory.create({
            organization_id: user.organization_id || '',
            amount: stripeData.amount / 100,
            currency: stripeData.currency || 'usd',
            status: status === 'active' ? 'completed' : 'failed',
            plan_type: planId,
            period_start: new Date().toISOString().split('T')[0],
            period_end: stripeData.periodEnd ? new Date(stripeData.periodEnd * 1000).toISOString().split('T')[0] : null,
            transaction_id: stripeData.invoiceId || stripeData.sessionId || Date.now().toString(),
        });
    }
}

Deno.serve(async (req) => {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;
    try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return new Response('Webhook signature verification failed', { status: 400 });
    }

    // Init base44 as service role (no user auth for webhooks)
    const base44 = createClientFromRequest(req);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                if (session.mode !== 'subscription') break;

                const planId = session.metadata?.plan_id;
                const userEmail = session.metadata?.user_email;
                if (!planId || !userEmail) break;

                // Retrieve subscription to get period end
                const subscription = await stripe.subscriptions.retrieve(session.subscription);
                const amount = subscription.items.data[0]?.price?.unit_amount;

                await updateUserSubscription(base44, userEmail, planId, 'active', {
                    customerId: session.customer,
                    subscriptionId: session.subscription,
                    periodEnd: subscription.current_period_end,
                    amount,
                    currency: subscription.currency,
                    sessionId: session.id,
                });

                console.log(`✅ Subscription activated: ${userEmail} → ${planId}`);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const planId = subscription.metadata?.plan_id;
                const userEmail = subscription.metadata?.user_email;
                if (!userEmail) break;

                const amount = subscription.items.data[0]?.price?.unit_amount;
                const resolvedPlan = planId || PLAN_MAP[amount] || 'basic';
                const status = subscription.status === 'active' ? 'active' : subscription.status;

                await updateUserSubscription(base44, userEmail, resolvedPlan, status, {
                    customerId: subscription.customer,
                    subscriptionId: subscription.id,
                    periodEnd: subscription.current_period_end,
                });

                console.log(`🔄 Subscription updated: ${userEmail} → ${resolvedPlan} (${status})`);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const userEmail = subscription.metadata?.user_email;
                if (!userEmail) break;

                await updateUserSubscription(base44, userEmail, 'trial', 'canceled', {
                    customerId: subscription.customer,
                    subscriptionId: subscription.id,
                });

                console.log(`❌ Subscription canceled: ${userEmail}`);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const customer = await stripe.customers.retrieve(invoice.customer);
                const userEmail = customer.email;
                if (!userEmail) break;

                // Mark as past_due — don't revoke yet
                await updateUserSubscription(base44, userEmail, null, 'past_due', {
                    customerId: invoice.customer,
                    subscriptionId: invoice.subscription,
                    amount: invoice.amount_due,
                    currency: invoice.currency,
                    invoiceId: invoice.id,
                });

                console.log(`⚠️ Payment failed: ${userEmail}`);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                if (!invoice.subscription) break;

                const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
                const userEmail = subscription.metadata?.user_email;
                const planId = subscription.metadata?.plan_id;
                if (!userEmail) break;

                const amount = subscription.items.data[0]?.price?.unit_amount;
                const resolvedPlan = planId || PLAN_MAP[amount] || 'basic';

                await updateUserSubscription(base44, userEmail, resolvedPlan, 'active', {
                    customerId: invoice.customer,
                    subscriptionId: invoice.subscription,
                    periodEnd: subscription.current_period_end,
                    amount: invoice.amount_paid,
                    currency: invoice.currency,
                    invoiceId: invoice.id,
                });

                console.log(`💳 Payment succeeded: ${userEmail} → ${resolvedPlan}`);
                break;
            }

            default:
                console.log(`Unhandled event: ${event.type}`);
        }
    } catch (err) {
        console.error('Handler error:', err);
        // Still return 200 to prevent Stripe retries for app-level errors
    }

    return Response.json({ received: true });
});