import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Lightbulb, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AIAutomationHelper({ currentRule, onSuggestionApply }) {
    const [goal, setGoal] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [optimizations, setOptimizations] = useState(null);

    const handleGetSuggestions = async () => {
        if (!goal.trim()) {
            toast.error('Please describe what you want to automate');
            return;
        }

        setLoading(true);
        setSuggestions(null);

        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are an automation expert. A user wants to create an automation rule with this goal: "${goal}"

Based on this goal, suggest:
1. The most appropriate trigger type (form_submitted, checklist_completed, task_created, task_completed, task_overdue, document_uploaded, status_changed)
2. Relevant conditions (if any) - field, operator, value
3. Recommended actions with configurations
4. A clear rule name and description

Consider these available action types:
- assign_task: Assign a form/checklist submission to a user
- create_task: Create a standalone task
- send_notification: Send in-app notification
- send_email: Send email to recipients
- create_followup: Schedule a follow-up event
- update_status: Change submission status
- add_comment: Add automated comment
- trigger_automation: Chain another automation

Respond with practical, ready-to-use suggestions.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        rule_name: { type: "string" },
                        description: { type: "string" },
                        trigger_type: { type: "string" },
                        trigger_explanation: { type: "string" },
                        conditions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    field: { type: "string" },
                                    operator: { type: "string" },
                                    value: { type: "string" },
                                    explanation: { type: "string" }
                                }
                            }
                        },
                        actions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    explanation: { type: "string" },
                                    sample_config: { type: "object" }
                                }
                            }
                        },
                        additional_tips: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setSuggestions(response);
            toast.success('AI suggestions generated!');
        } catch (error) {
            toast.error('Failed to generate suggestions: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeWorkflow = async () => {
        if (!currentRule?.name) {
            toast.error('Save the automation first to analyze it');
            return;
        }

        setAnalyzing(true);
        setOptimizations(null);

        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Analyze this automation rule and suggest optimizations:

Rule Name: ${currentRule.name}
Description: ${currentRule.description || 'No description'}
Trigger: ${currentRule.trigger_type}
Conditions: ${JSON.stringify(currentRule.conditions || [])}
Actions: ${JSON.stringify(currentRule.actions || [])}

Provide:
1. Effectiveness score (1-10) with explanation
2. Potential issues or inefficiencies
3. Optimization suggestions
4. Ideas for additional actions or conditions that could improve the workflow
5. Best practices recommendations`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        effectiveness_score: { type: "number" },
                        score_explanation: { type: "string" },
                        issues: { type: "array", items: { type: "string" } },
                        optimizations: { type: "array", items: { type: "string" } },
                        additional_ideas: { type: "array", items: { type: "string" } },
                        best_practices: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setOptimizations(response);
            toast.success('Workflow analysis complete!');
        } catch (error) {
            toast.error('Analysis failed: ' + error.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleGenerateMessage = async (type) => {
        setLoading(true);
        try {
            const context = currentRule?.name ? `for automation rule "${currentRule.name}"` : '';
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate a professional ${type === 'notification' ? 'notification message' : 'email'} ${context}.
                
${type === 'notification' ? 'Create a concise title (max 50 chars) and message (max 200 chars).' : 'Create a subject line and email body.'}
The tone should be professional but friendly.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        message: { type: "string" },
                        ...(type === 'email' && { subject: { type: "string" }, body: { type: "string" } })
                    }
                }
            });

            navigator.clipboard.writeText(JSON.stringify(response, null, 2));
            toast.success('Message generated and copied to clipboard!');
        } catch (error) {
            toast.error('Failed to generate message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-[#0a0e17] border-blue-900/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    AI Automation Assistant
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="suggest" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full bg-[#0f1419]">
                        <TabsTrigger value="suggest">Suggest</TabsTrigger>
                        <TabsTrigger value="analyze">Analyze</TabsTrigger>
                        <TabsTrigger value="generate">Generate</TabsTrigger>
                    </TabsList>

                    {/* Suggest Tab */}
                    <TabsContent value="suggest" className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-blue-100 mb-2 block">
                                What do you want to automate?
                            </label>
                            <Textarea
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                placeholder="E.g., 'Send a notification when a high-priority form is submitted' or 'Create a task 7 days after checklist completion'"
                                rows={3}
                                className="bg-[#0f1419] border-blue-900/20 text-white"
                            />
                        </div>

                        <Button
                            onClick={handleGetSuggestions}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-black"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Get AI Suggestions
                                </>
                            )}
                        </Button>

                        {suggestions && (
                            <div className="space-y-4 mt-4 p-4 bg-[#0f1419] rounded-lg border border-blue-900/20">
                                <div>
                                    <h4 className="font-semibold text-white mb-1">{suggestions.rule_name}</h4>
                                    <p className="text-sm text-blue-300">{suggestions.description}</p>
                                </div>

                                <div>
                                    <label className="text-xs text-blue-400 mb-1 block">TRIGGER</label>
                                    <Badge className="bg-blue-500/20 text-blue-300">
                                        {suggestions.trigger_type}
                                    </Badge>
                                    <p className="text-xs text-blue-400/70 mt-1">{suggestions.trigger_explanation}</p>
                                </div>

                                {suggestions.conditions?.length > 0 && (
                                    <div>
                                        <label className="text-xs text-blue-400 mb-2 block">CONDITIONS</label>
                                        {suggestions.conditions.map((cond, idx) => (
                                            <div key={idx} className="text-sm text-blue-200 mb-2 pl-3 border-l-2 border-orange-500/30">
                                                <code className="text-yellow-300">
                                                    {cond.field} {cond.operator} {cond.value}
                                                </code>
                                                <p className="text-xs text-blue-400/70 mt-0.5">{cond.explanation}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs text-blue-400 mb-2 block">ACTIONS</label>
                                    {suggestions.actions?.map((action, idx) => (
                                        <div key={idx} className="mb-3 p-2 bg-green-950/20 rounded border border-green-900/30">
                                            <Badge className="bg-green-500/20 text-green-300 mb-1">
                                                {action.type}
                                            </Badge>
                                            <p className="text-xs text-blue-300 mt-1">{action.explanation}</p>
                                            {action.sample_config && (
                                                <pre className="text-xs text-blue-400/60 mt-1 bg-[#0a0e17] p-2 rounded overflow-x-auto">
                                                    {JSON.stringify(action.sample_config, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {suggestions.additional_tips?.length > 0 && (
                                    <div>
                                        <label className="text-xs text-blue-400 mb-2 block flex items-center gap-1">
                                            <Lightbulb className="w-3 h-3" />
                                            TIPS
                                        </label>
                                        <ul className="space-y-1">
                                            {suggestions.additional_tips.map((tip, idx) => (
                                                <li key={idx} className="text-xs text-blue-300 pl-3">• {tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <Button
                                    onClick={() => onSuggestionApply?.(suggestions)}
                                    variant="outline"
                                    className="w-full border-blue-600 text-blue-300 hover:bg-blue-950/30"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Apply Suggestions to Form
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    {/* Analyze Tab */}
                    <TabsContent value="analyze" className="space-y-4">
                        <div className="text-sm text-blue-300 mb-4">
                            Get AI-powered analysis of your automation workflow to identify improvements and optimization opportunities.
                        </div>

                        <Button
                            onClick={handleAnalyzeWorkflow}
                            disabled={analyzing || !currentRule?.name}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white"
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    Analyze Current Workflow
                                </>
                            )}
                        </Button>

                        {optimizations && (
                            <div className="space-y-4 p-4 bg-[#0f1419] rounded-lg border border-blue-900/20">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl font-bold text-white">
                                        {optimizations.effectiveness_score}/10
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-blue-400 block">EFFECTIVENESS SCORE</label>
                                        <p className="text-sm text-blue-300">{optimizations.score_explanation}</p>
                                    </div>
                                </div>

                                {optimizations.issues?.length > 0 && (
                                    <div>
                                        <label className="text-xs text-red-400 mb-2 block">⚠️ POTENTIAL ISSUES</label>
                                        <ul className="space-y-1">
                                            {optimizations.issues.map((issue, idx) => (
                                                <li key={idx} className="text-sm text-red-300 pl-3">• {issue}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {optimizations.optimizations?.length > 0 && (
                                    <div>
                                        <label className="text-xs text-green-400 mb-2 block">✨ OPTIMIZATIONS</label>
                                        <ul className="space-y-1">
                                            {optimizations.optimizations.map((opt, idx) => (
                                                <li key={idx} className="text-sm text-green-300 pl-3">• {opt}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {optimizations.additional_ideas?.length > 0 && (
                                    <div>
                                        <label className="text-xs text-blue-400 mb-2 block">💡 ADDITIONAL IDEAS</label>
                                        <ul className="space-y-1">
                                            {optimizations.additional_ideas.map((idea, idx) => (
                                                <li key={idx} className="text-sm text-blue-300 pl-3">• {idea}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {optimizations.best_practices?.length > 0 && (
                                    <div>
                                        <label className="text-xs text-yellow-400 mb-2 block">📋 BEST PRACTICES</label>
                                        <ul className="space-y-1">
                                            {optimizations.best_practices.map((practice, idx) => (
                                                <li key={idx} className="text-sm text-yellow-300 pl-3">• {practice}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* Generate Tab */}
                    <TabsContent value="generate" className="space-y-4">
                        <div className="text-sm text-blue-300 mb-4">
                            Generate professional messages for notifications, emails, and task descriptions.
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={() => handleGenerateMessage('notification')}
                                disabled={loading}
                                variant="outline"
                                className="border-blue-600 text-blue-300 hover:bg-blue-950/30"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Notification Message
                            </Button>

                            <Button
                                onClick={() => handleGenerateMessage('email')}
                                disabled={loading}
                                variant="outline"
                                className="border-blue-600 text-blue-300 hover:bg-blue-950/30"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Email Template
                            </Button>
                        </div>

                        <div className="text-xs text-blue-400/70 text-center mt-4">
                            Generated content will be copied to your clipboard
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}