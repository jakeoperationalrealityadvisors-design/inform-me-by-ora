import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle2, FileText, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function SampleDataGenerator() {
    const queryClient = useQueryClient();
    const [results, setResults] = useState(null);
    
    const generateMutation = useMutation({
        mutationFn: async (type) => {
            const response = await base44.functions.invoke('generateSampleData', { type });
            return response.data;
        },
        onSuccess: (data) => {
            setResults(data);
            queryClient.invalidateQueries(['form-submissions']);
            queryClient.invalidateQueries(['checklist-submissions']);
            toast.success(data.message);
        },
        onError: (error) => {
            toast.error('Failed to generate samples: ' + error.message);
        }
    });
    
    return (
        <Card className="bg-[#0f1419] border-blue-900/20">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    AI Sample Data Generator
                </CardTitle>
                <CardDescription className="text-blue-400">
                    Generate realistic sample submissions for all forms and checklists using AI
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={() => generateMutation.mutate('forms')}
                        disabled={generateMutation.isPending}
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                        {generateMutation.isPending && generateMutation.variables === 'forms' ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FileText className="w-4 h-4 mr-2" />
                                Generate Form Samples
                            </>
                        )}
                    </Button>
                    
                    <Button
                        onClick={() => generateMutation.mutate('checklists')}
                        disabled={generateMutation.isPending}
                        className="bg-gradient-to-r from-green-600 to-teal-600"
                    >
                        {generateMutation.isPending && generateMutation.variables === 'checklists' ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <CheckSquare className="w-4 h-4 mr-2" />
                                Generate Checklist Samples
                            </>
                        )}
                    </Button>
                </div>
                
                {results && (
                    <div className="mt-4 p-4 bg-[#0a0e17] rounded-lg border border-green-900/30">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <p className="text-sm font-medium text-green-300">{results.message}</p>
                        </div>
                        
                        {results.results && results.results.length > 0 && (
                            <div className="space-y-2">
                                {results.results.map((result, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-[#0f1419] rounded border border-blue-900/20">
                                        <div>
                                            <p className="text-sm text-white">{result.form || result.checklist}</p>
                                            {result.category && (
                                                <Badge variant="outline" className="text-xs mt-1">
                                                    {result.category}
                                                </Badge>
                                            )}
                                        </div>
                                        {result.completionRate && (
                                            <Badge className="bg-green-950/50 text-green-300">
                                                {result.completionRate}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                <div className="text-xs text-blue-400/70 bg-blue-950/20 p-3 rounded-lg">
                    <strong>Note:</strong> This will create one realistic sample submission for each active form and checklist template using AI-generated data appropriate for each field type and context.
                </div>
            </CardContent>
        </Card>
    );
}