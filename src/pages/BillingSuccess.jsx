import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function BillingSuccess() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#1E40AF] flex items-center justify-center animate-pulse">
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1">
                            <Sparkles className="w-6 h-6 text-[#FF8C00]" />
                        </div>
                    </div>
                </div>

                {/* Heading */}
                <div className="space-y-3">
                    <h1 className="text-4xl font-bold text-white">Payment Successful!</h1>
                    <p className="text-blue-300 text-lg">
                        Welcome to your new plan. Your subscription is now active.
                    </p>
                </div>

                {/* Info Card */}
                <div className="bg-[#0f1419] border border-blue-900/30 rounded-xl p-6 space-y-3 text-left">
                    <div className="flex items-center gap-2 text-[#FF8C00] font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        <span>What's next</span>
                    </div>
                    <ul className="space-y-2 text-blue-300 text-sm">
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C00]" />
                            Your premium features are now unlocked
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C00]" />
                            A confirmation email has been sent to you
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C00]" />
                            Manage your billing anytime from Settings
                        </li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={() => navigate('/')}
                        className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white font-semibold px-6"
                    >
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Link to="/Settings">
                        <Button variant="outline" className="border-blue-900/30 text-blue-300 w-full sm:w-auto">
                            Manage Billing
                        </Button>
                    </Link>
                </div>

                {/* Auto-redirect */}
                <p className="text-blue-500 text-xs">
                    Redirecting to dashboard in {countdown} seconds...
                </p>
            </div>
        </div>
    );
}