import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Check, Sparkles, Zap, Crown, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const PLANS = [
    {
        id: 'trial',
        name: 'Trial',
        price: 0,
        interval: 'month',
        description: 'Get started for free',
        features: [
            'Up to 10 users',
            'Basic forms & checklists',
            'Mobile access',
            '5GB storage',
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
        interval: 'month',
        description: 'Perfect for small teams',
        features: [
            'Up to 25 users',
            'Unlimited forms & checklists',
            'Mobile + Desktop access',
            '50GB storage',
            'Priority email support',
            'Basic automation',
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
        interval: 'month',
        description: 'For growing organizations',
        features: [
            'Up to 100 users',
            'Everything in Basic',
            'Advanced automation',
            '200GB storage',
            'API access',
            'Custom integrations',
            'Advanced analytics',
            'Priority support',
            'AI Assistant'
        ],
        icon: Crown,
        color: 'from-[#FF8C00] to-[#CC7000]',
        popular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 199,
        interval: 'month',
        description: 'For large-scale operations',
        features: [
            'Unlimited users',
            'Everything in Professional',
            'Unlimited storage',
            'Dedicated account manager',
            'Custom SLA',
            'On-premise deployment option',
            'Advanced security',
            '24/7 phone support',
            'Custom training'
        ],
        icon: TrendingUp,
        color: 'from-purple-600 to-purple-700',
        popular: false
    }
];

export default function Pricing() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [billingInterval, setBillingInterval] = useState('month');
    const [selectedPlan, setSelectedPlan] = useState(null);

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => httpClient.auth.me()
    });

    const { data: organization } = useQuery({
        queryKey: ['organization', user?.organization_id],
        queryFn: () => httpClient.entities.Organization.filter({ id: user.organization_id }).then(r => r[0]),
        enabled: !!user?.organization_id
    });

    const upgradeMutation = useMutation({
        mutationFn: async ({ planId, interval }) => {
            // Calculate prorated amount if upgrading
            const currentPlan = PLANS.find(p => p.id === organization?.plan_type);
            const newPlan = PLANS.find(p => p.id === planId);
            
            let proratedAmount = newPlan.price;
            let proratedDays = 0;
            
            if (currentPlan && organization?.trial_ends) {
                const today = new Date();
                const trialEnd = new Date(organization.trial_ends);
                const daysRemaining = Math.max(0, Math.ceil((trialEnd - today) / (1000 * 60 * 60 * 24)));
                const daysInMonth = 30;
                
                if (daysRemaining > 0) {
                    const unusedCredit = (currentPlan.price / daysInMonth) * daysRemaining;
                    proratedAmount = Math.max(0, newPlan.price - unusedCredit);
                    proratedDays = daysRemaining;
                }
            }

            return {
                planId,
                interval,
                proratedAmount: proratedAmount.toFixed(2),
                proratedDays,
                message: proratedDays > 0 
                    ? `Prorated charge: $${proratedAmount.toFixed(2)} (credit for ${proratedDays} days remaining)`
                    : `Full charge: $${newPlan.price}`
            };
        },
        onSuccess: async (data) => {
            // Update organization with new plan
            if (organization) {
                await httpClient.entities.Organization.update(organization.id, {
                    plan_type: data.planId,
                    status: 'active'
                });
                
                // Create billing history record
                await httpClient.entities.BillingHistory.create({
                    organization_id: organization.id,
                    amount: parseFloat(data.proratedAmount),
                    currency: 'USD',
                    status: 'completed',
                    plan_type: data.planId,
                    period_start: new Date().toISOString().split('T')[0],
                    period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    payment_method: 'card'
                });
            }
            
            queryClient.invalidateQueries(['organization']);
            queryClient.invalidateQueries(['current-user']);
            
            toast.success(`Successfully upgraded to ${PLANS.find(p => p.id === data.planId).name}!`);
            navigate(createPageUrl('CustomerPortal'));
        },
        onError: (error) => {
            toast.error('Upgrade failed: ' + error.message);
        }
    });

    const handlePurchase = (planId) => {
        setSelectedPlan(planId);
        
        const plan = PLANS.find(p => p.id === planId);
        const currentPlan = PLANS.find(p => p.id === organization?.plan_type);
        
        if (currentPlan && currentPlan.price >= plan.price) {
            toast.error('Cannot downgrade plans. Contact support for assistance.');
            return;
        }
        
        const confirmed = confirm(
            `Upgrade to ${plan.name} for $${plan.price}/${billingInterval}?\n\n` +
            (currentPlan ? 'Your current plan will be prorated.' : 'You will be charged immediately.')
        );
        
        if (confirmed) {
            upgradeMutation.mutate({ planId, interval: billingInterval });
        }
    };

    const currentPlanType = organization?.plan_type || 'trial';
    const currentPlanIndex = PLANS.findIndex(p => p.id === currentPlanType);

    return (
        <div className="min-h-screen bg-[#0a0e17] overflow-y-auto">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Settings')}>
                                <Button variant="ghost" size="icon" className="text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Choose Your Plan</h1>
                                <p className="text-sm text-blue-400">
                                    Current plan: <Badge className="ml-1">{PLANS.find(p => p.id === currentPlanType)?.name}</Badge>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Billing Interval Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="bg-[#0f1419] rounded-lg p-1 inline-flex">
                        <button
                            onClick={() => setBillingInterval('month')}
                            className={`px-6 py-2 rounded-md transition-all ${
                                billingInterval === 'month'
                                    ? 'bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white'
                                    : 'text-blue-400 hover:text-white'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingInterval('year')}
                            className={`px-6 py-2 rounded-md transition-all ${
                                billingInterval === 'year'
                                    ? 'bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white'
                                    : 'text-blue-400 hover:text-white'
                            }`}
                        >
                            Yearly
                            <Badge className="ml-2 bg-green-600">Save 20%</Badge>
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PLANS.map((plan, index) => {
                        const Icon = plan.icon;
                        const isCurrentPlan = plan.id === currentPlanType;
                        const isUpgrade = index > currentPlanIndex;
                        const isDowngrade = index < currentPlanIndex;
                        const displayPrice = billingInterval === 'year' ? (plan.price * 12 * 0.8).toFixed(0) : plan.price;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={`relative bg-[#0f1419] border-blue-900/20 ${
                                    plan.popular ? 'ring-2 ring-[#FF8C00]' : ''
                                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-gradient-to-r from-[#FF8C00] to-[#CC7000]">
                                                Most Popular
                                            </Badge>
                                        </div>
                                    )}
                                    
                                    {isCurrentPlan && (
                                        <div className="absolute -top-4 right-4">
                                            <Badge className="bg-green-600">Current Plan</Badge>
                                        </div>
                                    )}

                                    <CardHeader>
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <CardTitle className="text-white">{plan.name}</CardTitle>
                                        <CardDescription className="text-blue-400">{plan.description}</CardDescription>
                                        <div className="mt-4">
                                            <div className="flex items-baseline">
                                                <span className="text-4xl font-bold text-white">
                                                    ${displayPrice}
                                                </span>
                                                <span className="text-blue-400 ml-2">
                                                    /{billingInterval === 'year' ? 'year' : 'month'}
                                                </span>
                                            </div>
                                            {billingInterval === 'year' && plan.price > 0 && (
                                                <p className="text-xs text-green-400 mt-1">
                                                    Save ${(plan.price * 12 * 0.2).toFixed(0)}/year
                                                </p>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <ul className="space-y-2">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-blue-300">
                                                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            onClick={() => handlePurchase(plan.id)}
                                            disabled={isCurrentPlan || isDowngrade || upgradeMutation.isPending}
                                            className={`w-full ${
                                                isCurrentPlan
                                                    ? 'bg-green-600 hover:bg-green-600'
                                                    : plan.popular
                                                    ? 'bg-gradient-to-r from-[#FF8C00] to-[#CC7000]'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                        >
                                            {upgradeMutation.isPending && selectedPlan === plan.id ? (
                                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                                            ) : isCurrentPlan ? (
                                                'Current Plan'
                                            ) : isDowngrade ? (
                                                'Contact Support'
                                            ) : isUpgrade ? (
                                                'Upgrade Now'
                                            ) : (
                                                'Get Started'
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Prorated Billing Notice */}
                {organization && organization.plan_type !== 'trial' && (
                    <div className="mt-12 text-center">
                        <Card className="bg-[#0f1419] border-blue-900/20 inline-block">
                            <CardContent className="p-6">
                                <p className="text-blue-400 text-sm">
                                    💡 Upgrades are prorated based on your current billing cycle. 
                                    You'll only pay the difference for the remaining days.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}