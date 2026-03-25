/**
 * Central Stripe pricing config for InformMe.
 * Price IDs are resolved from environment secrets server-side only.
 * This file defines plan metadata safe for frontend use.
 */

export const PLAN_CONFIG = {
    launch_1: {
        key: 'launch_1',
        name: 'Launch Access',
        price: 1,
        interval: 'year',
        userLimit: 50,
        totalSlots: 50,
        isLaunchTier: true,
        featureLevel: 'pro', // maps to Professional feature access
        description: 'Founding member — lifetime locked rate',
        badge: '50 spots only',
        color: 'from-green-600 to-emerald-700',
    },
    launch_10: {
        key: 'launch_10',
        name: 'Founding Access',
        price: 10,
        interval: 'year',
        userLimit: 50,
        totalSlots: 50,
        isLaunchTier: true,
        featureLevel: 'pro',
        description: 'Early access — limited availability',
        badge: '50 spots only',
        color: 'from-teal-600 to-cyan-700',
    },
    basic: {
        key: 'basic',
        name: 'Basic',
        price: 29,
        interval: 'month',
        userLimit: 25,
        isLaunchTier: false,
        featureLevel: 'basic',
        description: 'Perfect for small field teams',
        color: 'from-blue-600 to-blue-700',
    },
    pro: {
        key: 'pro',
        name: 'Professional',
        price: 79,
        interval: 'month',
        userLimit: 100,
        isLaunchTier: false,
        featureLevel: 'pro',
        description: 'For growing operations',
        popular: true,
        color: 'from-[#FF8C00] to-[#CC7000]',
    },
    enterprise: {
        key: 'enterprise',
        name: 'Enterprise',
        price: 199,
        interval: 'month',
        userLimit: null,
        isLaunchTier: false,
        featureLevel: 'enterprise',
        description: 'Large-scale field operations',
        color: 'from-purple-600 to-purple-700',
    },
};

// Feature access by level (used both front and back-end)
export const FEATURE_ACCESS = {
    trial: {
        maxForms: 5,
        maxUsers: 3,
        maxReports: 10,
        automation: false,
        analytics: false,
        ai: false,
        advancedRoles: false,
        apiAccess: false,
    },
    basic: {
        maxForms: 50,
        maxUsers: 25,
        maxReports: -1,
        automation: false,
        analytics: true,
        ai: false,
        advancedRoles: false,
        apiAccess: false,
    },
    pro: {
        maxForms: -1,
        maxUsers: 100,
        maxReports: -1,
        automation: true,
        analytics: true,
        ai: true,
        advancedRoles: true,
        apiAccess: false,
    },
    enterprise: {
        maxForms: -1,
        maxUsers: -1,
        maxReports: -1,
        automation: true,
        analytics: true,
        ai: true,
        advancedRoles: true,
        apiAccess: true,
    },
};

export const PLAN_ORDER = ['trial', 'basic', 'pro', 'enterprise'];