import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Zap, Crown, TrendingUp, Rocket, Star, AlertCircle, Loader2, Users, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { PLAN_CONFIG } from '@/lib/stripePriceConfig';

const PLAN_FEATURES = {
    launch_1: [
        'Full Professional feature access',
        'Up to 50 team members',
        'Unlimited forms & checklists',
        'AI Assistant included',
        'Advanced automation',
        'Locked rate — never increases',
        'Priority support',
    ],
    launch_10: [
        'Full Professional feature access',
        'Up to 50 team members',
        'Unlimited forms & checklists',
        'AI Assistant included',
        'Advanced automation',
        'Founding member badge',
        'Priority support',
    ],
    basic: [
        'Up to 25 users',
        '50 forms & checklists',
        'Unlimited reports',
        'Analytics dashboard',
        'Mobile + Desktop',
        'Email support',
        'Custom branding',
    ],
    pro: [
        'Up to 100 users',
        'Unlimited forms & checklists',
        'Advanced automation engine',
        'AI Assistant',
        'Advanced analytics',
        'Role-based permissions',
        'Priority support',
    ],
    enterprise: [
        'Unlimited users',
        'Unlimited everything',
        'Dedicated account manager',
        'Custom SLA & security',
        'SSO / advanced auth',
        'API access',
        '24/7 phone support',
        'Custom training',
    ],
};

const ICONS = {
    launch_1:   Rocket,
    launch_10:  Star,
    basic:      Zap,
    pro:        Crown,
    enterprise: TrendingUp,
};

