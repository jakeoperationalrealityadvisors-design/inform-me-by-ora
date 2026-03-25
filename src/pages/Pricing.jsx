import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles, Zap, Crown, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const PLANS = [
    {
        id: 'trial',
        name: 'Free Trial',
        price: 0,
        description: 'Get started — no card required',
        features: [
            '5 forms & checklists',
            'Up to 3 users',
            '10 report submissions',
            'Mobile access',
            'Email support'
        ],
        icon: Sparkles,
        color: 'from-slate-600 to-slate-700',
        popular: false
    },
    {
        id: 'basic',
        name: 'Basic',
        price: 29,
        description: 'Perfect for small field teams',
        features: [
            'Up to 25 users',
            '50 forms & checklists',
            'Unlimited reports',
            'Mobile + Desktop access',
            'Analytics dashboard',
            'Priority email support',
            'Custom branding'
        ],
        icon: Zap,
        color: 'from-blue-600 to-blue-700',
        popular: false
    },
    {
        id: 'professional',
        name: 'Professional',
        price: 79,
        description: 'For growing operations',
        features: [
            'Up to 100 users',
            'Unlimited forms & checklists',
            'Unlimited reports',
            'Advanced automation',
            'AI Assistant',
            'Advanced analytics',
            'API access',
            'Priority support'
        ],
        icon: Crown,
        color: 'from-[#FF8C00] to-[#CC7000]',
        popular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 199,
        description: 'Large-scale field operations',
        features: [
            'Unlimited users',
            'Unlimited everything',
            'Dedicated account manager',
            'Custom SLA',
            'Advanced security & SSO',
            '24/7 phone support',
            'Custom training',
            'On-premise option'
        ],
        icon: TrendingUp,
        color: 'from-purple-600 to-purple-700',
        popular: false
    }
];

export default function Pricing() {
    const [selectedPlan, setSelectedPlan] = useState(null);

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });

    const { data: subscription } = useQuery({
        queryKey: ['subscription'],
        queryFn: () => base44.functions.invoke('checkSubscription', {}).then(r => r.data),
        enabled: !!user
    });

    const checkoutMutation = useMutation({
        mutationFn: async (planId) => {
            const res = await base44.functions.invoke('createCheckoutSession', {
                planId,
                successUrl: window.location.origin + '/CustomerPortal?success=true',
                cancelUrl: window.location.origin + '/Pricing'
            });
            return res.data;
        },
        onSuccess: (data) => {
            if (data?.url) {
                window.location.href = data.url;
            } else {
                toast.error('No checkout URL returned');
            }
        },
        onError: (error) => {
            toast.error('Checkout failed: ' + error.message);
            setSelectedPlan(null);
        }
    });

    const handleOpenPortal = async () => {
        const res = await base44.functions.invoke('createPortalSession', {
            returnUrl: window.location.href
        });
        if (res.data?.url) window.location.href = res.data.url;
        else toast.error(res.data?.error || 'Could not open billing portal');
    };

    const currentPlan = subscription?.plan || 'trial';
    const currentPlanIndex = PLANS.findIndex(p => p.id === currentPlan);

    return (
        <div className="min-h-screen bg-[#0a0e17] overflow-y-auto">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to="/Settings">
                        <Button variant="ghost" size="icon" className="text-blue-400">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Choose Your Plan</h1>
                        <p className="text-sm text-blue-400">
                            Current plan: <Badge className="ml-1 capitalize">{currentPlan}</Badge>
                            {subscription?.status === 'past_due' && (
                                <Badge className="ml-2 bg-red-600">Payment Failed</Badge>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Past due alert */}
                {subscription?.status === 'past_due' && (
                    <div className="mb-8 p-4 bg-red-950/40 border border-red-600/40 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                        <p className="text-red-300 text-sm flex-1">
                            Your last payment failed. Update your billing info to avoid interruption.
                        </p>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 shrink-0" onClick={handleOpenPortal}>
                            Update Billing
                        </Button>
                    </div>
                )}

                <div className="text-center mb-12">
                    <p className="text-blue-400">All plans billed monthly · Cancel anytime · Secure payment via Stripe</p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PLANS.map((plan, index) => {
                        const Icon = plan.icon;
                        const isCurrentPlan = plan.id === currentPlan;
                        const isDowngrade = index < currentPlanIndex;
                        const isPending = checkoutMutation.isPending && selectedPlan === plan.id;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex"
                            >
                                <Card className={`relative bg-[#0f1419] border-blue-900/20 flex flex-col w-full ${
                                    plan.popular ? 'ring-2 ring-[#FF8C00]' : ''
                                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-gradient-to-r from-[#FF8C00] to-[#CC7000] whitespace-nowrap">
                                                Most Popular
                                            </Badge>
                                        </div>
                                    )}
                                    {isCurrentPlan && (
                                        <div className="absolute -top-4 right-4">
                                            <Badge className="bg-green-600 whitespace-nowrap">Current Plan</Badge>
                                        </div>
                                    )}

                                    <CardHeader>
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <CardTitle className="text-white">{plan.name}</CardTitle>
                                        <CardDescription className="text-blue-400">{plan.description}</CardDescription>
                                        <div className="mt-4 flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-white">${plan.price}</span>
                                            {plan.price > 0 && <span className="text-blue-400">/month</span>}
                                            {plan.price === 0 && <span className="text-green-400 text-lg">Free</span>}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex flex-col flex-1 space-y-4">
                                        <ul className="space-y-2 flex-1">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-blue-300">
                                                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            onClick={() => {
                                                if (plan.id === 'trial' || isCurrentPlan || isDowngrade) return;
                                                setSelectedPlan(plan.id);
                                                checkoutMutation.mutate(plan.id);
                                            }}
                                            disabled={isCurrentPlan || isDowngrade || plan.id === 'trial' || checkoutMutation.isPending}
                                            className={`w-full mt-4 ${
                                                isCurrentPlan
                                                    ? 'bg-green-700 cursor-default'
                                                    : plan.popular
                                                    ? 'bg-gradient-to-r from-[#FF8C00] to-[#CC7000] hover:opacity-90'
                                                    : plan.id === 'trial'
                                                    ? 'bg-slate-700 cursor-default opacity-60'
                                                    : isDowngrade
                                                    ? 'bg-slate-700 opacity-60'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                        >
                                            {isPending ? (
                                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Opening Checkout...</>
                                            ) : isCurrentPlan ? (
                                                '✓ Current Plan'
                                            ) : plan.id === 'trial' ? (
                                                'Free — No Card Needed'
                                            ) : isDowngrade ? (
                                                'Contact Support'
                                            ) : (
                                                'Subscribe Now →'
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Manage Billing */}
                {subscription?.isPaid && (
                    <div className="mt-12 text-center">
                        <Button variant="outline" className="border-blue-700 text-blue-400 hover:bg-blue-900/20" onClick={handleOpenPortal}>
                            Manage Billing & Invoices →
                        </Button>
                        <p className="text-blue-400/50 text-xs mt-2">Update payment method, download invoices, or cancel subscription</p>
                    </div>
                )}
            </div>
        </div>
    );
}