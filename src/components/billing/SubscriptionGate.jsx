/**
 * SubscriptionGate — wraps any feature that requires a paid plan.
 * Usage: <SubscriptionGate feature="automation"> ... </SubscriptionGate>
 *
 * feature: key from FEATURE_ACCESS (automation | analytics | ai | advancedRoles | apiAccess)
 *          OR "paid" to simply require any active paid plan
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';

const FEATURE_LABELS = {
    automation:     'Automation',
    analytics:      'Advanced Analytics',
    ai:             'AI Features',
    advancedRoles:  'Advanced Roles',
    apiAccess:      'API Access',
    paid:           'Paid Plan',
};

const FEATURE_DESCRIPTIONS = {
    automation:     'Automate your workflows with triggers, conditions and actions.',
    analytics:      'Unlock detailed analytics, charts, and performance insights.',
    ai:             'Use AI to generate reports, analyze submissions, and get smart suggestions.',
    advancedRoles:  'Define granular roles and permissions for your team.',
    apiAccess:      'Access the InformMe API for custom integrations.',
    paid:           'This feature requires an active subscription.',
};

export default function SubscriptionGate({ feature = 'paid', children }) {
    const { isLoading, isActive, isTrial, limits, planKey } = useSubscription();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-7 h-7 border-4 border-slate-600 border-t-[#FF8C00] rounded-full animate-spin" />
            </div>
        );
    }

    // Determine if this feature is accessible
    const hasAccess = (() => {
        if (!isActive) return false;
        if (feature === 'paid') return !isTrial;
        return limits?.[feature] === true;
    })();

    if (hasAccess) return <>{children}</>;

    // Show paywall
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
            <Card className="max-w-md w-full bg-[#0f1419] border-blue-900/30 shadow-2xl">
                <CardContent className="pt-10 pb-10 text-center space-y-5">
                    <div className="w-16 h-16 rounded-full bg-[#FF8C00]/10 flex items-center justify-center mx-auto">
                        <Lock className="w-8 h-8 text-[#FF8C00]" />
                    </div>

                    <div>
                        <Badge className="mb-3 bg-[#FF8C00]/20 text-[#FF8C00] border-[#FF8C00]/30 text-xs uppercase tracking-wider">
                            {planKey === 'trial' ? 'Trial Plan' : 'Upgrade Required'}
                        </Badge>
                        <h2 className="text-xl font-bold text-white mb-2">
                            {FEATURE_LABELS[feature] || 'Premium Feature'}
                        </h2>
                        <p className="text-blue-400 text-sm leading-relaxed">
                            {FEATURE_DESCRIPTIONS[feature] || 'This feature requires a higher plan.'}
                        </p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <Link to="/Pricing">
                            <Button className="w-full bg-gradient-to-r from-[#FF8C00] to-[#CC7000] hover:opacity-90 gap-2 text-black font-semibold">
                                <Zap className="w-4 h-4" />
                                Upgrade Now
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link to="/">
                            <Button variant="ghost" className="w-full text-blue-400 hover:text-blue-300">
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}