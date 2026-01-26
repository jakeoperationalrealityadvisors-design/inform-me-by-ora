import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Sparkles, Loader2, AlertTriangle, TrendingUp, Zap, CheckCircle2, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import RoleGuard from '@/components/auth/RoleGuard';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function AutomationOptimizerContent() {
    const queryClient = useQueryClient();
    const [analysis, setAnalysis] = useState(null);
    
    const { data: automations = [] } = useQuery({
        queryKey: ['automation-rules'],
        queryFn: () => httpClient.entities.AutomationRule.list()
    });
    
    const { data: activityLogs = [] } = useQuery({
        queryKey: ['activity-logs-optimizer'],
        queryFn: () => httpClient.entities.ActivityLog.list('-created_date', 2000)
    });
    
    const { data: formSubmissions = [] } = useQuery({
        queryKey: ['form-submissions-optimizer'],
        queryFn: () => httpClient.entities.FormSubmission.list('-created_date', 500)
    });
    
    const { data: checklistSubmissions = [] } = useQuery({
        queryKey: ['checklist-submissions-optimizer'],
        queryFn: () => httpClient.entities.ChecklistSubmission.list('-created_date', 500)
    });
    
    const analyzeMutation = useMutation({
        mutationFn: async () => {
            // Prepare automation data
            const automationStats = automations.map(auto => ({
                id: auto.id,
                name: auto.name,
                trigger_type: auto.trigger_type,
                action_count: auto.actions?.length || 0,
                enabled: auto.enabled,
                execution_count: auto.execution_count || 0,
                last_executed: auto.last_executed,
                has_conditions: !!(auto.condition_logic?.groups?.length),
                has_delays: auto.actions?.some(a => a.delay_minutes) || false
            }));
            
            // Analyze activity patterns
            const actionTypes = activityLogs.reduce((acc, log) => {
                acc[log.action_type] = (acc[log.action_type] || 0) + 1;
                return acc;
            }, {});
            
            // Analyze submission patterns
            const submissionsByUser = {};
            [...formSubmissions, ...checklistSubmissions].forEach(sub => {
                const user = sub.created_by || sub.submitted_by_name;
                if (user) {
                    submissionsByUser[user] = (submissionsByUser[user] || 0) + 1;
                }
            });
            
            const response = await httpClient.integrations.Core.InvokeLLM({
                prompt: `You are an automation optimization expert. Analyze this workflow data and provide actionable recommendations:

**Current Automations (${automations.length} total):**
${JSON.stringify(automationStats, null, 2)}

**Activity Patterns:**
${JSON.stringify(actionTypes, null, 2)}

**Top Users by Activity:**
${JSON.stringify(Object.entries(submissionsByUser).sort((a, b) => b[1] - a[1]).slice(0, 10), null, 2)}

**Analysis Requirements:**
1. Identify redundant or overlapping automations
2. Detect automations that are never triggered (execution_count = 0)
3. Find bottlenecks (overused triggers without proper automation)
4. Suggest new automation opportunities based on manual repetitive actions
5. Recommend performance optimizations (e.g., combining actions, using conditions)
6. Identify missing automation scenarios (e.g., auto-assignment based on workload)
7. Suggest improvements for lead distribution and task escalation

Provide specific, actionable recommendations with priority levels.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        efficiency_score: { type: "number" },
                        summary: { type: "string" },
                        redundancies: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    automation_ids: { type: "array", items: { type: "string" } },
                                    issue: { type: "string" },
                                    impact: { type: "string" },
                                    recommendation: { type: "string" }
                                }
                            }
                        },
                        unused_automations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    automation_id: { type: "string" },
                                    reason: { type: "string" },
                                    suggestion: { type: "string" }
                                }
                            }
                        },
                        bottlenecks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    area: { type: "string" },
                                    description: { type: "string" },
                                    frequency: { type: "string" },
                                    severity: { type: "string", enum: ["high", "medium", "low"] }
                                }
                            }
                        },
                        optimization_opportunities: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    expected_impact: { type: "string" },
                                    priority: { type: "string", enum: ["high", "medium", "low"] }
                                }
                            }
                        },
                        new_automation_suggestions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    description: { type: "string" },
                                    trigger_type: { type: "string" },
                                    use_case: { type: "string" },
                                    time_savings: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            
            return response;
        },
        onSuccess: (data) => {
            setAnalysis(data);
            toast.success('Analysis complete!');
        },
        onError: (error) => {
            toast.error('Analysis failed: ' + error.message);
        }
    });
    
    const createAutomationMutation = useMutation({
        mutationFn: async (suggestion) => {
            // Create a basic automation structure from the suggestion
            const newAutomation = {
                name: suggestion.name,
                description: suggestion.description,
                trigger_type: suggestion.trigger_type || 'form_submitted',
                actions: [{ type: 'send_notification', config: {} }],
                enabled: false // Start disabled for review
            };
            
            await httpClient.entities.AutomationRule.create(newAutomation);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['automation-rules']);
            toast.success('Draft automation created! Review and configure it.');
        }
    });
    
    const getAutomationName = (id) => {
        return automations.find(a => a.id === id)?.name || 'Unknown';
    };
    
    const severityColors = {
        high: 'bg-red-950/30 border-red-900/30 text-red-300',
        medium: 'bg-yellow-950/30 border-yellow-900/30 text-yellow-300',
        low: 'bg-blue-950/30 border-blue-900/30 text-blue-300'
    };
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('ManageAutomations')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Zap className="w-6 h-6 text-[#FF8C00]" />
                                    Automation Optimizer
                                </h1>
                                <p className="text-sm text-blue-400">AI-powered analysis and recommendations</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => analyzeMutation.mutate()}
                            disabled={analyzeMutation.isPending}
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
                                    Run Analysis
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {!analysis && !analyzeMutation.isPending && (
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardContent className="pt-6">
                            <div className="text-center py-12">
                                <Sparkles className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Optimize Your Automations
                                </h3>
                                <p className="text-blue-400 mb-6 max-w-md mx-auto">
                                    AI will analyze your automation rules, activity logs, and user patterns to identify
                                    bottlenecks, redundancies, and suggest optimizations.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                    <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                                        <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                        <p className="text-sm text-blue-300">Detect Redundancies</p>
                                    </div>
                                    <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                                        <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                        <p className="text-sm text-blue-300">Find Opportunities</p>
                                    </div>
                                    <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                                        <Zap className="w-8 h-8 text-[#FF8C00] mx-auto mb-2" />
                                        <p className="text-sm text-blue-300">Boost Efficiency</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
                
                {analyzeMutation.isPending && (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-blue-950/20 rounded-lg animate-pulse" />
                        ))}
                    </div>
                )}
                
                {analysis && (
                    <>
                        {/* Efficiency Score */}
                        <Card className="bg-gradient-to-r from-purple-950/30 to-blue-950/30 border-purple-900/30">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-purple-300 mb-1">Automation Efficiency</p>
                                        <p className="text-sm text-blue-400">{analysis.summary}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-5xl font-bold text-white">{analysis.efficiency_score}/100</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Redundancies */}
                        {analysis.redundancies?.length > 0 && (
                            <Card className="bg-[#0f1419] border-red-900/30">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-400" />
                                        Redundant Automations ({analysis.redundancies.length})
                                    </CardTitle>
                                    <CardDescription className="text-blue-400">
                                        These automations overlap or duplicate functionality
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {analysis.redundancies.map((item, idx) => (
                                        <div key={idx} className="bg-[#0a0e17] p-4 rounded-lg border border-red-900/30">
                                            <div className="flex items-start gap-3 mb-2">
                                                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-white font-medium mb-1">{item.issue}</p>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {item.automation_ids.map(id => (
                                                            <Badge key={id} variant="outline" className="text-xs">
                                                                {getAutomationName(id)}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-red-300 mb-2">{item.impact}</p>
                                                    <p className="text-sm text-blue-400">
                                                        💡 <span className="font-medium">Recommendation:</span> {item.recommendation}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                        
                        {/* Unused Automations */}
                        {analysis.unused_automations?.length > 0 && (
                            <Card className="bg-[#0f1419] border-yellow-900/30">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                        Unused Automations ({analysis.unused_automations.length})
                                    </CardTitle>
                                    <CardDescription className="text-blue-400">
                                        These automations have never been triggered
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {analysis.unused_automations.map((item, idx) => (
                                        <div key={idx} className="bg-[#0a0e17] p-4 rounded-lg border border-yellow-900/30">
                                            <div className="flex items-start justify-between mb-2">
                                                <p className="text-white font-medium">{getAutomationName(item.automation_id)}</p>
                                                <Badge variant="outline" className="text-xs text-yellow-400">Never executed</Badge>
                                            </div>
                                            <p className="text-sm text-yellow-300 mb-2">{item.reason}</p>
                                            <p className="text-sm text-blue-400">💡 {item.suggestion}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                        
                        {/* Bottlenecks */}
                        {analysis.bottlenecks?.length > 0 && (
                            <Card className="bg-[#0f1419] border-blue-900/20">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-orange-400" />
                                        Identified Bottlenecks ({analysis.bottlenecks.length})
                                    </CardTitle>
                                    <CardDescription className="text-blue-400">
                                        Areas with high manual activity that could be automated
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {analysis.bottlenecks.map((item, idx) => (
                                        <div key={idx} className={`p-4 rounded-lg border ${severityColors[item.severity]}`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <p className="text-white font-medium">{item.area}</p>
                                                <Badge className={severityColors[item.severity]}>
                                                    {item.severity} severity
                                                </Badge>
                                            </div>
                                            <p className="text-sm mb-1">{item.description}</p>
                                            <p className="text-xs opacity-80">Frequency: {item.frequency}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                        
                        {/* Optimization Opportunities */}
                        {analysis.optimization_opportunities?.length > 0 && (
                            <Card className="bg-[#0f1419] border-green-900/30">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        Optimization Opportunities ({analysis.optimization_opportunities.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {analysis.optimization_opportunities.map((item, idx) => (
                                        <div key={idx} className="bg-[#0a0e17] p-4 rounded-lg border border-green-900/30">
                                            <div className="flex items-start justify-between mb-2">
                                                <p className="text-white font-medium">{item.title}</p>
                                                <Badge className={`${item.priority === 'high' ? 'bg-red-600' : item.priority === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'}`}>
                                                    {item.priority} priority
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-blue-300 mb-2">{item.description}</p>
                                            <p className="text-sm text-green-400">
                                                📈 Expected Impact: {item.expected_impact}
                                            </p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                        
                        {/* New Automation Suggestions */}
                        {analysis.new_automation_suggestions?.length > 0 && (
                            <Card className="bg-[#0f1419] border-blue-900/20">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                        Suggested New Automations ({analysis.new_automation_suggestions.length})
                                    </CardTitle>
                                    <CardDescription className="text-blue-400">
                                        AI-recommended automations to improve efficiency
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {analysis.new_automation_suggestions.map((suggestion, idx) => (
                                        <div key={idx} className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                                            <div className="flex items-start justify-between mb-2">
                                                <p className="text-white font-semibold">{suggestion.name}</p>
                                                <Badge className="bg-purple-600">{suggestion.trigger_type}</Badge>
                                            </div>
                                            <p className="text-sm text-blue-300 mb-2">{suggestion.description}</p>
                                            <p className="text-sm text-green-400 mb-3">
                                                ⏱️ Estimated Time Savings: {suggestion.time_savings}
                                            </p>
                                            <p className="text-xs text-blue-400/70 mb-3">
                                                Use Case: {suggestion.use_case}
                                            </p>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Create Draft
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-[#0f1419] border-blue-900/20">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-white">Create Draft Automation?</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-blue-300">
                                                            This will create a disabled automation that you can review and configure.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="border-blue-600">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => createAutomationMutation.mutate(suggestion)}
                                                            className="bg-purple-600"
                                                        >
                                                            Create Draft
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function AutomationOptimizer() {
    return (
        <RoleGuard allowedRoles={['admin', 'manager']} requiredPermission="automations.view">
            <AutomationOptimizerContent />
        </RoleGuard>
    );
}