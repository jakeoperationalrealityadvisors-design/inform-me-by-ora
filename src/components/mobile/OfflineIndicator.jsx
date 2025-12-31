import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showIndicator, setShowIndicator] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowIndicator(true);
            setTimeout(() => setShowIndicator(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowIndicator(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Show initially if offline
        if (!navigator.onLine) {
            setShowIndicator(true);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {showIndicator && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 ${
                        isOnline 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                    }`}
                >
                    {isOnline ? (
                        <>
                            <Wifi className="w-4 h-4" />
                            <span className="text-sm font-medium">Back online</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-4 h-4" />
                            <span className="text-sm font-medium">No internet connection</span>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}