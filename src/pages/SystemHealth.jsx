import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Activity, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RoleGuard from '@/components/auth/RoleGuard';

function SystemHealthContent() {
    const { data: recentErrors = [] } = useQuery({
        queryKey: ['error-logs'],
        queryFn: async () => {
            const errors = await httpClient.entities.ErrorLog.list('-created_date', 50);
            return errors;
        },
        refetchInterval: 30000
    });

    const { data: supportTickets = [] } = useQuery({
        queryKey: ['support-tickets-admin'],
        queryFn: () => httpClient.entities.SupportTicket.list('-created_date', 20)
    });

    const openTickets = supportTickets.filter(t => t.status === 'open').length;
    const criticalErrors = recentErrors.filter(e => !e.resolved).length;
    const errorRate = recentErrors.length;

    const systemStatus = criticalErrors === 0 && openTickets < 5 ? 'healthy' : 
                        criticalErrors < 5 && openTickets < 10 ? 'warning' : 'critical';

    const statusConfig = {
        healthy: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-950/30', text: 'System Healthy' },
        warning: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-950/30', text: 'Needs Attention' },
        critical: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-950/30', text: 'Critical Issues' }
    };

    const StatusIcon = statusConfig[systemStatus].icon;

    return (
        <div className="min-h-screen bg-[#0a0e17] py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <Link to={createPageUrl('Settings')}>
                    <Button variant="ghost" className="mb-6 text-blue-400">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Settings
                    </Button>
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">System Health</h1>
                    <p className="text-blue-400">Monitor errors, tickets, and system status</p>
                </div>

                {/* Status Overview */}
                <Card className={`bg-[#0f1419] border-blue-900/30 mb-6 ${statusConfig[systemStatus].bg}`}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <StatusIcon className={`w-12 h-12 ${statusConfig[systemStatus].color}`} />
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white">{statusConfig[systemStatus].text}</h2>
                                <p className="text-blue-400">Last checked: {new Date().toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card className="bg-[#0f1419] border-blue-900/30">
                        <CardHeader>
                            <CardTitle className="text-blue-100 text-sm">Unresolved Errors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{criticalErrors}</div>
                            <p className="text-xs text-blue-400 mt-1">Last 24 hours</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#0f1419] border-blue-900/30">
                        <CardHeader>
                            <CardTitle className="text-blue-100 text-sm">Open Support Tickets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{openTickets}</div>
                            <p className="text-xs text-blue-400 mt-1">Requires response</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#0f1419] border-blue-900/30">
                        <CardHeader>
                            <CardTitle className="text-blue-100 text-sm">Total Error Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{errorRate}</div>
                            <p className="text-xs text-blue-400 mt-1">Recent errors logged</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Errors */}
                <Card className="bg-[#0f1419] border-blue-900/30">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-red-400" />
                            Recent Errors
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentErrors.length === 0 ? (
                            <p className="text-blue-400 text-center py-8">No errors logged - system running smoothly!</p>
                        ) : (
                            <div className="space-y-3">
                                {recentErrors.slice(0, 10).map((error) => (
                                    <div key={error.id} className="bg-[#0a0e17] rounded-lg p-4 border border-blue-900/30">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant={error.resolved ? 'outline' : 'destructive'}>
                                                        {error.error_type}
                                                    </Badge>
                                                    <span className="text-xs text-blue-500">
                                                        {new Date(error.created_date).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-white text-sm font-medium">{error.message}</p>
                                                <p className="text-blue-400 text-xs mt-1">{error.user_email}</p>
                                            </div>
                                        </div>
                                        {error.url && (
                                            <p className="text-xs text-blue-500 truncate">{error.url}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function SystemHealth() {
    return (
        <RoleGuard allowedRoles={['admin']}>
            <SystemHealthContent />
        </RoleGuard>
    );
}