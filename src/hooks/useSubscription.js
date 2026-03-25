/**
 * Central subscription hook — single source of truth for billing state in the frontend.
 * Always backed by server-side checkSubscription function.
 */
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FEATURE_ACCESS } from '@/lib/stripePriceConfig';

export function useSubscription() {
    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me().catch(() => null),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['subscription'],
        queryFn: () => base44.functions.invoke('checkSubscription', {}).then(r => r.data),
        enabled: !!user,
        staleTime: 60_000, // 1 minute
    });

    const featureLevel = data?.featureLevel || 'trial';
    const limits = FEATURE_ACCESS[featureLevel] || FEATURE_ACCESS.trial;

    return {
        isLoading,
        planKey:           data?.planKey || 'trial',
        planName:          data?.planName || 'Free Trial',
        status:            data?.status  || 'trial',
        isActive:          data?.isActive ?? true,
        isPaid:            data?.isPaid  ?? false,
        isTrial:           data?.isTrial ?? true,
        isLaunchTier:      data?.isLaunchTier ?? false,
        featureLevel,
        currentPeriodEnd:  data?.currentPeriodEnd || null,
        cancelAtPeriodEnd: data?.cancelAtPeriodEnd || false,
        billingInterval:   data?.billingInterval || null,
        limits,
        // Feature flags
        canUseAutomation:  limits.automation,
        canUseAI:          limits.ai,
        canUseAnalytics:   limits.analytics,
        canUseAdvancedRoles: limits.advancedRoles,
        canUseAPI:         limits.apiAccess,
    };
}