import React, { useState } from 'react';
import { httpClient } from '@/api/httpClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Play, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AutomationTester({ ruleId, triggerType }) {
    const [testData, setTestData] = useState('{}');
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState(null);

    const handleTest = async () => {
        setTesting(true);
        setResult(null);
        
        try {
            const data = JSON.parse(testData);
            const response = await httpClient.functions.invoke('executeAutomations', {
                trigger_type: triggerType,
                trigger_data: data
            });
            
            setResult(response.data);
            toast.success('Automation test completed');
        } catch (error) {
            setResult({ error: error.message });
            toast.error('Test failed: ' + error.message);
        } finally {
            setTesting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Test Automation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium mb-2 block">
                        Test Data (JSON)
                    </label>
                    <Textarea
                        value={testData}
                        onChange={(e) => setTestData(e.target.value)}
                        placeholder='{"submission_id": "123", "title": "Test", ...}'
                        rows={4}
                        className="font-mono text-sm"
                    />
                </div>

                <Button
                    onClick={handleTest}
                    disabled={testing}
                    className="w-full"
                >
                    {testing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Testing...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-2" />
                            Run Test
                        </>
                    )}
                </Button>

                {result && (
                    <div className="mt-4 p-4 bg-blue-950/40 rounded-lg border">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                            {result.error ? (
                                <>
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    Test Failed
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    Test Results
                                </>
                            )}
                        </h4>
                        
                        {result.error ? (
                            <p className="text-sm text-red-600">{result.error}</p>
                        ) : (
                            <div className="space-y-2">
                                {result.executed_actions?.length > 0 ? (
                                    result.executed_actions.map((action, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                            <span>{action.rule}: {action.action}</span>
                                            {action.success ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                                    Success
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-red-50 text-red-700">
                                                    Failed
                                                </Badge>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-blue-300">No actions executed</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}