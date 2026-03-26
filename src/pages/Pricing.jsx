import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles, Zap, Crown, TrendingUp, Loader2, AlertCircle, Star, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { PLAN_CONFIG } from '@/lib/stripePriceConfig';

// Launch tier plans shown separately above standard plans
const LAUNCH_PLANS = [
    {
        key: 'launch_1',
        name: 'Launch Access',
        price: 1,
        interval: 'year',
        badge: '🚀 Founding Member',
        scarcity: '50 total spots',
        description: 'Lock in lifetime founding rate',
        color: 'from-green-600 to-emerald-700',
        ringColor: 'ring-green-500',
        features: [
            'Pro-tier feature access',
            'Up to 100 users',
            'Unlimited forms & checklists',
            'AI Assistant included',
            'Advanced automation',
            'Locked-in founding price',
            'Priority onboarding',
        ],
        icon: Star,
    },
    {
        key: 'launch_10',
        name: 'Founding Access',
        price: 10,
        interval: 'year',
        badge: '⭐ Early Adopter',
        scarcity: '50 total spots',
        description: 'Early access at founding rate',
        color: 'from-teal-600 to-cyan-700',
        ringColor: 'ring-teal-500',
        features: [
            'Pro-tier feature access',
            'Up to 100 users',
            'Unlimited forms & checklists',
            'AI Assistant included',
            'Advanced automation',
            'Founding member badge',
            'Priority support',
        ],
        icon: Star,
    },
];

const STANDARD_PLANS = [
    {
        key: 'basic',
        name: 'Basic',
        price: 29,
        interval: 'month',
        description: 'Perfect for small field teams',
        color: 'from-blue-600 to-blue-700',
        ringColor: 'ring-blue-500',
        popular: false,
        features: [
            'Up to 25 users',
            '50 forms & checklists',
            'Unlimited reports',
            'Analytics dashboard',
            'Mobile + desktop access',
            'Priority email support',
        ],
        icon: Zap,
    },
    {
        key: 'pro',
        name: 'Professional',
        price: 79,
        interval: 'month',
        description: 'For growing field operations',
        color: 'from-[#FF8C00] to-[#CC7000]',
        ringColor: 'ring-[#FF8C00]',
        popular: true,
        features: [
            'Up to 100 users',
            'Unlimited forms & checklists',
            'Advanced automation',
            'AI Assistant',
            'Advanced analytics',
            'Role-based access control',
            'Priority support',
        ],
        icon: Crown,
    },
    {
        key: 'enterprise',
        name: 'Enterprise',
        price: 199,
        interval: 'month',
        description: 'Large-scale field operations',
        color: 'from-purple-600 to-purple-700',
        ringColor: 'ring-purple-500',
        popular: false,
        features: [
            'Unlimited users',
            'Unlimited everything',
            'API access',
            'Dedicated account manager',
            'Custom SLA',
            'SSO / advanced security',
            '24/7 phone support',
        ],
        icon: TrendingUp,
    },
];

