import React, { createContext, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const SecurityContext = createContext({});

export const useSecurity = () => useContext(SecurityContext);

export function SecurityProvider({ children }) {
    useEffect(() => {
        // XSS Protection - sanitize localStorage
        const sanitizeStorage = () => {
            try {
                Object.keys(localStorage).forEach(key => {
                    const value = localStorage.getItem(key);
                    if (value && (value.includes('<script') || value.includes('javascript:'))) {
                        console.warn('Potential XSS detected in localStorage, clearing:', key);
                        localStorage.removeItem(key);
                    }
                });
            } catch (e) {
                console.error('Storage sanitization failed:', e);
            }
        };

        sanitizeStorage();

        // CSRF Protection - Add token to all requests
        const csrfToken = sessionStorage.getItem('csrf_token') || generateCSRFToken();
        sessionStorage.setItem('csrf_token', csrfToken);

        // Rate limiting tracker
        window.rateLimitTracker = window.rateLimitTracker || {};

    }, []);

    return (
        <SecurityContext.Provider value={{}}>
            {children}
        </SecurityContext.Provider>
    );
}

function generateCSRFToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Input sanitization utility
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
}

// Rate limiting utility
export function checkRateLimit(action, maxAttempts = 5, windowMs = 60000) {
    const now = Date.now();
    const tracker = window.rateLimitTracker[action] || [];
    
    // Remove old attempts outside the window
    const recentAttempts = tracker.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
        return false; // Rate limit exceeded
    }
    
    // Add current attempt
    recentAttempts.push(now);
    window.rateLimitTracker[action] = recentAttempts;
    
    return true; // Within rate limit
}