import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, CheckCircle2 } from 'lucide-react';

export default function AutomationAnalytics({ automations, activityLogs }) {
    const enabledAutomations = automations.filter(a => a.enabled);
    const totalExecutions = automations.reduce((sum, a) => sum + (a.execution_count || 0), 0);

    // Top performing automations
    const topAutomations = [...automations]
        .sort((a, b) => (b.execution_count || 0) - (a.execution_count || 0))
        .slice(0, 5)
        .map(a => ({
            name: a.name.length > 20 ? a.name.substring(0, 20) + '...' : a.name,
            executions: a.execution_count || 0
        }));

    // Success rate calculation (simplified - you'd track this in real implementation)
    const successRate = 95; // Placeholder

    // Automation activity by type
    const automationActivity = activityLogs
        .filter(log => log.action_type.includes('automation'))
        .reduce((acc, log) => {
            const existing = acc.find(a => a.type === log.action_type);
            if (existing) {
                existing.count++;
            } else {
                acc.push({ type: log.action_type.replace('automation_', ''), count: 1 });
            }
            return acc;
        }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overview Stats */}
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white">Automation Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-950/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    <p className="text-xs text-green-400">Active</p>
                                </div>
                                <p className="text-2xl font-bold text-white">{enabledAutomations.length}</p>
                                <p className="text-xs text-green-500 mt-1">of {automations.length} total</p>
                            </div>
                            <div className="bg-blue-950/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-blue-400" />
                                    <p className="text-xs text-blue-400">Executions</p>
                                </div>
                                <p className="text-2xl font-bold text-white">{totalExecutions}</p>
                                <p className="text-xs text-blue-500 mt-1">total runs</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-950/30 to-green-900/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-green-300">Success Rate</p>
                                <p className="text-2xl font-bold text-white">{successRate}%</p>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                                    style={{ width: `${successRate}%` }}
                                />
                            </div>
                            <p className="text-xs text-green-500 mt-2">
                                {Math.round(totalExecutions * successRate / 100)} successful executions
                            </p>
                        </div>

                        {automations.length > 0 && (
                            <div>
                                <p className="text-sm text-blue-300 mb-3">Most Active Automations</p>
                                <div className="space-y-2">
                                    {topAutomations.slice(0, 3).map((auto, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                            <span className="text-blue-200 truncate flex-1">{auto.name}</span>
                                            <Badge variant="outline" className="bg-blue-950/50 text-blue-300 ml-2">
                                                {auto.executions}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Execution Chart */}
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white">Top Automation Executions</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topAutomations} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e40af" opacity={0.1} />
                            <XAxis type="number" stroke="#60a5fa" />
                            <YAxis type="category" dataKey="name" stroke="#60a5fa" width={150} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                labelStyle={{ color: '#e2e8f0' }}
                            />
                            <Bar dataKey="executions" fill="#f59e0b" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Trigger Types */}
            <Card className="bg-[#0f1419] border-blue-900/20 lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-white">Automation by Trigger Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['form_submitted', 'checklist_completed', 'task_created', 'document_uploaded'].map(trigger => {
                            const count = automations.filter(a => a.trigger_type === trigger).length;
                            return (
                                <div key={trigger} className="bg-slate-800/30 rounded-lg p-4">
                                    <p className="text-xs text-blue-400 mb-2 capitalize">
                                        {trigger.replace('_', ' ')}
                                    </p>
                                    <p className="text-2xl font-bold text-white">{count}</p>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}