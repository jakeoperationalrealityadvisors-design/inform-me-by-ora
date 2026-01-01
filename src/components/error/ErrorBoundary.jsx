import React from 'react';
import { errorLogger } from './ErrorLogger';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
                    <Card className="max-w-md w-full bg-[#0f1419] border-red-900/30">
                        <CardContent className="pt-12 pb-12 text-center">
                            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                            <p className="text-blue-300 mb-6">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Reload Page
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}