import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CreditCard, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RoleGuard from '@/components/auth/RoleGuard';
import { toast } from 'sonner';

function BillingTestContent() {
    const queryClient = useQueryClient();
    const [testResults, setTestResults] = useState([]);

    const { data: org } = useQuery({
        queryKey: ['current-org'],
        queryFn: async () => {
            const user = await base44.auth.me();
            if (user.organization_id) {
                const orgs = await base44.entities.Organization.filter({ id: user.organization_id });
                return orgs[0];
            }
            return null;
        }
    });

    const { data: billingHistory = [] } = useQuery({
        queryKey: ['billing-history'],
        queryFn: () => base44.entities.BillingHistory.filter({ organization_id: org?.id }),
        enabled: !!org
    });

    const addTestResult = (test, status, message) => {
        setTestResults(prev => [...prev, { test, status, message, timestamp: new Date() }]);
    };

    const testCheckout = useMutation({
        mutationFn: async () => {
            addTestResult('Checkout', 'running', 'Creating test checkout session...');
            const response = await base44.functions.invoke('createCheckoutSession', {
                plan: 'professional',
                isTest: true
            });
            return response.data;
        },
        onSuccess: (data) => {
            addTestResult('Checkout', 'success', `Session created: ${data.sessionId?.substring(0, 20)}...`);
            toast.success('Checkout session created successfully');
        },
        onError: (error) => {
            addTestResult('Checkout', 'error', error.message);
            toast.error('Checkout failed: ' + error.message);
        }
    });

    const testWebhook = useMutation({
        mutationFn: async () => {
            addTestResult('Webhook', 'running', 'Testing webhook handler...');
            const response = await base44.functions.invoke('testStripeWebhook', {
                eventType: 'checkout.session.completed'
            });
            return response.data;
        },
        onSuccess: () => {
            addTestResult('Webhook', 'success', 'Webhook processed successfully');
            toast.success('Webhook test passed');
            queryClient.invalidateQueries(['billing-history']);
        },
        onError: (error) => {
            addTestResult('Webhook', 'error', error.message);
            toast.error('Webhook test failed: ' + error.message);
        }
    });

    const testUpgrade = useMutation({
        mutationFn: async () => {
            addTestResult('Upgrade', 'running', 'Testing plan upgrade...');
            await base44.entities.Organization.update(org.id, {
                plan_type: 'enterprise',
                max_users: 100
            });
        },
        onSuccess: () => {
            addTestResult('Upgrade', 'success', 'Plan upgraded successfully');
            toast.success('Upgrade test passed');
            queryClient.invalidateQueries(['current-org']);
        },
        onError: (error) => {
            addTestResult('Upgrade', 'error', error.message);
            toast.error('Upgrade test failed: ' + error.message);
        }
    });

    const testCancellation = useMutation({
        mutationFn: async () => {
            addTestResult('Cancellation', 'running', 'Testing subscription cancellation...');
            const response = await base44.functions.invoke('cancelSubscription', {
                organizationId: org.id,
                isTest: true
            });
            return response.data;
        },
        onSuccess: () => {
            addTestResult('Cancellation', 'success', 'Cancellation processed successfully');
            toast.success('Cancellation test passed');
        },
        onError: (error) => {
            addTestResult('Cancellation', 'error', error.message);
            toast.error('Cancellation test failed: ' + error.message);
        }
    });

    const runAllTests = async () => {
        setTestResults([]);
        await testCheckout.mutateAsync().catch(() => {});
        await new Promise(r => setTimeout(r, 1000));
        await testWebhook.mutateAsync().catch(() => {});
        await new Promise(r => setTimeout(r, 1000));
        await testUpgrade.mutateAsync().catch(() => {});
        await new Promise(r => setTimeout(r, 1000));
        await testCancellation.mutateAsync().catch(() => {});
    };

    const statusIcons = {
        running: { icon: Loader2, color: 'text-blue-400', spin: true },
        success: { icon: CheckCircle2, color: 'text-green-400' },
        error: { icon: XCircle, color: 'text-red-400' }
    };

    return (
        <div className="min-h-screen bg-[#0a0e17] py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <Link to={createPageUrl('Settings')}>
                    <Button variant="ghost" className="mb-6 text-blue-400">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Settings
                    </Button>
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Billing Flow Testing</h1>
                    <p className="text-blue-400">Test Stripe integration end-to-end</p>
                </div>

                {/* Current State */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card className="bg-[#0f1419] border-blue-900/30">
                        <CardHeader>
                            <CardTitle className="text-sm text-blue-100">Current Plan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]">
                                {org?.plan_type || 'None'}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#0f1419] border-blue-900/30">
                        <CardHeader>
                            <CardTitle className="text-sm text-blue-100">Billing Records</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{billingHistory.length}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#0f1419] border-blue-900/30">
                        <CardHeader>
                            <CardTitle className="text-sm text-blue-100">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant={org?.status === 'active' ? 'default' : 'destructive'}>
                                {org?.status || 'Unknown'}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Test Actions */}
                <Card className="bg-[#0f1419] border-blue-900/30 mb-8">
                    <CardHeader>
                        <CardTitle className="text-white">Test Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={() => testCheckout.mutate()}
                                disabled={testCheckout.isPending}
                                variant="outline"
                                className="border-blue-900/30"
                            >
                                {testCheckout.isPending ? 'Testing...' : 'Test Checkout'}
                            </Button>
                            <Button
                                onClick={() => testWebhook.mutate()}
                                disabled={testWebhook.isPending}
                                variant="outline"
                                className="border-blue-900/30"
                            >
                                {testWebhook.isPending ? 'Testing...' : 'Test Webhook'}
                            </Button>
                            <Button
                                onClick={() => testUpgrade.mutate()}
                                disabled={testUpgrade.isPending || !org}
                                variant="outline"
                                className="border-blue-900/30"
                            >
                                {testUpgrade.isPending ? 'Testing...' : 'Test Upgrade'}
                            </Button>
                            <Button
                                onClick={() => testCancellation.mutate()}
                                disabled={testCancellation.isPending || !org}
                                variant="outline"
                                className="border-blue-900/30"
                            >
                                {testCancellation.isPending ? 'Testing...' : 'Test Cancel'}
                            </Button>
                        </div>
                        <Button
                            onClick={runAllTests}
                            className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                        >
                            Run All Tests
                        </Button>
                    </CardContent>
                </Card>

                {/* Test Results */}
                <Card className="bg-[#0f1419] border-blue-900/30">
                    <CardHeader>
                        <CardTitle className="text-white">Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {testResults.length === 0 ? (
                            <p className="text-blue-400 text-center py-8">
                                Run tests to see results
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {testResults.map((result, idx) => {
                                    const config = statusIcons[result.status];
                                    const Icon = config.icon;
                                    return (
                                        <div key={idx} className="bg-[#0a0e17] rounded-lg p-4 border border-blue-900/30">
                                            <div className="flex items-start gap-3">
                                                <Icon className={`w-5 h-5 ${config.color} ${config.spin ? 'animate-spin' : ''}`} />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-white">{result.test}</span>
                                                        <Badge variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'outline'}>
                                                            {result.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-blue-400">{result.message}</p>
                                                    <p className="text-xs text-blue-500 mt-1">
                                                        {result.timestamp.toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Billing History */}
                {billingHistory.length > 0 && (
                    <Card className="bg-[#0f1419] border-blue-900/30 mt-8">
                        <CardHeader>
                            <CardTitle className="text-white">Recent Billing History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {billingHistory.slice(0, 5).map((record) => (
                                    <div key={record.id} className="flex items-center justify-between p-3 bg-[#0a0e17] rounded-lg border border-blue-900/30">
                                        <div>
                                            <p className="text-white font-medium">${record.amount}</p>
                                            <p className="text-sm text-blue-400">{record.plan_type}</p>
                                        </div>
                                        <Badge variant={record.status === 'completed' ? 'default' : 'outline'}>
                                            {record.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default function BillingTest() {
    return (
        <RoleGuard allowedRoles={['admin']}>
            <BillingTestContent />
        </RoleGuard>
    );
}