/**
 * ONE-TIME SETUP: Run this once as an admin to create all Stripe products and prices.
 * After running, copy the price IDs from the response and set them as secrets:
 *   STRIPE_PRICE_LAUNCH_1, STRIPE_PRICE_LAUNCH_10, STRIPE_PRICE_BASIC, STRIPE_PRICE_PRO, STRIPE_PRICE_ENTERPRISE
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const PLANS = [
    {
        key: 'launch_1',
        productName: 'InformMe — Launch Access',
        description: 'Founding member plan — limited to first 50 users',
        price: 100, // $1.00 in cents
        interval: 'year',
    },
    {
        key: 'launch_10',
        productName: 'InformMe — Founding Access',
        description: 'Founding member plan — limited to next 50 users',
        price: 1000, // $10.00 in cents
        interval: 'year',
    },
    {
        key: 'basic',
        productName: 'InformMe — Basic',
        description: 'Up to 25 users — forms, checklists, analytics',
        price: 2900, // $29.00 in cents
        interval: 'month',
    },
    {
        key: 'pro',
        productName: 'InformMe — Professional',
        description: 'Up to 100 users — automation, AI assistant, advanced analytics',
        price: 7900, // $79.00 in cents
        interval: 'month',
    },
    {
        key: 'enterprise',
        productName: 'InformMe — Enterprise',
        description: 'Unlimited users — full access, dedicated support',
        price: 19900, // $199.00 in cents
        interval: 'month',
    },
];

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
        const results = {};

        for (const plan of PLANS) {
            // Check if product already exists
            const existingProducts = await stripe.products.search({
                query: `metadata['plan_key']:'${plan.key}'`,
            });

            let product;
            if (existingProducts.data.length > 0) {
                product = existingProducts.data[0];
                console.log(`Product already exists for ${plan.key}: ${product.id}`);
            } else {
                product = await stripe.products.create({
                    name: plan.productName,
                    description: plan.description,
                    metadata: { plan_key: plan.key, app: 'InformMe' },
                });
                console.log(`Created product for ${plan.key}: ${product.id}`);
            }

            // Check if price already exists for this product
            const existingPrices = await stripe.prices.list({
                product: product.id,
                active: true,
                limit: 1,
            });

            let price;
            if (existingPrices.data.length > 0) {
                price = existingPrices.data[0];
                console.log(`Price already exists for ${plan.key}: ${price.id}`);
            } else {
                price = await stripe.prices.create({
                    product: product.id,
                    unit_amount: plan.price,
                    currency: 'usd',
                    recurring: { interval: plan.interval },
                    metadata: { plan_key: plan.key },
                });
                console.log(`Created price for ${plan.key}: ${price.id}`);
            }

            results[plan.key] = {
                productId: product.id,
                priceId: price.id,
                amount: plan.price / 100,
                interval: plan.interval,
                secretName: `STRIPE_PRICE_${plan.key.toUpperCase().replace('_', '_')}`,
            };
        }

        console.log('\n=== COPY THESE PRICE IDs TO YOUR SECRETS ===');
        for (const [key, val] of Object.entries(results)) {
            const secretKey = `STRIPE_PRICE_${key.toUpperCase()}`;
            console.log(`${secretKey} = ${val.priceId}`);
        }
        console.log('==============================================\n');

        return Response.json({
            success: true,
            message: 'Products and prices created. Copy the priceIds below into your app secrets.',
            priceIds: Object.fromEntries(
                Object.entries(results).map(([key, val]) => [key, val.priceId])
            ),
            secretsToSet: Object.fromEntries(
                Object.entries(results).map(([key, val]) => [
                    `STRIPE_PRICE_${key.toUpperCase()}`,
                    val.priceId
                ])
            ),
            details: results,
        });
    } catch (error) {
        console.error('Setup error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});