import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, FileText, Star } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PlanManagement({ organization, isOwner }) {
    const queryClient = useQueryClient();
    
    const plans = [
        {
            id: 'basic',
            name: 'Basic',
            price: 29,
            icon: FileText,
            color: 'from-blue-600 to-blue-700',
            features: [
                'Up to 10 users',
                'Unlimited forms & checklists',
                '5GB storage',
                'Basic automations',
                'Email support'
            ]
        },
        {
            id: 'professional',
            name: 'Professional',
            price: 79,
            icon: Zap,
            color: 'from-purple-600 to-purple-700',
            popular: true,
            features: [
                'Up to 50 users',
                'Unlimited forms & checklists',
                '50GB storage',
                'Advanced automations',
                'AI insights',
                'Priority support',
                'Custom branding'
            ]
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 199,
            icon: Crown,
            color: 'from-orange-600 to-orange-700',
            features: [
                'Unlimited users',
                'Unlimited everything',
                'Unlimited storage',
                'Advanced automations',
                'AI insights',
                'Dedicated support',
                'Custom branding',
                'SSO & Advanced security',
                'SLA guarantee'
            ]
        }
    ];
    
    const changePlanMutation = useMutation({
        mutationFn: async (newPlan) => {
            // In production, this would integrate with Stripe/payment provider
            await httpClient.entities.Organization.update(organization.id, {
                plan_type: newPlan.id,
                max_users: newPlan.id === 'basic' ? 10 : newPlan.id === 'professional' ? 50 : 999
            });
            
            // Create billing record
            await httpClient.entities.BillingHistory.create({
                organization_id: organization.id,
                amount: newPlan.price,
                status: 'completed',
                plan_type: newPlan.id,
                period_start: new Date().toISOString().split('T')[0],
                period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['organization']);
            queryClient.invalidateQueries(['billing-history']);
            toast.success('Plan updated successfully!');
        },
        onError: (error) => {
            toast.error('Failed to update plan: ' + error.message);
        }
    });
    
    const cancelSubscriptionMutation = useMutation({
        mutationFn: async () => {
            await httpClient.entities.Organization.update(organization.id, {
                status: 'suspended'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['organization']);
            toast.success('Subscription cancelled');
        }
    });
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const isCurrent = organization.plan_type === plan.id;
                    const Icon = plan.icon;
                    
                    return (
                        <Card key={plan.id} className={`bg-[#0f1419] border-blue-900/20 relative ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}>
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">
                                        <Star className="w-3 h-3 mr-1" />
                                        Most Popular
                                    </Badge>
                                </div>
                            )}
                            
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                                    <span className="text-blue-400">/month</span>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                                <ul className="space-y-2">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-blue-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                
                                {isCurrent ? (
                                    <Button disabled className="w-full">
                                        Current Plan
                                    </Button>
                                ) : isOwner ? (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button className={`w-full bg-gradient-to-r ${plan.color}`}>
                                                {organization.plan_type === 'trial' ? 'Start Plan' : 
                                                 plans.findIndex(p => p.id === plan.id) > plans.findIndex(p => p.id === organization.plan_type) ? 'Upgrade' : 'Downgrade'}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-[#0f1419] border-blue-900/20">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-white">
                                                    Change to {plan.name} Plan?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription className="text-blue-300">
                                                    Your subscription will be updated immediately. You'll be charged ${plan.price}/month.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="border-blue-600">Cancel</AlertDialogCancel>
                                                <AlertDialogAction 
                                                    onClick={() => changePlanMutation.mutate(plan)}
                                                    className={`bg-gradient-to-r ${plan.color}`}
                                                >
                                                    Confirm Change
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                ) : (
                                    <Button disabled className="w-full">
                                        Owner Only
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            
            {isOwner && organization.plan_type !== 'trial' && (
                <Card className="bg-red-950/20 border-red-900/30">
                    <CardHeader>
                        <CardTitle className="text-red-300 text-lg">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Cancel Subscription</p>
                                <p className="text-sm text-red-400/70 mt-1">
                                    Your account will be suspended at the end of the billing period
                                </p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-950/50">
                                        Cancel Subscription
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-[#0f1419] border-blue-900/20">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Cancel Subscription?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-blue-300">
                                            This will cancel your subscription. Your data will be retained but access will be limited.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="border-blue-600">Keep Subscription</AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={() => cancelSubscriptionMutation.mutate()}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            Cancel Subscription
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}