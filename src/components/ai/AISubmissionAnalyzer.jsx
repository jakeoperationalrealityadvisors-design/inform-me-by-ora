import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Tag, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AISubmissionAnalyzer({ submissions }) {
    const [analysis, setAnalysis] = useState(null);
    
    const analyzeMutation = useMutation({
        mutationFn: async () => {
            const submissionSummary = submissions.slice(0, 20).map(sub => ({
                title: sub.form_title || sub.checklist_title,
                responses: sub.responses || {},
                status: sub.status,
                created_date: sub.created_date,
                location: sub.location
            }));
            
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Analyze these form submissions and provide intelligent categorization and automation recommendations:

${JSON.stringify(submissionSummary, null, 2)}

Provide:
1. Automatic categories based on content patterns
2. Common themes and trends
3. Suggested automation rules
4. Priority recommendations
5. Actionable insights`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        categories: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    description: { type: "string" },
                                    count: { type: "number" },
                                    examples: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        themes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    theme: { type: "string" },
                                    frequency: { type: "string" },
                                    significance: { type: "string" }
                                }
                            }
                        },
                        automation_suggestions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    trigger: { type: "string" },
                                    action: { type: "string" },
                                    benefit: { type: "string" },
                                    priority: { type: "string", enum: ["high", "medium", "low"] }
                                }
                            }
                        },
                        insights: {
                            type: "array",
                            items: { type: "string" }
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
    
    const priorityColors = {
        high: 'bg-red-600',
        medium: 'bg-yellow-600',
        low: 'bg-blue-600'
    };
    
    return (
        <Card className="bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-purple-900/30">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        AI Submission Analysis
                    </CardTitle>
                    <Button
                        onClick={() => analyzeMutation.mutate()}
                        disabled={analyzeMutation.isPending || submissions.length === 0}
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
                                Analyze
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {!analysis && !analyzeMutation.isPending && (
                    <div className="text-center py-6">
                        <p className="text-blue-400 text-sm">
                            Get AI-powered categorization and automation recommendations
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
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {/* Categories */}
                        {analysis.categories?.length > 0 && (
                            <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <Tag className="w-4 h-4 text-green-400" />
                                    <h3 className="font-semibold text-white">Auto-Detected Categories</h3>
                                </div>
                                <div className="space-y-3">
                                    {analysis.categories.map((cat, idx) => (
                                        <div key={idx} className="p-3 bg-green-950/20 rounded border border-green-900/30">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className="font-medium text-white">{cat.name}</p>
                                                    <p className="text-sm text-green-300/80">{cat.description}</p>
                                                </div>
                                                <Badge className="bg-green-600">{cat.count} items</Badge>
                                            </div>
                                            {cat.examples?.length > 0 && (
                                                <div className="mt-2 text-xs text-green-400/70">
                                                    Examples: {cat.examples.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Themes */}
                        {analysis.themes?.length > 0 && (
                            <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp className="w-4 h-4 text-blue-400" />
                                    <h3 className="font-semibold text-white">Common Themes</h3>
                                </div>
                                <div className="space-y-2">
                                    {analysis.themes.map((theme, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <Badge variant="outline" className="text-blue-300">
                                                {theme.frequency}
                                            </Badge>
                                            <div>
                                                <p className="text-white text-sm">{theme.theme}</p>
                                                <p className="text-xs text-blue-400">{theme.significance}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Automation Suggestions */}
                        {analysis.automation_suggestions?.length > 0 && (
                            <div className="bg-[#0a0e17] p-4 rounded-lg border border-purple-900/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-4 h-4 text-purple-400" />
                                    <h3 className="font-semibold text-white">Automation Recommendations</h3>
                                </div>
                                <div className="space-y-3">
                                    {analysis.automation_suggestions.map((suggestion, idx) => (
                                        <div key={idx} className="p-3 bg-purple-950/20 rounded border border-purple-900/30">
                                            <div className="flex items-start gap-2 mb-2">
                                                <Badge className={priorityColors[suggestion.priority]}>
                                                    {suggestion.priority}
                                                </Badge>
                                                <div className="flex-1">
                                                    <p className="text-white font-medium text-sm">
                                                        {suggestion.trigger} → {suggestion.action}
                                                    </p>
                                                    <p className="text-xs text-purple-300/80 mt-1">
                                                        💡 {suggestion.benefit}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Insights */}
                        {analysis.insights?.length > 0 && (
                            <div className="bg-green-950/20 p-3 rounded-lg border border-green-900/30">
                                <h3 className="font-semibold text-green-300 mb-2 text-sm">Key Insights</h3>
                                <ul className="space-y-1">
                                    {analysis.insights.map((insight, idx) => (
                                        <li key={idx} className="text-sm text-green-300/80 pl-3">✓ {insight}</li>
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