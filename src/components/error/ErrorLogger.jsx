import { httpClient } from '@/api/httpClient';

class ErrorLogger {
    constructor() {
        this.errorQueue = [];
        this.isProcessing = false;
        this.maxQueueSize = 50;
        
        // Setup global error handlers
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'unhandled_rejection',
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Catch global errors
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'global_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString()
            });
        });
    }

    logError(errorData) {
        // Add to queue
        this.errorQueue.push({
            ...errorData,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: errorData.timestamp || new Date().toISOString()
        });

        // Trim queue if too large
        if (this.errorQueue.length > this.maxQueueSize) {
            this.errorQueue.shift();
        }

        // Process queue
        this.processQueue();
        
        // Console log in development
        if (window.location.hostname === 'localhost') {
            console.error('Error logged:', errorData);
        }
    }

    async processQueue() {
        if (this.isProcessing || this.errorQueue.length === 0) return;
        
        this.isProcessing = true;

        try {
            const user = await httpClient.auth.me().catch(() => null);
            
            while (this.errorQueue.length > 0) {
                const error = this.errorQueue.shift();
                
                try {
                    // Log to backend
                    await httpClient.entities.ErrorLog.create({
                        user_email: user?.email || 'anonymous',
                        error_type: error.type,
                        message: error.message,
                        stack: error.stack,
                        url: error.url,
                        user_agent: error.userAgent,
                        metadata: {
                            filename: error.filename,
                            lineno: error.lineno,
                            colno: error.colno
                        }
                    }).catch(() => {
                        // If backend fails, store in localStorage
                        this.storeLocally(error);
                    });
                } catch (e) {
                    // Re-queue on failure
                    this.errorQueue.unshift(error);
                    break;
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }

    storeLocally(error) {
        try {
            const stored = JSON.parse(localStorage.getItem('error_logs') || '[]');
            stored.push(error);
            // Keep only last 20 errors
            localStorage.setItem('error_logs', JSON.stringify(stored.slice(-20)));
        } catch (e) {
            // Storage failed, ignore
        }
    }

    getStoredErrors() {
        try {
            return JSON.parse(localStorage.getItem('error_logs') || '[]');
        } catch {
            return [];
        }
    }

    clearStoredErrors() {
        localStorage.removeItem('error_logs');
    }
}

export const errorLogger = new ErrorLogger();

// React error logging hook
export function useErrorLogger() {
    return {
        logError: (error, errorInfo) => {
            errorLogger.logError({
                type: 'react_error',
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo?.componentStack
            });
        }
    };
}