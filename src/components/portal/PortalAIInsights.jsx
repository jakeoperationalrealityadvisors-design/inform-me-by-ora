import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function PortalAIInsights({ organization, members, formSubmissions, checklistSubmissions, documents, automations, dateRange }) {
    const [insights, setInsights] = useState(null);
    
    const generateInsightsMutation = useMutation({
        mutationFn: async () => {
            const completionRate = checklistSubmissions.length > 0
                ? (checklistSubmissions.filter(c => c.status === 'completed').length / checklistSubmissions.length) * 100
                : 0;
            
            const response = await httpClient.integrations.Core.InvokeLLM({
                prompt: `You are a business consultant. Analyze this organization's usage data and provide executive-level insights:

**Organization:** ${organization.name}
**Plan:** ${organization.plan_type}
**Team Size:** ${members.length}/${organization.max_users} users
**Active Period:** ${dateRange.from.toLocaleDateString()} to ${dateRange.to.toLocaleDateString()}

**Activity Metrics:**
- Form Submissions: ${formSubmissions.length}
- Checklist Completions: ${checklistSubmissions.length}
- Completion Rate: ${completionRate.toFixed(1)}%
- Documents Uploaded: ${documents.length}
- Active Automations: ${automations.filter(a => a.enabled).length}

**Status Distribution:**
Forms: ${JSON.stringify(formSubmissions.reduce((acc, f) => { acc[f.status] = (acc[f.status] || 0) + 1; return acc; }, {}))}
Checklists: ${JSON.stringify(checklistSubmissions.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {}))}

Provide tailored recommendations to improve their business operations and maximize ROI.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        health_score: { type: "number" },
                        health_trend: { type: "string", enum: ["up", "down", "stable"] },
                        summary: { type: "string" },
                        kpis: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    metric: { type: "string" },
                                    value: { type: "string" },
                                    trend: { type: "string", enum: ["up", "down", "stable"] },
                                    status: { type: "string", enum: ["good", "warning", "critical"] }
                                }
                            }
                        },
                        recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    impact: { type: "string" },
                                    priority: { type: "string", enum: ["high", "medium", "low"] }
                                }
                            }
                        },
                        opportunities: { type: "array", items: { type: "string" } }
                    }
                }
            });
            
            return response;
        },
        onSuccess: (data) => {
            setInsights(data);
            toast.success('AI insights generated!');
        },
        onError: (error) => {
            toast.error('Failed to generate insights: ' + error.message);
        }
    });
    
    const trendIcons = {
        up: TrendingUp,
        down: TrendingDown,
        stable: Minus
    };
    
    const statusColors = {
        good: 'bg-green-950/30 border-green-900/30 text-green-300',
        warning: 'bg-yellow-950/30 border-yellow-900/30 text-yellow-300',
        critical: 'bg-red-950/30 border-red-900/30 text-red-300'
    };
    
    return (
        <Card className="bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-purple-900/30">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        AI-Powered Business Insights
                    </CardTitle>
                    <Button
                        onClick={() => generateInsightsMutation.mutate()}
                        disabled={generateInsightsMutation.isPending}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                        {generateInsightsMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Insights
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {!insights && !generateInsightsMutation.isPending && (
                    <div className="text-center py-8">
                        <Target className="w-12 h-12 text-purple-400/30 mx-auto mb-3" />
                        <p className="text-blue-400 text-sm">
                            Get personalized AI insights about your organization's performance
                        </p>
                    </div>
                )}
                
                {generateInsightsMutation.isPending && (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-blue-950/20 rounded-lg animate-pulse" />
                        ))}
                    </div>
                )}
                
                {insights && (
                    <div className="space-y-6">
                        {/* Health Score */}
                        <div className="flex items-center justify-between p-4 bg-[#0a0e17] rounded-lg border border-purple-900/30">
                            <div>
                                <p className="text-sm text-purple-300 mb-1">Organization Health</p>
                                <p className="text-xs text-blue-400">{insights.summary}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">{insights.health_score}/100</div>
                                </div>
                                {React.createElement(trendIcons[insights.health_trend], {
                                    className: `w-6 h-6 ${insights.health_trend === 'up' ? 'text-green-400' : insights.health_trend === 'down' ? 'text-red-400' : 'text-blue-400'}`
                                })}
                            </div>
                        </div>
                        
                        {/* KPIs */}
                        <div className="grid grid-cols-2 gap-3">
                            {insights.kpis.map((kpi, idx) => {
                                const TrendIcon = trendIcons[kpi.trend];
                                return (
                                    <div key={idx} className={`p-3 rounded-lg border ${statusColors[kpi.status]}`}>
                                        <div className="flex items-start justify-between mb-1">
                                            <p className="text-sm font-medium">{kpi.metric}</p>
                                            <TrendIcon className="w-4 h-4" />
                                        </div>
                                        <p className="text-xl font-bold">{kpi.value}</p>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Recommendations */}
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3">Key Recommendations</h3>
                            <div className="space-y-2">
                                {insights.recommendations.map((rec, idx) => (
                                    <div key={idx} className="p-3 bg-[#0a0e17] rounded-lg border border-blue-900/20">
                                        <div className="flex items-start justify-between mb-1">
                                            <p className="text-sm font-medium text-white">{rec.title}</p>
                                            <Badge variant="outline" className="text-xs">
                                                {rec.priority} priority
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-blue-300">{rec.impact}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Growth Opportunities */}
                        {insights.opportunities.length > 0 && (
                            <div className="bg-green-950/20 rounded-lg p-4 border border-green-900/30">
                                <h3 className="text-sm font-semibold text-green-300 mb-2">Growth Opportunities</h3>
                                <ul className="space-y-1">
                                    {insights.opportunities.map((opp, idx) => (
                                        <li key={idx} className="text-sm text-green-300/80 pl-3">💡 {opp}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}