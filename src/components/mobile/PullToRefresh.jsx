import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PullToRefresh({ onRefresh, children }) {
    const [pulling, setPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const startY = useRef(0);
    const containerRef = useRef(null);
    const maxPullDistance = 80;

    const handleTouchStart = (e) => {
        if (window.scrollY === 0) {
            startY.current = e.touches[0].clientY;
        }
    };

    const handleTouchMove = (e) => {
        if (startY.current === 0) return;
        
        const currentY = e.touches[0].clientY;
        const distance = currentY - startY.current;

        if (distance > 0 && window.scrollY === 0) {
            setPulling(true);
            setPullDistance(Math.min(distance, maxPullDistance));
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance >= maxPullDistance) {
            setRefreshing(true);
            try {
                await onRefresh();
            } catch (error) {
                console.error('Refresh failed:', error);
            } finally {
                setRefreshing(false);
            }
        }
        setPulling(false);
        setPullDistance(0);
        startY.current = 0;
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: true });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [pullDistance]);

    const progress = (pullDistance / maxPullDistance) * 100;

    return (
        <div ref={containerRef} className="relative">
            <AnimatePresence>
                {(pulling || refreshing) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-0 left-0 right-0 flex justify-center"
                        style={{ transform: `translateY(${pulling ? pullDistance - 40 : 0}px)` }}
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-full p-3 shadow-lg">
                            <RefreshCw
                                className={`w-6 h-6 text-blue-600 ${refreshing ? 'animate-spin' : ''}`}
                                style={{
                                    transform: `rotate(${progress * 3.6}deg)`,
                                    transition: refreshing ? 'none' : 'transform 0.1s'
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div style={{ transform: `translateY(${pulling ? pullDistance * 0.5 : 0}px)`, transition: pulling ? 'none' : 'transform 0.3s' }}>
                {children}
            </div>
        </div>
    );
}