export default function Pricing() {
    const [pending, setPending] = useState(null);

    const { data: user } = useQuery({
        queryKey: ['me'],
        queryFn: () => base44.auth.me(),
    });

    const { data: sub } = useQuery({
        queryKey: ['subscription'],
        queryFn: () => base44.functions.invoke('checkSubscription', {}).then(r => r.data),
        enabled: !!user,
    });

    // Count active launch tier signups to enforce caps
    const { data: launchCounts } = useQuery({
        queryKey: ['launch-counts'],
        queryFn: async () => {
            const [l1, l10] = await Promise.all([
                base44.entities.UserSubscription.filter({ plan_key: 'launch_1', status: 'active' }),
                base44.entities.UserSubscription.filter({ plan_key: 'launch_10', status: 'active' }),
            ]);
            return { launch_1: l1.length, launch_10: l10.length };
        },
    });

    const checkoutMutation = useMutation({
        mutationFn: async (planKey) => {
            const res = await base44.functions.invoke('createCheckoutSession', {
                planKey,
                successUrl: window.location.origin + '/CustomerPortal?success=true',
                cancelUrl: window.location.origin + '/Pricing',
            });
            return res.data;
        },
        onSuccess: (data) => {
            if (data?.url) {
                window.location.href = data.url;
            } else if (data?.capReached) {
                toast.error(data.error || 'This plan is sold out.');
                setPending(null);
            } else {
                toast.error('No checkout URL returned.');
                setPending(null);
            }
        },
        onError: (err) => {
            toast.error('Checkout failed: ' + err.message);
            setPending(null);
        },
    });

    const handlePortal = async () => {
        const res = await base44.functions.invoke('createPortalSession', {
            returnUrl: window.location.href,
        });
        if (res.data?.url) window.location.href = res.data.url;
        else toast.error(res.data?.error || 'Could not open billing portal.');
    };

    const currentPlan = sub?.planKey || 'trial';

    const getSpotsLeft = (key) => {
        if (!launchCounts) return PLAN_CONFIG[key]?.totalSlots;
        return Math.max(0, PLAN_CONFIG[key].totalSlots - (launchCounts[key] || 0));
    };

    const isSoldOut = (key) => getSpotsLeft(key) === 0;

    const getButtonLabel = (key) => {
        if (key === currentPlan) return '✓ Current Plan';
        if (key === 'trial') return 'Free — No Card Needed';
        if (isSoldOut(key)) return 'Sold Out';
        if (pending === key) return <><Loader2 className="w-4 h-4 animate-spin mr-2" />Opening Checkout…</>;
        if (key === 'launch_1') return 'Start for $1 / year →';
        if (key === 'launch_10') return 'Get Founding Access →';
        if (key === 'basic') return 'Start Basic →';
        if (key === 'pro') return 'Upgrade to Professional →';
        if (key === 'enterprise') return 'Start Enterprise →';
        return 'Select Plan →';
    };

    const isDisabled = (key) => {
        return key === currentPlan || key === 'trial' || isSoldOut(key) || !!pending;
    };

    const handleSelect = (key) => {
        if (isDisabled(key)) return;
        setPending(key);
        checkoutMutation.mutate(key);
    };

    const ORDERED_PLANS = ['launch_1', 'launch_10', 'basic', 'pro', 'enterprise'];

    return (
        <div className="min-h-screen bg-[#0a0e17]">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to="/Settings">
                        <Button variant="ghost" size="icon" className="text-blue-400">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">InformMe Plans</h1>
                        <p className="text-sm text-blue-400">
                            Current plan: <Badge className="ml-1 capitalize bg-blue-900/50 text-blue-300">{sub?.planName || 'Free Trial'}</Badge>
                            {sub?.status === 'past_due' && <Badge className="ml-2 bg-red-600">Payment Failed</Badge>}
                            {sub?.cancelAtPeriodEnd && <Badge className="ml-2 bg-yellow-600">Cancels at Period End</Badge>}
                        </p>
                    </div>
                    {sub?.isPaid && (
                        <Button variant="outline" size="sm" className="border-blue-700 text-blue-400" onClick={handlePortal}>
                            Manage Billing
                        </Button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10">
                {/* Past due alert */}
                {sub?.status === 'past_due' && (
                    <div className="mb-8 p-4 bg-red-950/40 border border-red-600/40 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                        <p className="text-red-300 text-sm flex-1">Your last payment failed. Update billing to avoid losing access.</p>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 shrink-0" onClick={handlePortal}>Update Billing</Button>
                    </div>
                )}

                {/* Launch tier banner */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-600/30 rounded-full px-6 py-2 mb-4">
                        <Rocket className="w-4 h-4 text-green-400" />
                        <span className="text-green-300 text-sm font-medium">Limited early access spots available — lock in your rate forever</span>
                    </div>
                    <p className="text-blue-400 text-sm">All plans billed via Stripe · Cancel anytime · Secure checkout</p>
                </div>

                {/* Launch Tiers */}
                <div className="mb-6">
                    <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-green-400" />
                        Launch Tiers — Early Access Pricing
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['launch_1', 'launch_10'].map((key, i) => {
                            const plan = PLAN_CONFIG[key];
                            const Icon = ICONS[key];
                            const spotsLeft = getSpotsLeft(key);
                            const soldOut = isSoldOut(key);
                            const isCurrent = key === currentPlan;

                            return (
                                <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                    <Card className={`relative bg-[#0f1419] border-green-600/30 ${isCurrent ? 'ring-2 ring-green-500' : ''} ${soldOut ? 'opacity-60' : ''}`}>
                                        {isCurrent && <div className="absolute -top-3 right-4"><Badge className="bg-green-600">Current Plan</Badge></div>}
                                        {!soldOut && !isCurrent && (
                                            <div className="absolute -top-3 left-4">
                                                <Badge className="bg-green-700 text-green-100">{spotsLeft} spots left</Badge>
                                            </div>
                                        )}
                                        {soldOut && <div className="absolute -top-3 left-4"><Badge className="bg-slate-600">Sold Out</Badge></div>}

                                        <CardHeader className="pb-4">
                                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <CardTitle className="text-white">{plan.name}</CardTitle>
                                            <CardDescription className="text-green-400">{plan.description}</CardDescription>
                                            <div className="flex items-baseline gap-1 mt-3">
                                                <span className="text-4xl font-bold text-white">${plan.price}</span>
                                                <span className="text-green-400">/year</span>
                                                <span className="ml-2 text-xs text-green-500 bg-green-900/30 px-2 py-0.5 rounded-full">Billed annually</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-blue-400">
                                                <Users className="w-3 h-3" />
                                                <span>Up to {plan.userLimit} users · Professional-level access</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2 mb-6">
                                                {PLAN_FEATURES[key].map((f, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-blue-300">
                                                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                        <span>{f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button
                                                className={`w-full ${isCurrent ? 'bg-green-700' : soldOut ? 'bg-slate-700' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90'}`}
                                                disabled={isDisabled(key)}
                                                onClick={() => handleSelect(key)}
                                            >
                                                {soldOut && !isCurrent ? <><Lock className="w-4 h-4 mr-2" />Sold Out</> : getButtonLabel(key)}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Standard Plans */}
                <div>
                    <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-400" />
                        Standard Plans — Monthly Billing
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['basic', 'pro', 'enterprise'].map((key, i) => {
                            const plan = PLAN_CONFIG[key];
                            const Icon = ICONS[key];
                            const isCurrent = key === currentPlan;

                            return (
                                <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex">
                                    <Card className={`relative bg-[#0f1419] border-blue-900/20 flex flex-col w-full
                                        ${plan.popular ? 'ring-2 ring-[#FF8C00]' : ''}
                                        ${isCurrent ? 'ring-2 ring-green-500' : ''}`}>
                                        {plan.popular && !isCurrent && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <Badge className="bg-gradient-to-r from-[#FF8C00] to-[#CC7000] whitespace-nowrap">Most Popular</Badge>
                                            </div>
                                        )}
                                        {isCurrent && <div className="absolute -top-3 right-4"><Badge className="bg-green-600">Current Plan</Badge></div>}

                                        <CardHeader className="pb-4">
                                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <CardTitle className="text-white">{plan.name}</CardTitle>
                                            <CardDescription className="text-blue-400">{plan.description}</CardDescription>
                                            <div className="flex items-baseline gap-1 mt-3">
                                                <span className="text-4xl font-bold text-white">${plan.price}</span>
                                                <span className="text-blue-400">/month</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-blue-400">
                                                <Users className="w-3 h-3" />
                                                <span>{plan.userLimit ? `Up to ${plan.userLimit} users` : 'Unlimited users'}</span>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="flex flex-col flex-1">
                                            <ul className="space-y-2 mb-6 flex-1">
                                                {PLAN_FEATURES[key].map((f, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-blue-300">
                                                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                        <span>{f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button
                                                className={`w-full ${
                                                    isCurrent ? 'bg-green-700 cursor-default' :
                                                    plan.popular ? 'bg-gradient-to-r from-[#FF8C00] to-[#CC7000] hover:opacity-90' :
                                                    'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                                disabled={isDisabled(key)}
                                                onClick={() => handleSelect(key)}
                                            >
                                                {getButtonLabel(key)}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Manage billing footer */}
                {sub?.isPaid && (
                    <div className="mt-12 text-center">
                        <Button variant="outline" className="border-blue-700 text-blue-400 hover:bg-blue-900/20" onClick={handlePortal}>
                            Manage Billing, Invoices & Cancellation →
                        </Button>
                        <p className="text-blue-400/40 text-xs mt-2">Powered by Stripe — update payment method, download invoices, or cancel anytime</p>
                    </div>
                )}
            </div>
        </div>
    );
}