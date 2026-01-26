import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, TrendingUp, AlertTriangle, Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AIInsightsPanel({ dateRange, category, formSubmissions, checklistSubmissions, users }) {
    const [insights, setInsights] = useState(null);
    
    const generateInsightsMutation = useMutation({
        mutationFn: async () => {
            // Prepare data summary
            const totalForms = formSubmissions.length;
            const totalChecklists = checklistSubmissions.length;
            const activeUsers = new Set(formSubmissions.map(f => f.created_by)).size;
            
            const formsByStatus = formSubmissions.reduce((acc, f) => {
                acc[f.status] = (acc[f.status] || 0) + 1;
                return acc;
            }, {});
            
            const checklistsByStatus = checklistSubmissions.reduce((acc, c) => {
                acc[c.status] = (acc[c.status] || 0) + 1;
                return acc;
            }, {});
            
            const avgChecklistCompletion = checklistSubmissions.length > 0
                ? checklistSubmissions.reduce((sum, c) => sum + (c.completion_percentage || 0), 0) / checklistSubmissions.length
                : 0;
            
            // Get time-based patterns
            const submissionsByDay = formSubmissions.reduce((acc, f) => {
                const day = new Date(f.created_date).toLocaleDateString();
                acc[day] = (acc[day] || 0) + 1;
                return acc;
            }, {});
            
            const response = await httpClient.integrations.Core.InvokeLLM({
                prompt: `You are a business intelligence analyst. Analyze this data and provide actionable insights:

**Overview:**
- Total Form Submissions: ${totalForms}
- Total Checklist Completions: ${totalChecklists}
- Active Users: ${activeUsers}
- Date Range: ${dateRange.from} to ${dateRange.to}
${category ? `- Filtered by Category: ${category}` : ''}

**Form Submissions by Status:**
${JSON.stringify(formsByStatus, null, 2)}

**Checklist Completions by Status:**
${JSON.stringify(checklistsByStatus, null, 2)}

**Average Checklist Completion Rate:** ${avgChecklistCompletion.toFixed(1)}%

**Daily Activity Pattern:**
${Object.entries(submissionsByDay).slice(-7).map(([day, count]) => `${day}: ${count} submissions`).join('\n')}

Provide:
1. Key insights (3-5 bullet points) about trends, patterns, and performance
2. Potential issues or bottlenecks (2-3 items)
3. Recommendations for improvement (3-4 actionable items)
4. Engagement score (0-100) with brief explanation
5. Risk areas that need attention
6. Success highlights
7. Predicted trends for next week

Be specific, actionable, and business-focused.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        key_insights: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    impact: { type: "string", enum: ["high", "medium", "low"] },
                                    trend: { type: "string", enum: ["up", "down", "stable"] }
                                }
                            }
                        },
                        bottlenecks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    issue: { type: "string" },
                                    severity: { type: "string", enum: ["high", "medium", "low"] },
                                    affected_area: { type: "string" }
                                }
                            }
                        },
                        recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    priority: { type: "string", enum: ["high", "medium", "low"] }
                                }
                            }
                        },
                        engagement_score: { type: "number" },
                        engagement_explanation: { type: "string" },
                        risk_areas: { type: "array", items: { type: "string" } },
                        success_highlights: { type: "array", items: { type: "string" } },
                        predicted_trends: { type: "string" }
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
    
    const impactColors = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-blue-100 text-blue-800'
    };
    
    const severityColors = {
        high: 'bg-red-950/30 border-red-900/30 text-red-300',
        medium: 'bg-yellow-950/30 border-yellow-900/30 text-yellow-300',
        low: 'bg-blue-950/30 border-blue-900/30 text-blue-300'
    };
    
    return (
        <Card className="bg-[#0f1419] border-blue-900/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        AI-Powered Insights
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
                        <Sparkles className="w-12 h-12 text-purple-400/30 mx-auto mb-3" />
                        <p className="text-blue-400 text-sm">
                            Click "Generate Insights" to get AI-powered analysis of your data
                        </p>
                    </div>
                )}
                
                {generateInsightsMutation.isPending && (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-blue-950/20 rounded-lg animate-pulse" />
                        ))}
                    </div>
                )}
                
                {insights && (
                    <div className="space-y-6">
                        {/* Engagement Score */}
                        <div className="bg-gradient-to-r from-purple-950/30 to-blue-950/30 rounded-lg p-4 border border-purple-900/30">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-purple-300">Engagement Score</span>
                                <span className="text-3xl font-bold text-white">{insights.engagement_score}/100</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                                <div
                                    className={`h-2 rounded-full ${
                                        insights.engagement_score >= 80 ? 'bg-green-500' :
                                        insights.engagement_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${insights.engagement_score}%` }}
                                />
                            </div>
                            <p className="text-xs text-blue-300">{insights.engagement_explanation}</p>
                        </div>
                        
                        {/* Key Insights */}
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                Key Insights
                            </h3>
                            <div className="space-y-2">
                                {insights.key_insights.map((insight, idx) => (
                                    <div key={idx} className="bg-[#0a0e17] rounded-lg p-3 border border-blue-900/20">
                                        <div className="flex items-start justify-between mb-1">
                                            <p className="text-sm font-medium text-white">{insight.title}</p>
                                            <Badge className={impactColors[insight.impact]}>{insight.impact}</Badge>
                                        </div>
                                        <p className="text-xs text-blue-300">{insight.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Bottlenecks */}
                        {insights.bottlenecks.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                    Bottlenecks Detected
                                </h3>
                                <div className="space-y-2">
                                    {insights.bottlenecks.map((bottleneck, idx) => (
                                        <div key={idx} className={`rounded-lg p-3 border ${severityColors[bottleneck.severity]}`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-medium">{bottleneck.affected_area}</p>
                                                <Badge variant="outline" className="text-xs">{bottleneck.severity} severity</Badge>
                                            </div>
                                            <p className="text-xs opacity-90">{bottleneck.issue}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Success Highlights */}
                        {insights.success_highlights.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    Success Highlights
                                </h3>
                                <ul className="space-y-1">
                                    {insights.success_highlights.map((highlight, idx) => (
                                        <li key={idx} className="text-sm text-green-300 pl-3">✓ {highlight}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Risk Areas */}
                        {insights.risk_areas.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    <XCircle className="w-4 h-4 text-red-400" />
                                    Risk Areas
                                </h3>
                                <ul className="space-y-1">
                                    {insights.risk_areas.map((risk, idx) => (
                                        <li key={idx} className="text-sm text-red-300 pl-3">⚠ {risk}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Recommendations */}
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-400" />
                                Recommendations
                            </h3>
                            <div className="space-y-2">
                                {insights.recommendations.map((rec, idx) => (
                                    <div key={idx} className="bg-[#0a0e17] rounded-lg p-3 border border-blue-900/20">
                                        <div className="flex items-start justify-between mb-1">
                                            <p className="text-sm font-medium text-white">{rec.title}</p>
                                            <Badge variant="outline" className="text-xs">{rec.priority} priority</Badge>
                                        </div>
                                        <p className="text-xs text-blue-300">{rec.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Predicted Trends */}
                        <div className="bg-blue-950/20 rounded-lg p-4 border border-blue-900/30">
                            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-400" />
                                Predicted Trends
                            </h3>
                            <p className="text-sm text-blue-300">{insights.predicted_trends}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}