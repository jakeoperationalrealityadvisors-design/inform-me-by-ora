import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

// Resolve plan_key from a Stripe price ID
function resolvePlanKey(priceId) {
    const map = {
        [Deno.env.get('STRIPE_PRICE_LAUNCH_1')]:   'launch_1',
        [Deno.env.get('STRIPE_PRICE_LAUNCH_10')]:  'launch_10',
        [Deno.env.get('STRIPE_PRICE_BASIC')]:      'basic',
        [Deno.env.get('STRIPE_PRICE_PRO')]:        'pro',
        [Deno.env.get('STRIPE_PRICE_ENTERPRISE')]: 'enterprise',
    };
    return map[priceId] || null;
}

const PLAN_NAMES = {
    launch_1:   'Launch Access',
    launch_10:  'Founding Access',
    basic:      'Basic',
    pro:        'Professional',
    enterprise: 'Enterprise',
};

const LAUNCH_TIERS = new Set(['launch_1', 'launch_10']);

async function upsertSubscription(base44, data) {
    // Find existing subscription record for this user
    const existing = await base44.asServiceRole.entities.UserSubscription.filter({
        user_email: data.user_email,
    });

    if (existing.length > 0) {
        await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, data);
        console.log(`Updated subscription for ${data.user_email}: ${data.plan_key} (${data.status})`);
    } else {
        await base44.asServiceRole.entities.UserSubscription.create(data);
        console.log(`Created subscription for ${data.user_email}: ${data.plan_key} (${data.status})`);
    }

    // Also log billing history for paid events
    if (data.amount_paid) {
        await base44.asServiceRole.entities.BillingHistory.create({
            organization_id: data.organization_id || '',
            amount: data.amount_paid / 100,
            currency: data.currency || 'usd',
            status: 'completed',
            plan_type: data.plan_key,
            period_start: new Date().toISOString().split('T')[0],
            period_end: data.current_period_end
                ? new Date(data.current_period_end * 1000).toISOString().split('T')[0]
                : null,
            transaction_id: data.invoice_id || Date.now().toString(),
        });
    }
}

async function getUserByEmail(base44, email) {
    const users = await base44.asServiceRole.entities.User.filter({ email });
    return users?.[0] || null;
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
        console.error('Webhook signature failed:', err.message);
        return new Response('Invalid signature', { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    try {
        switch (event.type) {

            case 'checkout.session.completed': {
                const session = event.data.object;
                if (session.mode !== 'subscription') break;

                const planKey = session.metadata?.plan_key;
                const userEmail = session.metadata?.user_email;
                const userId = session.metadata?.user_id;
                if (!planKey || !userEmail) break;

                const subscription = await stripe.subscriptions.retrieve(session.subscription);
                const priceId = subscription.items.data[0]?.price?.id;

                await upsertSubscription(base44, {
                    user_id: userId,
                    user_email: userEmail,
                    stripe_customer_id: session.customer,
                    stripe_subscription_id: session.subscription,
                    stripe_price_id: priceId,
                    plan_key: planKey,
                    plan_name: PLAN_NAMES[planKey] || planKey,
                    status: 'active',
                    billing_interval: subscription.items.data[0]?.price?.recurring?.interval || 'month',
                    current_period_end: subscription.current_period_end,
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    is_launch_tier: LAUNCH_TIERS.has(planKey),
                });

                console.log(`✅ Checkout complete: ${userEmail} → ${planKey}`);
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object;
                if (!invoice.subscription) break;

                const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
                const userEmail = subscription.metadata?.user_email;
                const userId = subscription.metadata?.user_id;
                const planKey = subscription.metadata?.plan_key
                    || resolvePlanKey(subscription.items.data[0]?.price?.id);
                if (!userEmail) break;

                await upsertSubscription(base44, {
                    user_id: userId,
                    user_email: userEmail,
                    stripe_customer_id: invoice.customer,
                    stripe_subscription_id: invoice.subscription,
                    stripe_price_id: subscription.items.data[0]?.price?.id,
                    plan_key: planKey,
                    plan_name: PLAN_NAMES[planKey] || planKey,
                    status: 'active',
                    billing_interval: subscription.items.data[0]?.price?.recurring?.interval || 'month',
                    current_period_end: subscription.current_period_end,
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    is_launch_tier: LAUNCH_TIERS.has(planKey),
                    amount_paid: invoice.amount_paid,
                    currency: invoice.currency,
                    invoice_id: invoice.id,
                });

                console.log(`💳 Invoice paid: ${userEmail} → ${planKey}`);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const customer = await stripe.customers.retrieve(invoice.customer);
                const userEmail = customer.email;
                if (!userEmail) break;

                const existingSubs = await base44.asServiceRole.entities.UserSubscription.filter({
                    user_email: userEmail,
                });
                if (existingSubs.length > 0) {
                    await base44.asServiceRole.entities.UserSubscription.update(existingSubs[0].id, {
                        status: 'past_due',
                    });
                }

                // Log failed payment
                await base44.asServiceRole.entities.BillingHistory.create({
                    organization_id: existingSubs[0]?.organization_id || '',
                    amount: invoice.amount_due / 100,
                    currency: invoice.currency,
                    status: 'failed',
                    plan_type: existingSubs[0]?.plan_key || 'unknown',
                    period_start: new Date().toISOString().split('T')[0],
                    transaction_id: invoice.id,
                });

                console.log(`⚠️ Payment failed: ${userEmail}`);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const userEmail = subscription.metadata?.user_email;
                const userId = subscription.metadata?.user_id;
                if (!userEmail) break;

                const priceId = subscription.items.data[0]?.price?.id;
                const planKey = subscription.metadata?.plan_key || resolvePlanKey(priceId);

                await upsertSubscription(base44, {
                    user_id: userId,
                    user_email: userEmail,
                    stripe_customer_id: subscription.customer,
                    stripe_subscription_id: subscription.id,
                    stripe_price_id: priceId,
                    plan_key: planKey,
                    plan_name: PLAN_NAMES[planKey] || planKey,
                    status: subscription.status,
                    billing_interval: subscription.items.data[0]?.price?.recurring?.interval || 'month',
                    current_period_end: subscription.current_period_end,
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    is_launch_tier: LAUNCH_TIERS.has(planKey),
                });

                console.log(`🔄 Subscription updated: ${userEmail} → ${planKey} (${subscription.status})`);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const userEmail = subscription.metadata?.user_email;
                if (!userEmail) break;

                const existingSubs = await base44.asServiceRole.entities.UserSubscription.filter({
                    user_email: userEmail,
                });
                if (existingSubs.length > 0) {
                    await base44.asServiceRole.entities.UserSubscription.update(existingSubs[0].id, {
                        status: 'canceled',
                        plan_key: 'trial',
                        plan_name: 'Free Trial',
                        cancel_at_period_end: false,
                        stripe_subscription_id: null,
                        stripe_price_id: null,
                        is_launch_tier: false,
                    });
                }

                console.log(`❌ Subscription canceled: ${userEmail}`);
                break;
            }

            default:
                console.log(`Unhandled event: ${event.type}`);
        }
    } catch (err) {
        console.error('Handler error:', err);
        // Return 200 to prevent Stripe retries for app-level errors
    }

    return Response.json({ received: true });
});