function PlanCard({ plan, isCurrentPlan, isSoldOut, isLoading, onSelect }) {
    const Icon = plan.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex"
        >
            <Card className={`relative bg-[#0f1419] border-blue-900/20 flex flex-col w-full
                ${plan.popular ? `ring-2 ${plan.ringColor}` : ''}
                ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}
                ${isSoldOut ? 'opacity-60' : ''}
            `}>
                {plan.popular && !isCurrentPlan && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-[#FF8C00] to-[#CC7000] whitespace-nowrap px-3">
                            ⭐ Most Popular
                        </Badge>
                    </div>
                )}
                {isCurrentPlan && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-green-600 whitespace-nowrap px-3">✓ Current Plan</Badge>
                    </div>
                )}
                {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <Badge className={`bg-gradient-to-r ${plan.color} whitespace-nowrap px-3`}>
                            {plan.badge}
                        </Badge>
                    </div>
                )}

                <CardHeader className="pb-2">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                    <CardDescription className="text-blue-400 text-sm">{plan.description}</CardDescription>

                    {plan.scarcity && (
                        <p className={`text-xs font-semibold mt-1 ${isSoldOut ? 'text-red-400' : 'text-yellow-400'}`}>
                            {isSoldOut ? '🔴 Sold Out' : `⚡ ${plan.scarcity}`}
                        </p>
                    )}

                    <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">${plan.price}</span>
                        <span className="text-blue-400 text-sm">/{plan.interval}</span>
                    </div>
                </CardHeader>

                <CardContent className="flex flex-col flex-1 pt-0">
                    <ul className="space-y-1.5 flex-1 mb-4">
                        {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-blue-300">
                                <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>

                    <Button
                        onClick={() => !isCurrentPlan && !isSoldOut && onSelect(plan.key)}
                        disabled={isCurrentPlan || isSoldOut || isLoading}
                        className={`w-full ${
                            isCurrentPlan ? 'bg-green-700 opacity-80 cursor-default' :
                            isSoldOut ? 'bg-slate-700 cursor-not-allowed' :
                            plan.popular ? 'bg-gradient-to-r from-[#FF8C00] to-[#CC7000] hover:opacity-90' :
                            `bg-gradient-to-r ${plan.color} hover:opacity-90`
                        }`}
                    >
                        {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Opening...</> :
                         isCurrentPlan ? '✓ Current Plan' :
                         isSoldOut ? <><Lock className="w-4 h-4 mr-2" />Sold Out</> :
                         plan.key.startsWith('launch') ? `Get ${plan.name} →` :
                         'Subscribe Now →'}
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function Pricing() {
    const navigate = useNavigate();
    const [loadingPlan, setLoadingPlan] = useState(null);

    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me().catch(() => null),
    });

    const { data: subscription, isLoading: subLoading } = useQuery({
        queryKey: ['subscription'],
        queryFn: () => base44.functions.invoke('checkSubscription', {}).then(r => r.data),
        enabled: !!user,
    });

    // Check launch tier counts for cap enforcement
    const { data: launch1Count } = useQuery({
        queryKey: ['launch1-count'],
        queryFn: () => base44.entities.UserSubscription.filter({ plan_key: 'launch_1', status: 'active' }).then(r => r.length),
    });
    const { data: launch10Count } = useQuery({
        queryKey: ['launch10-count'],
        queryFn: () => base44.entities.UserSubscription.filter({ plan_key: 'launch_10', status: 'active' }).then(r => r.length),
    });

    const checkoutMutation = useMutation({
        mutationFn: async (planKey) => {
            const res = await base44.functions.invoke('createCheckoutSession', {
                planKey,
                successUrl: `${window.location.origin}/BillingSuccess`,
                cancelUrl: `${window.location.origin}/Pricing`,
            });
            if (res.data?.error) throw new Error(res.data.error);
            if (!res.data?.url) throw new Error('No checkout URL returned');
            return res.data;
        },
        onSuccess: (data) => {
            window.open(data.url, '_blank') || (window.location.href = data.url);
            setLoadingPlan(null);
        },
        onError: (error) => {
            toast.error(error.message || 'Checkout failed');
            setLoadingPlan(null);
        },
    });

    const handleSelect = (planKey) => {
        if (!user) {
            toast.info('Please sign in to subscribe');
            base44.auth.redirectToLogin('/Pricing');
            return;
        }
        setLoadingPlan(planKey);
        checkoutMutation.mutate(planKey);
    };

    const handleOpenPortal = async () => {
        try {
            const res = await base44.functions.invoke('createPortalSession', {
                returnUrl: window.location.href,
            });
            if (res.data?.url) window.location.href = res.data.url;
            else toast.error(res.data?.error || 'Could not open billing portal');
        } catch (e) {
            toast.error('Could not open billing portal');
        }
    };

    const currentPlan = subscription?.planKey || 'trial';
    const isLoading = userLoading || subLoading;

    const launch1SoldOut = (launch1Count ?? 0) >= 50;
    const launch10SoldOut = (launch10Count ?? 0) >= 50;
    const soldOutMap = { launch_1: launch1SoldOut, launch_10: launch10SoldOut };

    return (
        <div className="min-h-screen bg-[#0a0e17] overflow-y-auto pb-16">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to="/Settings">
                        <Button variant="ghost" size="icon" className="text-blue-400">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">Choose Your Plan</h1>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm text-blue-400">Current plan:</p>
                            <Badge className="capitalize bg-blue-900/50 text-blue-300">{subscription?.planName || 'Free Trial'}</Badge>
                            {subscription?.status === 'past_due' && <Badge className="bg-red-600">⚠ Payment Failed</Badge>}
                            {subscription?.cancelAtPeriodEnd && <Badge className="bg-yellow-700">Cancels at period end</Badge>}
                        </div>
                    </div>
                    {subscription?.isPaid && (
                        <Button variant="outline" size="sm" className="border-blue-700 text-blue-300" onClick={handleOpenPortal}>
                            Manage Billing
                        </Button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">

                {/* Past due alert */}
                {subscription?.status === 'past_due' && (
                    <div className="p-4 bg-red-950/40 border border-red-600/40 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                        <p className="text-red-300 text-sm flex-1">Your last payment failed. Update your billing info to restore full access.</p>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 shrink-0" onClick={handleOpenPortal}>
                            Update Billing
                        </Button>
                    </div>
                )}

                {/* Launch Tiers */}
                <div>
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-white mb-1">🚀 Launch Tiers — Limited Time</h2>
                        <p className="text-blue-400 text-sm">Lock in founding rates before they're gone. These plans give you Pro-tier access.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {LAUNCH_PLANS.map((plan) => (
                            <PlanCard
                                key={plan.key}
                                plan={plan}
                                isCurrentPlan={currentPlan === plan.key}
                                isSoldOut={soldOutMap[plan.key]}
                                isLoading={loadingPlan === plan.key && checkoutMutation.isPending}
                                onSelect={handleSelect}
                            />
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 border-t border-blue-900/30" />
                    <span className="text-blue-400 text-sm whitespace-nowrap">Standard Monthly Plans</span>
                    <div className="flex-1 border-t border-blue-900/30" />
                </div>

                {/* Standard Plans */}
                <div>
                    <p className="text-center text-blue-400/60 text-xs mb-6">Cancel anytime · Secure payment via Stripe · Monthly billing</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {STANDARD_PLANS.map((plan) => (
                            <PlanCard
                                key={plan.key}
                                plan={plan}
                                isCurrentPlan={currentPlan === plan.key}
                                isSoldOut={false}
                                isLoading={loadingPlan === plan.key && checkoutMutation.isPending}
                                onSelect={handleSelect}
                            />
                        ))}
                    </div>
                </div>

                {/* Billing Portal Link */}
                {subscription?.isPaid && (
                    <div className="text-center pt-4">
                        <Button variant="outline" className="border-blue-800 text-blue-400 hover:bg-blue-900/20" onClick={handleOpenPortal}>
                            Manage Billing, Invoices & Cancellation →
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}