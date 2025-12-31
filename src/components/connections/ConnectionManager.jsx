import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

const ConnectionContext = createContext(null);

export function ConnectionManager({ children }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [connectionType, setConnectionType] = useState('unknown');
    const [effectiveType, setEffectiveType] = useState('unknown');
    const [rtt, setRtt] = useState(0);
    const [downlink, setDownlink] = useState(0);

    useEffect(() => {
        const updateOnlineStatus = () => {
            setIsOnline(navigator.onLine);
            if (navigator.onLine) {
                toast.success('Back online');
            } else {
                toast.error('Connection lost - working offline');
            }
        };

        const updateConnectionInfo = () => {
            if ('connection' in navigator) {
                const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                if (conn) {
                    setConnectionType(conn.type || 'unknown');
                    setEffectiveType(conn.effectiveType || 'unknown');
                    setRtt(conn.rtt || 0);
                    setDownlink(conn.downlink || 0);
                }
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        if ('connection' in navigator) {
            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (conn) {
                conn.addEventListener('change', updateConnectionInfo);
            }
        }

        updateConnectionInfo();

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
            if ('connection' in navigator) {
                const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                if (conn) {
                    conn.removeEventListener('change', updateConnectionInfo);
                }
            }
        };
    }, []);

    const value = {
        isOnline,
        connectionType,
        effectiveType,
        rtt,
        downlink,
        isSlowConnection: effectiveType === 'slow-2g' || effectiveType === '2g',
        isFastConnection: effectiveType === '4g' || effectiveType === '5g'
    };

    return (
        <ConnectionContext.Provider value={value}>
            {children}
        </ConnectionContext.Provider>
    );
}

export function useConnection() {
    const context = useContext(ConnectionContext);
    if (!context) {
        throw new Error('useConnection must be used within ConnectionManager');
    }
    return context;
}