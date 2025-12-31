import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Target, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectManagementAI({ tasks, users, formSubmissions, checklistSubmissions }) {
    const [analysis, setAnalysis] = useState(null);
    
    const analyzeMutation = useMutation({
        mutationFn: async () => {
            const overdueTasks = tasks.filter(t => 
                t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
            );
            
            const userWorkload = {};
            tasks.filter(t => t.status !== 'completed').forEach(task => {
                const user = task.assigned_to_email;
                if (user) {
                    userWorkload[user] = (userWorkload[user] || 0) + 1;
                }
            });
            
            const tasksByPriority = tasks.reduce((acc, t) => {
                acc[t.priority || 'medium'] = (acc[t.priority || 'medium'] || 0) + 1;
                return acc;
            }, {});
            
            const completionRate = tasks.length > 0
                ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100
                : 0;
            
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are a project management AI expert. Analyze this project data and provide actionable insights:

**Task Overview:**
- Total Tasks: ${tasks.length}
- Completed: ${tasks.filter(t => t.status === 'completed').length}
- In Progress: ${tasks.filter(t => t.status === 'in_progress').length}
- Overdue: ${overdueTasks.length}
- Completion Rate: ${completionRate.toFixed(1)}%

**Tasks by Priority:**
${JSON.stringify(tasksByPriority, null, 2)}

**User Workload Distribution:**
${JSON.stringify(userWorkload, null, 2)}

**Activity Metrics:**
- Form Submissions (last 30 days): ${formSubmissions.length}
- Checklist Completions (last 30 days): ${checklistSubmissions.length}

Provide:
1. Task prioritization recommendations
2. Project completion time predictions
3. Risk analysis and potential delays
4. Resource allocation suggestions
5. Workload balancing recommendations`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        project_health_score: { type: "number" },
                        completion_prediction: {
                            type: "object",
                            properties: {
                                estimated_days: { type: "number" },
                                confidence: { type: "string", enum: ["high", "medium", "low"] },
                                explanation: { type: "string" }
                            }
                        },
                        priority_recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    task_description: { type: "string" },
                                    current_priority: { type: "string" },
                                    suggested_priority: { type: "string" },
                                    reason: { type: "string" }
                                }
                            }
                        },
                        risk_analysis: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    risk: { type: "string" },
                                    severity: { type: "string", enum: ["high", "medium", "low"] },
                                    impact: { type: "string" },
                                    mitigation: { type: "string" }
                                }
                            }
                        },
                        resource_allocation: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    user: { type: "string" },
                                    current_load: { type: "string" },
                                    recommendation: { type: "string" },
                                    action: { type: "string" }
                                }
                            }
                        },
                        key_insights: { type: "array", items: { type: "string" } }
                    }
                }
            });
            
            return response;
        },
        onSuccess: (data) => {
            setAnalysis(data);
            toast.success('AI analysis complete!');
        },
        onError: (error) => {
            toast.error('Analysis failed: ' + error.message);
        }
    });
    
    const severityColors = {
        high: 'bg-red-950/30 border-red-900/30 text-red-300',
        medium: 'bg-yellow-950/30 border-yellow-900/30 text-yellow-300',
        low: 'bg-blue-950/30 border-blue-900/30 text-blue-300'
    };
    
    return (
        <Card className="bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-purple-900/30">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        AI Project Assistant
                    </CardTitle>
                    <Button
                        onClick={() => analyzeMutation.mutate()}
                        disabled={analyzeMutation.isPending}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                        {analyzeMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Analyze Project
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {!analysis && !analyzeMutation.isPending && (
                    <div className="text-center py-8">
                        <Target className="w-12 h-12 text-purple-400/30 mx-auto mb-3" />
                        <p className="text-blue-400 text-sm">
                            Get AI-powered insights on task priorities, timelines, and resource allocation
                        </p>
                    </div>
                )}
                
                {analyzeMutation.isPending && (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-blue-950/20 rounded-lg animate-pulse" />
                        ))}
                    </div>
                )}
                
                {analysis && (
                    <div className="space-y-6">
                        {/* Project Health */}
                        <div className="flex items-center justify-between p-4 bg-[#0a0e17] rounded-lg border border-purple-900/30">
                            <div>
                                <p className="text-sm text-purple-300 mb-1">Project Health</p>
                                <div className="flex items-center gap-2">
                                    <div className={`text-3xl font-bold ${
                                        analysis.project_health_score >= 80 ? 'text-green-400' :
                                        analysis.project_health_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                        {analysis.project_health_score}/100
                                    </div>
                                </div>
                            </div>
                            <TrendingUp className={`w-8 h-8 ${
                                analysis.project_health_score >= 80 ? 'text-green-400' :
                                analysis.project_health_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                            }`} />
                        </div>
                        
                        {/* Completion Prediction */}
                        <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-blue-400" />
                                <h3 className="font-semibold text-white">Completion Prediction</h3>
                                <Badge className={`ml-auto ${
                                    analysis.completion_prediction.confidence === 'high' ? 'bg-green-600' :
                                    analysis.completion_prediction.confidence === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                                }`}>
                                    {analysis.completion_prediction.confidence} confidence
                                </Badge>
                            </div>
                            <p className="text-2xl font-bold text-blue-400 mb-2">
                                ~{analysis.completion_prediction.estimated_days} days
                            </p>
                            <p className="text-sm text-blue-300">{analysis.completion_prediction.explanation}</p>
                        </div>
                        
                        {/* Key Insights */}
                        <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                            <h3 className="font-semibold text-white mb-3">Key Insights</h3>
                            <ul className="space-y-2">
                                {analysis.key_insights.map((insight, idx) => (
                                    <li key={idx} className="text-sm text-blue-300 pl-3">💡 {insight}</li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Priority Recommendations */}
                        {analysis.priority_recommendations?.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-green-400" />
                                    Task Prioritization
                                </h3>
                                <div className="space-y-2">
                                    {analysis.priority_recommendations.map((rec, idx) => (
                                        <div key={idx} className="bg-[#0a0e17] p-3 rounded-lg border border-green-900/30">
                                            <p className="text-sm text-white font-medium mb-1">{rec.task_description}</p>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline">{rec.current_priority}</Badge>
                                                <span className="text-blue-400">→</span>
                                                <Badge className="bg-green-600">{rec.suggested_priority}</Badge>
                                            </div>
                                            <p className="text-xs text-blue-300">{rec.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Risk Analysis */}
                        {analysis.risk_analysis?.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                    Risk Analysis
                                </h3>
                                <div className="space-y-2">
                                    {analysis.risk_analysis.map((risk, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg border ${severityColors[risk.severity]}`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <p className="font-medium">{risk.risk}</p>
                                                <Badge className={severityColors[risk.severity]}>
                                                    {risk.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-sm mb-2">Impact: {risk.impact}</p>
                                            <p className="text-sm">
                                                <strong>Mitigation:</strong> {risk.mitigation}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Resource Allocation */}
                        {analysis.resource_allocation?.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-400" />
                                    Resource Allocation
                                </h3>
                                <div className="space-y-2">
                                    {analysis.resource_allocation.map((res, idx) => (
                                        <div key={idx} className="bg-[#0a0e17] p-3 rounded-lg border border-blue-900/20">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium text-white">{res.user}</p>
                                                <Badge variant="outline">{res.current_load}</Badge>
                                            </div>
                                            <p className="text-sm text-blue-300 mb-1">{res.recommendation}</p>
                                            <p className="text-xs text-green-400">→ {res.action}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}