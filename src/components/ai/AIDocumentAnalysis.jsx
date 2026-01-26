import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AIDocumentAnalysis({ document }) {
    const [analysis, setAnalysis] = useState(null);
    
    const analyzeMutation = useMutation({
        mutationFn: async () => {
            const response = await httpClient.integrations.Core.InvokeLLM({
                prompt: `Analyze this document and provide comprehensive insights:

**Document:** ${document.title}
**Type:** ${document.file_type}
**Description:** ${document.description || 'No description'}

Provide:
1. Document summary
2. Key information extracted
3. Sentiment analysis
4. Action items mentioned
5. Important dates or deadlines
6. Relevant keywords
7. Recommendations for next steps`,
                file_urls: [document.file_url],
                response_json_schema: {
                    type: "object",
                    properties: {
                        summary: { type: "string" },
                        key_information: {
                            type: "array",
                            items: { type: "string" }
                        },
                        sentiment: {
                            type: "object",
                            properties: {
                                overall: { type: "string", enum: ["positive", "neutral", "negative"] },
                                confidence: { type: "number" }
                            }
                        },
                        action_items: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    action: { type: "string" },
                                    priority: { type: "string", enum: ["high", "medium", "low"] },
                                    deadline: { type: "string" }
                                }
                            }
                        },
                        important_dates: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    date: { type: "string" },
                                    description: { type: "string" }
                                }
                            }
                        },
                        keywords: {
                            type: "array",
                            items: { type: "string" }
                        },
                        recommendations: {
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
            toast.success('Document analysis complete!');
        },
        onError: (error) => {
            toast.error('Analysis failed: ' + error.message);
        }
    });
    
    const sentimentColors = {
        positive: 'bg-green-600',
        neutral: 'bg-blue-600',
        negative: 'bg-red-600'
    };
    
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
                        AI Document Analysis
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
                                Analyze Document
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {!analysis && !analyzeMutation.isPending && (
                    <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-purple-400/30 mx-auto mb-3" />
                        <p className="text-blue-400 text-sm">
                            Get AI-powered insights from this document
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
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                            <h3 className="font-semibold text-white mb-2">Summary</h3>
                            <p className="text-sm text-blue-300">{analysis.summary}</p>
                        </div>
                        
                        {/* Sentiment */}
                        {analysis.sentiment && (
                            <div className="flex items-center gap-3 p-3 bg-[#0a0e17] rounded-lg border border-blue-900/20">
                                <div>
                                    <p className="text-xs text-blue-400 mb-1">Sentiment</p>
                                    <Badge className={sentimentColors[analysis.sentiment.overall]}>
                                        {analysis.sentiment.overall}
                                    </Badge>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-xs text-blue-400">Confidence</p>
                                    <p className="text-lg font-bold text-white">
                                        {(analysis.sentiment.confidence * 100).toFixed(0)}%
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {/* Keywords */}
                        {analysis.keywords?.length > 0 && (
                            <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                                <h3 className="font-semibold text-white mb-2">Keywords</h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.keywords.map((keyword, idx) => (
                                        <Badge key={idx} variant="outline" className="text-blue-300">
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Key Information */}
                        {analysis.key_information?.length > 0 && (
                            <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                                <h3 className="font-semibold text-white mb-2">Key Information</h3>
                                <ul className="space-y-1">
                                    {analysis.key_information.map((info, idx) => (
                                        <li key={idx} className="text-sm text-blue-300 pl-3">• {info}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Action Items */}
                        {analysis.action_items?.length > 0 && (
                            <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                                <h3 className="font-semibold text-white mb-3">Action Items</h3>
                                <div className="space-y-2">
                                    {analysis.action_items.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <Badge className={priorityColors[item.priority]}>
                                                {item.priority}
                                            </Badge>
                                            <div className="flex-1">
                                                <p className="text-sm text-white">{item.action}</p>
                                                {item.deadline && (
                                                    <p className="text-xs text-blue-400">Due: {item.deadline}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Important Dates */}
                        {analysis.important_dates?.length > 0 && (
                            <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                                <h3 className="font-semibold text-white mb-2">Important Dates</h3>
                                <div className="space-y-2">
                                    {analysis.important_dates.map((date, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <Badge variant="outline">{date.date}</Badge>
                                            <p className="text-sm text-blue-300">{date.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Recommendations */}
                        {analysis.recommendations?.length > 0 && (
                            <div className="bg-green-950/20 p-4 rounded-lg border border-green-900/30">
                                <h3 className="font-semibold text-green-300 mb-2">Recommendations</h3>
                                <ul className="space-y-1">
                                    {analysis.recommendations.map((rec, idx) => (
                                        <li key={idx} className="text-sm text-green-300/80 pl-3">💡 {rec}</li>
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