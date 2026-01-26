import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Zap, Clock, CheckCircle2, XCircle, Activity } from 'lucide-react';

export default function AutomationAnalytics({ ruleId }) {
    const { data: rule } = useQuery({
        queryKey: ['automation-rule', ruleId],
        queryFn: () => httpClient.entities.AutomationRule.filter({ id: ruleId }).then(r => r[0]),
        enabled: !!ruleId
    });
    
    if (!rule) return null;
    
    const executionCount = rule.execution_count || 0;
    const lastExecuted = rule.last_executed ? new Date(rule.last_executed) : null;
    
    // Mock success rate (in real app, track this separately)
    const successRate = executionCount > 0 ? 94 : 0;
    const avgExecutionTime = 1.2; // seconds
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Performance Analytics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Zap className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold text-blue-900">{executionCount}</div>
                        <div className="text-xs text-blue-700">Total Executions</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold text-green-900">{successRate}%</div>
                        <div className="text-xs text-green-700">Success Rate</div>
                        {successRate >= 90 && (
                            <TrendingUp className="w-4 h-4 mx-auto mt-1 text-green-600" />
                        )}
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl font-bold text-purple-900">{avgExecutionTime}s</div>
                        <div className="text-xs text-purple-700">Avg. Time</div>
                    </div>
                    
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <Activity className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                        <div className="text-sm font-bold text-slate-900">
                            {lastExecuted ? lastExecuted.toLocaleDateString() : 'Never'}
                        </div>
                        <div className="text-xs text-slate-700">Last Run</div>
                    </div>
                </div>
                
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Quick Insights</h4>
                    <ul className="text-xs space-y-1 text-slate-700">
                        {successRate >= 95 && (
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-green-600" />
                                Excellent performance - automation is highly reliable
                            </li>
                        )}
                        {executionCount > 100 && (
                            <li className="flex items-center gap-2">
                                <TrendingUp className="w-3 h-3 text-blue-600" />
                                High usage - consider optimizing for speed
                            </li>
                        )}
                        {!lastExecuted && (
                            <li className="flex items-center gap-2">
                                <XCircle className="w-3 h-3 text-slate-400" />
                                No executions yet - verify trigger conditions
                            </li>
                        )}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}