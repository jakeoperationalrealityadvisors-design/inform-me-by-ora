import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * UIProfile System
 * Controls the entire UI density, scale, and feature exposure across the app.
 * 
 * Modes:
 *   simple   — oversized targets, minimal actions, field-first, single-action layouts
 *   standard — balanced layout, moderate features (default)
 *   full     — dense info, all features visible, power-user
 */

const UIProfileContext = createContext(null);

const STORAGE_KEY = 'inform_me_ui_mode';

export const UI_MODES = {
    simple: {
        id: 'simple',
        label: 'Simple / Extra Large',
        description: 'Big buttons, minimal clutter — ideal for field use',
        icon: '🧱',
        // CSS scale values applied via data-ui-mode="simple"
        textBase: 'text-lg',
        textSm: 'text-base',
        textXs: 'text-sm',
        heading: 'text-3xl',
        subheading: 'text-xl',
        buttonHeight: 'h-14',
        iconSize: 'w-7 h-7',
        padding: 'p-5',
        gap: 'gap-5',
        cardPadding: 'p-5',
        navItems: 4,        // max nav items visible
        actionsPerScreen: 3, // max primary actions shown
        showLabels: true,
        showDescriptions: false,
        showStats: false,
        showAdvancedFilters: false,
        bottomNavOnly: true,
    },
    standard: {
        id: 'standard',
        label: 'Standard',
        description: 'Balanced layout for everyday use',
        icon: '⚖️',
        textBase: 'text-sm',
        textSm: 'text-xs',
        textXs: 'text-[10px]',
        heading: 'text-2xl',
        subheading: 'text-lg',
        buttonHeight: 'h-10',
        iconSize: 'w-5 h-5',
        padding: 'p-4',
        gap: 'gap-4',
        cardPadding: 'p-4',
        navItems: 5,
        actionsPerScreen: 6,
        showLabels: true,
        showDescriptions: true,
        showStats: true,
        showAdvancedFilters: false,
        bottomNavOnly: false,
    },
    full: {
        id: 'full',
        label: 'Full Features',
        description: 'All features, dense layouts, power-user access',
        icon: '⚡',
        textBase: 'text-sm',
        textSm: 'text-xs',
        textXs: 'text-[10px]',
        heading: 'text-xl',
        subheading: 'text-base',
        buttonHeight: 'h-9',
        iconSize: 'w-4 h-4',
        padding: 'p-3',
        gap: 'gap-3',
        cardPadding: 'p-3',
        navItems: 8,
        actionsPerScreen: 12,
        showLabels: true,
        showDescriptions: true,
        showStats: true,
        showAdvancedFilters: true,
        bottomNavOnly: false,
    },
};

// Map old technical_level values to new mode IDs
const LEGACY_MAP = {
    senior: 'simple',
    simple: 'simple',
    beginner: 'simple',
    intermediate: 'standard',
    expert: 'full',
};

export function UIProfileProvider({ children }) {
    const [mode, setModeState] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved && UI_MODES[saved] ? saved : 'standard';
    });
    const [loading, setLoading] = useState(true);

    // On mount, sync from auth profile
    useEffect(() => {
        const syncFromAuth = async () => {
            try {
                const user = await base44.auth.me();
                if (user?.ui_mode && UI_MODES[user.ui_mode]) {
                    setModeState(user.ui_mode);
                    localStorage.setItem(STORAGE_KEY, user.ui_mode);
                } else if (user?.technical_level && LEGACY_MAP[user.technical_level]) {
                    const mapped = LEGACY_MAP[user.technical_level];
                    setModeState(mapped);
                    localStorage.setItem(STORAGE_KEY, mapped);
                }
            } catch (e) {
                // Not logged in yet — use localStorage value
            } finally {
                setLoading(false);
            }
        };
        syncFromAuth();
    }, []);

    // Apply data-ui-mode to <html> whenever mode changes
    useEffect(() => {
        document.documentElement.setAttribute('data-ui-mode', mode);
        document.body.setAttribute('data-ui-mode', mode);
    }, [mode]);

    const setMode = useCallback(async (newMode) => {
        if (!UI_MODES[newMode]) return;
        setModeState(newMode);
        localStorage.setItem(STORAGE_KEY, newMode);
        document.documentElement.setAttribute('data-ui-mode', newMode);
        document.body.setAttribute('data-ui-mode', newMode);
        try {
            await base44.auth.updateMe({ ui_mode: newMode, technical_level: newMode === 'simple' ? 'senior' : newMode === 'full' ? 'expert' : 'intermediate' });
        } catch (e) {
            // Offline — already saved to localStorage
        }
    }, []);

    const profile = UI_MODES[mode] || UI_MODES.standard;
    const isSimple = mode === 'simple';
    const isFull = mode === 'full';

    return (
        <UIProfileContext.Provider value={{ mode, setMode, profile, isSimple, isFull, loading }}>
            {children}
        </UIProfileContext.Provider>
    );
}

export function useUIProfile() {
    const ctx = useContext(UIProfileContext);
    if (!ctx) {
        // Graceful fallback if used outside provider
        return { mode: 'standard', profile: UI_MODES.standard, isSimple: false, isFull: false, loading: false, setMode: () => {} };
    }
    return ctx;
}

export default UIProfileContext;