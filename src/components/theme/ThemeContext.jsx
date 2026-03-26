import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved) {
    document.documentElement.setAttribute('data-theme', resolved);
    if (resolved === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'auto');

    useEffect(() => {
        localStorage.setItem('app-theme', theme);
        const resolved = theme === 'auto' ? getSystemTheme() : theme;
        applyTheme(resolved);
    }, [theme]);

    // Listen for system theme changes when in auto mode
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => { if (theme === 'auto') applyTheme(getSystemTheme()); };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);

    const cycleTheme = () => {
        setTheme(prev => prev === 'auto' ? 'light' : prev === 'light' ? 'dark' : 'auto');
    };

    const resolvedTheme = theme === 'auto' ? getSystemTheme() : theme;

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, cycleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
}