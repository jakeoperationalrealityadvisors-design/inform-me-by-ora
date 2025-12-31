import React from 'react';

/**
 * Hook for optimizing touch interactions on mobile devices
 */
export function useTouchOptimization() {
    React.useEffect(() => {
        // Prevent double-tap zoom on buttons
        let lastTouchEnd = 0;
        const preventDoubleTapZoom = (event) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        };

        document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });

        // Add touch-action CSS for better scrolling
        document.body.style.touchAction = 'pan-y pinch-zoom';

        return () => {
            document.removeEventListener('touchend', preventDoubleTapZoom);
        };
    }, []);
}

/**
 * Component that optimizes children for touch interactions
 */
export default function TouchOptimized({ children, className = '' }) {
    const ref = React.useRef(null);

    React.useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Add touch feedback
        const addTouchFeedback = () => {
            element.style.opacity = '0.7';
        };

        const removeTouchFeedback = () => {
            element.style.opacity = '1';
        };

        element.addEventListener('touchstart', addTouchFeedback, { passive: true });
        element.addEventListener('touchend', removeTouchFeedback, { passive: true });
        element.addEventListener('touchcancel', removeTouchFeedback, { passive: true });

        return () => {
            element.removeEventListener('touchstart', addTouchFeedback);
            element.removeEventListener('touchend', removeTouchFeedback);
            element.removeEventListener('touchcancel', removeTouchFeedback);
        };
    }, []);

    return (
        <div 
            ref={ref} 
            className={`select-none transition-opacity duration-150 ${className}`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
        >
            {children}
        </div>
    );
}

/**
 * Hook for detecting mobile device
 */
export function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => {
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                          window.innerWidth < 768;
            setIsMobile(mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}

/**
 * Hook for optimizing viewport on mobile
 */
export function useViewportOptimization() {
    React.useEffect(() => {
        // Prevent viewport zooming
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
            );
        }

        // Handle iOS Safari bottom bar
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setVH();
        window.addEventListener('resize', setVH);

        return () => window.removeEventListener('resize', setVH);
    }, []);
}