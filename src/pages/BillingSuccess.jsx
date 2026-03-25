import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Users, FileText, LayoutDashboard, CreditCard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';

export default function BillingSuccess() {
    const queryClient = useQueryClient();

    // Refetch subscription state immediately after landing here
    useEffect(() => {
        const timer = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
        }, 2000); // Give webhook 2 seconds to process
        return () => clearTimeout(timer);
    }, [queryClient]);

    const { data: subscription } = useQuery({
        queryKey: ['subscription'],
        queryFn: () => base44.functions.invoke('checkSubscription', {}).then(r => r.data),
        refetchInterval: 3000, // Poll every 3s until we see the plan activate
        refetchIntervalInBackground: false,
    });

    const plan = subscription?.planName || 'your plan';
    const isActive = subscription?.isActive && subscription?.planKey !== 'trial';

    const nextSteps = [
        { icon: LayoutDashboard, label: 'Go to Dashboard', to: '/', desc: 'Start using your workspace' },
        { icon: FileText, label: 'Create a Form', to: '/CreateForm', desc: 'Build your first field form' },
        { icon: Users, label: 'Invite Team', to: '/UserManagement', desc: 'Add your field team members' },
        { icon: CreditCard, label: 'Manage Billing', to: '/CustomerPortal', desc: 'View invoices and settings' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4 py-16">
            <div className="max-w-xl w-full text-center space-y-8">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                    className="flex justify-center"
                >
                    <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-14 h-14 text-green-400" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1 className="text-3xl font-bold text-white mb-2">You're all set! 🎉</h1>
                    <p className="text-blue-400 text-lg">
                        {isActive
                            ? <>Welcome to <span className="text-white font-semibold">{plan}</span>.</>
                            : 'Your payment is being confirmed — this may take a few seconds.'}
                    </p>
                    {isActive && (
                        <Badge className="mt-3 bg-green-700 text-green-100 text-sm px-4 py-1">
                            ✓ {plan} — Active
                        </Badge>
                    )}
                    {!isActive && (
                        <p className="text-blue-400/60 text-sm mt-2 animate-pulse">Confirming with Stripe...</p>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-2 gap-3"
                >
                    {nextSteps.map(({ icon: Icon, label, to, desc }) => (
                        <Link key={to} to={to}>
                            <Card className="bg-[#0f1419] border-blue-900/20 hover:border-blue-600/40 transition-colors cursor-pointer h-full">
                                <CardContent className="pt-4 pb-4 text-center">
                                    <Icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                    <p className="text-white text-sm font-medium">{label}</p>
                                    <p className="text-blue-400/60 text-xs mt-0.5">{desc}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <Link to="/">
                        <Button className="bg-gradient-to-r from-[#FF8C00] to-[#CC7000] hover:opacity-90 px-8">
                            Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}