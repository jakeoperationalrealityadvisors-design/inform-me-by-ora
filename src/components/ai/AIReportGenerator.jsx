import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";

export default function AIReportGenerator({ data, reportType = 'general' }) {
    const [report, setReport] = useState(null);
    
    const generateMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are an expert data analyst. Generate a comprehensive business report based on this data:

**Report Type:** ${reportType}

**Data Summary:**
${JSON.stringify(data, null, 2)}

Create a detailed report with:
1. Executive Summary
2. Key Performance Indicators (KPIs)
3. Trend Analysis
4. Performance Insights
5. Areas of Concern
6. Recommendations
7. Next Steps

Be specific with numbers and actionable insights.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        executive_summary: { type: "string" },
                        kpis: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    value: { type: "string" },
                                    change: { type: "string" },
                                    status: { type: "string", enum: ["good", "warning", "critical"] }
                                }
                            }
                        },
                        trends: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    trend: { type: "string" },
                                    direction: { type: "string", enum: ["up", "down", "stable"] },
                                    significance: { type: "string" }
                                }
                            }
                        },
                        insights: {
                            type: "array",
                            items: { type: "string" }
                        },
                        concerns: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    concern: { type: "string" },
                                    severity: { type: "string", enum: ["high", "medium", "low"] },
                                    impact: { type: "string" }
                                }
                            }
                        },
                        recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    recommendation: { type: "string" },
                                    priority: { type: "string", enum: ["high", "medium", "low"] },
                                    expected_impact: { type: "string" }
                                }
                            }
                        },
                        next_steps: {
                            type: "array",
                            items: { type: "string" }
                        }
                    }
                }
            });
            
            return response;
        },
        onSuccess: (data) => {
            setReport(data);
            toast.success('Report generated!');
        },
        onError: (error) => {
            toast.error('Generation failed: ' + error.message);
        }
    });
    
    const exportReport = () => {
        const reportText = `
# ${report.title}

## Executive Summary
${report.executive_summary}

## Key Performance Indicators
${report.kpis.map(kpi => `- **${kpi.name}:** ${kpi.value} (${kpi.change})`).join('\n')}

## Trends
${report.trends.map(t => `- ${t.trend} (${t.direction}): ${t.significance}`).join('\n')}

## Key Insights
${report.insights.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

## Areas of Concern
${report.concerns.map(c => `- **${c.concern}** (${c.severity}): ${c.impact}`).join('\n')}

## Recommendations
${report.recommendations.map((r, idx) => `${idx + 1}. ${r.recommendation} (Priority: ${r.priority})\n   Impact: ${r.expected_impact}`).join('\n\n')}

## Next Steps
${report.next_steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}
        `;
        
        const blob = new Blob([reportText], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.md`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success('Report downloaded!');
    };
    
    const statusColors = {
        good: 'bg-green-600',
        warning: 'bg-yellow-600',
        critical: 'bg-red-600'
    };
    
    const severityColors = {
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
                        AI Report Generator
                    </CardTitle>
                    <div className="flex gap-2">
                        {report && (
                            <Button
                                onClick={exportReport}
                                variant="outline"
                                size="sm"
                                className="border-green-600 text-green-300"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        )}
                        <Button
                            onClick={() => generateMutation.mutate()}
                            disabled={generateMutation.isPending}
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-blue-600"
                        >
                            {generateMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Generate Report
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!report && !generateMutation.isPending && (
                    <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-purple-400/30 mx-auto mb-3" />
                        <p className="text-blue-400 text-sm">
                            Generate an AI-powered analytical report with insights and recommendations
                        </p>
                    </div>
                )}
                
                {generateMutation.isPending && (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-blue-950/20 rounded-lg animate-pulse" />
                        ))}
                    </div>
                )}
                
                {report && (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {/* Title */}
                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-bold text-white mb-2">{report.title}</h2>
                        </div>
                        
                        {/* Executive Summary */}
                        <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                            <h3 className="font-semibold text-white mb-2">Executive Summary</h3>
                            <p className="text-sm text-blue-300">{report.executive_summary}</p>
                        </div>
                        
                        {/* KPIs */}
                        <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                            <h3 className="font-semibold text-white mb-3">Key Performance Indicators</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {report.kpis.map((kpi, idx) => (
                                    <div key={idx} className="p-3 bg-blue-950/20 rounded-lg">
                                        <div className="flex items-start justify-between mb-1">
                                            <p className="text-sm text-blue-400">{kpi.name}</p>
                                            <Badge className={statusColors[kpi.status]}>
                                                {kpi.status}
                                            </Badge>
                                        </div>
                                        <p className="text-lg font-bold text-white">{kpi.value}</p>
                                        <p className="text-xs text-blue-300">{kpi.change}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Trends */}
                        {report.trends?.length > 0 && (
                            <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                                <h3 className="font-semibold text-white mb-3">Trend Analysis</h3>
                                <div className="space-y-2">
                                    {report.trends.map((trend, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <span className="text-lg">
                                                {trend.direction === 'up' ? '📈' : trend.direction === 'down' ? '📉' : '➡️'}
                                            </span>
                                            <div>
                                                <p className="text-white font-medium">{trend.trend}</p>
                                                <p className="text-sm text-blue-400">{trend.significance}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Insights */}
                        {report.insights?.length > 0 && (
                            <div className="bg-green-950/20 p-4 rounded-lg border border-green-900/30">
                                <h3 className="font-semibold text-green-300 mb-2">Key Insights</h3>
                                <ul className="space-y-1">
                                    {report.insights.map((insight, idx) => (
                                        <li key={idx} className="text-sm text-green-300/80 pl-3">💡 {insight}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Concerns */}
                        {report.concerns?.length > 0 && (
                            <div className="bg-[#0a0e17] p-4 rounded-lg border border-red-900/30">
                                <h3 className="font-semibold text-red-300 mb-3">Areas of Concern</h3>
                                <div className="space-y-2">
                                    {report.concerns.map((concern, idx) => (
                                        <div key={idx} className="p-3 bg-red-950/20 rounded border border-red-900/30">
                                            <div className="flex items-start justify-between mb-1">
                                                <p className="text-white font-medium">{concern.concern}</p>
                                                <Badge className={severityColors[concern.severity]}>
                                                    {concern.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-red-300/80">{concern.impact}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Recommendations */}
                        {report.recommendations?.length > 0 && (
                            <div className="bg-[#0a0e17] p-4 rounded-lg border border-purple-900/30">
                                <h3 className="font-semibold text-purple-300 mb-3">Recommendations</h3>
                                <div className="space-y-3">
                                    {report.recommendations.map((rec, idx) => (
                                        <div key={idx} className="p-3 bg-purple-950/20 rounded border border-purple-900/30">
                                            <div className="flex items-start gap-2 mb-2">
                                                <Badge className={severityColors[rec.priority]}>
                                                    {rec.priority}
                                                </Badge>
                                                <p className="text-white font-medium flex-1">{rec.recommendation}</p>
                                            </div>
                                            <p className="text-sm text-purple-300/80">
                                                Expected Impact: {rec.expected_impact}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Next Steps */}
                        {report.next_steps?.length > 0 && (
                            <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                                <h3 className="font-semibold text-white mb-2">Next Steps</h3>
                                <ol className="space-y-1 list-decimal list-inside">
                                    {report.next_steps.map((step, idx) => (
                                        <li key={idx} className="text-sm text-blue-300">{step}</li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}