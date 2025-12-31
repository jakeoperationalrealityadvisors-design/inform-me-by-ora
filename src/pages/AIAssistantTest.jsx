import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AIAssistantTest() {
    const [testResults, setTestResults] = useState([]);
    const [running, setRunning] = useState(false);

    const runTests = async () => {
        setRunning(true);
        setTestResults([]);
        const results = [];

        // Test 1: Workflow Generation
        try {
            addResult('Testing Workflow Generation...', 'pending');
            const workflowResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `Create a workflow: When a dairy inspection form is submitted, send email to farm manager and create a follow-up task.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        trigger_type: { type: "string" },
                        actions: { type: "array" }
                    }
                }
            });
            
            if (workflowResponse.name && workflowResponse.trigger_type && workflowResponse.actions) {
                addResult('✅ Workflow Generation: SUCCESS', 'success', workflowResponse);
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            addResult('❌ Workflow Generation: FAILED - ' + error.message, 'error');
        }

        // Test 2: Document Summarization (simulated)
        try {
            addResult('Testing Document Summarization...', 'pending');
            const summaryResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `Summarize this content: "Farm inspection report shows all equipment in good condition. Milk production increased by 15% this quarter. Recommend maintenance check in 3 months."`
            });
            
            if (summaryResponse && summaryResponse.length > 20) {
                addResult('✅ Document Summarization: SUCCESS', 'success', { summary: summaryResponse.substring(0, 100) + '...' });
            } else {
                throw new Error('Summary too short');
            }
        } catch (error) {
            addResult('❌ Document Summarization: FAILED - ' + error.message, 'error');
        }

        // Test 3: Smart Suggestions
        try {
            addResult('Testing Smart Suggestions...', 'pending');
            const forms = await base44.entities.FormTemplate.filter({ status: 'active' });
            const checklists = await base44.entities.ChecklistTemplate.filter({ status: 'active' });
            
            const suggestionResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `Context: "Dairy farm inspection". Available: Forms: ${forms.slice(0, 5).map(f => f.title).join(', ')}. Checklists: ${checklists.slice(0, 5).map(c => c.title).join(', ')}. Suggest top 3.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        suggestions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    type: { type: "string" },
                                    relevance: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            
            if (suggestionResponse.suggestions && suggestionResponse.suggestions.length > 0) {
                addResult('✅ Smart Suggestions: SUCCESS', 'success', { count: suggestionResponse.suggestions.length });
            } else {
                throw new Error('No suggestions returned');
            }
        } catch (error) {
            addResult('❌ Smart Suggestions: FAILED - ' + error.message, 'error');
        }

        setRunning(false);
        toast.success('All tests completed! Check console for details.');
    };

    const addResult = (message, status, data = null) => {
        const result = { message, status, data, timestamp: new Date().toISOString() };
        console.log(result);
        setTestResults(prev => [...prev, result]);
    };

    return (
        <div className="min-h-screen bg-[#0a0e17] p-6">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-[#0f1419] border-blue-900/20 mb-6">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            🧪 AI Assistant Function Tests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            onClick={runTests} 
                            disabled={running}
                            className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] h-12"
                        >
                            {running ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Running Tests...
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="w-5 h-5 mr-2" />
                                    Run All Tests
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-3">
                    {testResults.map((result, idx) => (
                        <Card key={idx} className="bg-[#0f1419] border-blue-900/20">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    {result.status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />}
                                    {result.status === 'error' && <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />}
                                    {result.status === 'pending' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin mt-0.5 shrink-0" />}
                                    
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium mb-1">{result.message}</p>
                                        {result.data && (
                                            <pre className="text-xs text-blue-400 bg-black/30 p-2 rounded mt-2 overflow-x-auto">
                                                {JSON.stringify(result.data, null, 2)}
                                            </pre>
                                        )}
                                        <p className="text-xs text-slate-500 mt-1">{new Date(result.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                    
                                    <Badge className={
                                        result.status === 'success' ? 'bg-green-600' :
                                        result.status === 'error' ? 'bg-red-600' :
                                        'bg-blue-600'
                                    }>
                                        {result.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {testResults.length === 0 && !running && (
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardContent className="p-12 text-center">
                            <p className="text-blue-400">Click "Run All Tests" to start testing AI functions</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}