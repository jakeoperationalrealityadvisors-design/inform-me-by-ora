import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AICompletionAssistant({ entity, data }) {
    const [analysis, setAnalysis] = useState(null);
    
    const analyzeMutation = useMutation({
        mutationFn: async () => {
            const response = await httpClient.integrations.Core.InvokeLLM({
                prompt: `Analyze this ${entity} submission for completion and quality:

${JSON.stringify(data, null, 2)}

Provide:
1. Completion score (0-100)
2. Missing or incomplete fields
3. Quality assessment
4. Suggestions for improvement
5. Next recommended actions`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        completion_score: { type: "number" },
                        status: { type: "string", enum: ["complete", "incomplete", "needs_review"] },
                        missing_fields: { type: "array", items: { type: "string" } },
                        quality_issues: { type: "array", items: { type: "string" } },
                        suggestions: { type: "array", items: { type: "string" } },
                        next_actions: { type: "array", items: { type: "string" } },
                        priority: { type: "string", enum: ["low", "medium", "high", "urgent"] }
                    }
                }
            });
            return response;
        },
        onSuccess: (data) => {
            setAnalysis(data);
            toast.success('Analysis complete');
        }
    });
    
    const statusColors = {
        complete: 'bg-green-600',
        incomplete: 'bg-yellow-600',
        needs_review: 'bg-red-600'
    };
    
    const priorityColors = {
        low: 'bg-blue-600',
        medium: 'bg-yellow-600',
        high: 'bg-orange-600',
        urgent: 'bg-red-600'
    };
    
    return (
        <Card className="bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-purple-900/30">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        AI Completion Check
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
                                Analyze
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {!analysis && !analyzeMutation.isPending && (
                    <p className="text-blue-400 text-sm text-center py-4">
                        Get AI-powered completion and quality analysis
                    </p>
                )}
                
                {analyzeMutation.isPending && (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-blue-950/20 rounded animate-pulse" />
                        ))}
                    </div>
                )}
                
                {analysis && (
                    <div className="space-y-4">
                        {/* Score */}
                        <div className="text-center p-4 bg-[#0a0e17] rounded-lg border border-blue-900/30">
                            <div className="text-4xl font-bold text-white mb-1">
                                {analysis.completion_score}%
                            </div>
                            <p className="text-blue-400 text-sm">Completion Score</p>
                            <div className="flex gap-2 justify-center mt-2">
                                <Badge className={statusColors[analysis.status]}>
                                    {analysis.status}
                                </Badge>
                                <Badge className={priorityColors[analysis.priority]}>
                                    {analysis.priority} priority
                                </Badge>
                            </div>
                        </div>
                        
                        {/* Missing Fields */}
                        {analysis.missing_fields?.length > 0 && (
                            <div className="bg-yellow-950/20 p-3 rounded-lg border border-yellow-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                    <p className="text-yellow-300 font-semibold text-sm">Missing Fields</p>
                                </div>
                                <ul className="space-y-1">
                                    {analysis.missing_fields.map((field, idx) => (
                                        <li key={idx} className="text-yellow-300/80 text-sm pl-3">• {field}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Quality Issues */}
                        {analysis.quality_issues?.length > 0 && (
                            <div className="bg-red-950/20 p-3 rounded-lg border border-red-900/30">
                                <p className="text-red-300 font-semibold text-sm mb-2">Quality Issues</p>
                                <ul className="space-y-1">
                                    {analysis.quality_issues.map((issue, idx) => (
                                        <li key={idx} className="text-red-300/80 text-sm pl-3">⚠️ {issue}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Suggestions */}
                        {analysis.suggestions?.length > 0 && (
                            <div className="bg-blue-950/20 p-3 rounded-lg border border-blue-900/30">
                                <p className="text-blue-300 font-semibold text-sm mb-2">Suggestions</p>
                                <ul className="space-y-1">
                                    {analysis.suggestions.map((suggestion, idx) => (
                                        <li key={idx} className="text-blue-300/80 text-sm pl-3">💡 {suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Next Actions */}
                        {analysis.next_actions?.length > 0 && (
                            <div className="bg-green-950/20 p-3 rounded-lg border border-green-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    <p className="text-green-300 font-semibold text-sm">Recommended Next Steps</p>
                                </div>
                                <ul className="space-y-1">
                                    {analysis.next_actions.map((action, idx) => (
                                        <li key={idx} className="text-green-300/80 text-sm pl-3">→ {action}</li>
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