import React from 'react';
import { QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

// Global error handler for React Query
export const queryCache = new QueryCache({
    onError: (error, query) => {
        console.error('Query Error:', error, query);
        
        // Don't show errors for background queries
        if (query.meta?.silent) return;
        
        // Handle specific error types
        if (error.message?.includes('Network')) {
            toast.error('Network issue. Please check your connection.');
        } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            toast.error('Session expired. Please login again.');
            // Optionally redirect to login
        } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
            toast.error('You don\'t have permission for this action.');
        } else if (error.message?.includes('404')) {
            toast.error('Resource not found.');
        } else {
            toast.error(error.message || 'Something went wrong. Please try again.');
        }
    },
    onSuccess: (data, query) => {
        // Log successful queries in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Query Success:', query.queryKey, data);
        }
    }
});

export const mutationCache = new MutationCache({
    onError: (error, variables, context, mutation) => {
        console.error('Mutation Error:', error, mutation);
        
        // Don't show errors for silent mutations
        if (mutation.meta?.silent) return;
        
        // Handle specific error types
        if (error.message?.includes('Network')) {
            toast.error('Network issue. Changes may not have been saved.');
        } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            toast.error('Session expired. Please login again.');
        } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
            toast.error('You don\'t have permission for this action.');
        } else {
            toast.error(error.message || 'Failed to save changes. Please try again.');
        }
    },
    onSuccess: (data, variables, context, mutation) => {
        // Show success message if specified
        if (mutation.meta?.successMessage) {
            toast.success(mutation.meta.successMessage);
        }
        
        // Log successful mutations in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Mutation Success:', mutation.options.mutationKey, data);
        }
    }
});

// Retry configuration
export const defaultQueryOptions = {
    retry: (failureCount, error) => {
        // Don't retry on client errors (4xx)
        if (error.message?.includes('40')) return false;
        
        // Retry up to 3 times for server errors (5xx) and network errors
        return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s, 8s (max 30s)
        return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
    staleTime: 30000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
};

// Global error boundary fallback
export function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-950/30 flex items-center justify-center">
                    <span className="text-4xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
                <p className="text-blue-300 mb-6">
                    {error.message || 'An unexpected error occurred. Please try again.'}
                </p>
                <button
                    onClick={resetErrorBoundary}
                    className="px-6 py-3 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white rounded-lg font-semibold"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}