import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, FileText, CheckSquare, Workflow, ArrowRight, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIAssistant({ 
    document = null, 
    context = null,
    mode = 'full' // 'full', 'workflow', 'summarize', 'suggest'
}) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(mode === 'full' ? 'workflow' : mode);
    const [workflowPrompt, setWorkflowPrompt] = useState('');
    const [workflowResult, setWorkflowResult] = useState(null);
    const [summary, setSummary] = useState(null);
    const [suggestions, setSuggestions] = useState(null);
    const [copied, setCopied] = useState(false);

    const { data: forms = [] } = useQuery({
        queryKey: ['forms'],
        queryFn: () => base44.entities.FormTemplate.filter({ status: 'active' })
    });

    const { data: checklists = [] } = useQuery({
        queryKey: ['checklists'],
        queryFn: () => base44.entities.ChecklistTemplate.filter({ status: 'active' })
    });

    // Workflow Generation
    const workflowMutation = useMutation({
        mutationFn: async (prompt) => {
            if (!prompt || prompt.trim().length < 10) {
                throw new Error('Please provide a more detailed description (at least 10 characters)');
            }

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are a workflow automation expert. Based on this description, create a detailed workflow automation.

User Request: ${prompt}

Generate a workflow with:
- name: Clear, concise workflow name (max 50 chars)
- description: What the workflow does (1-2 sentences)
- trigger_type: One of [form_submitted, checklist_completed, task_created, task_completed, document_uploaded, manual_trigger]
- trigger_config: Configuration object for the trigger (can be empty {})
- actions: Array of 1-5 actions with type and config
  Action types: [assign_task, send_notification, send_email, create_followup, create_task, update_status]
  Each action must have type (string) and config (object with relevant fields)

Return ONLY valid JSON matching AutomationRule schema. Ensure all required fields are present.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        trigger_type: { type: "string" },
                        trigger_config: { 
                            type: "object",
                            properties: {}
                        },
                        actions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    config: { type: "object" }
                                },
                                required: ["type", "config"]
                            }
                        }
                    },
                    required: ["name", "description", "trigger_type", "actions"]
                }
            });
            
            // Validate response
            if (!response.name || !response.description || !response.trigger_type || !response.actions) {
                throw new Error('Invalid workflow data received');
            }
            
            console.log('✅ Workflow Generation Test:', {
                input: prompt,
                output: response,
                status: 'SUCCESS'
            });
            
            return response;
        },
        onSuccess: (data) => {
            setWorkflowResult(data);
            toast.success('Workflow generated successfully!');
        },
        onError: (error) => {
            console.error('❌ Workflow Generation Error:', error);
            toast.error(error.message || 'Failed to generate workflow');
        }
    });

    // Document Summarization
    const summarizeMutation = useMutation({
        mutationFn: async () => {
            if (!document?.file_url) {
                throw new Error('No document provided. Please select a document first.');
            }

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Analyze and summarize this document in a clear, structured format:

📋 MAIN TOPIC/PURPOSE:
[Brief overview]

🔑 KEY POINTS:
• [Point 1]
• [Point 2]
• [Point 3]

✅ ACTION ITEMS:
[List any tasks or actions needed]

📅 IMPORTANT DATES/NUMBERS:
[Any critical dates, deadlines, or metrics]

💡 RECOMMENDATION:
[Your assessment or conclusion]

Keep it concise (max 300 words) but comprehensive.`,
                file_urls: [document.file_url]
            });
            
            console.log('✅ Document Summarization Test:', {
                document: document.title,
                fileUrl: document.file_url,
                outputLength: response?.length,
                status: 'SUCCESS'
            });
            
            return response;
        },
        onSuccess: (data) => {
            setSummary(data);
            toast.success('Document summarized successfully!');
        },
        onError: (error) => {
            console.error('❌ Document Summarization Error:', error);
            toast.error(error.message || 'Failed to summarize document');
        }
    });

    // Smart Suggestions
    const suggestMutation = useMutation({
        mutationFn: async () => {
            const contextText = context || document?.title || 'General workflow';
            
            if (forms.length === 0 && checklists.length === 0) {
                throw new Error('No forms or checklists available yet. Create some first!');
            }
            
            const formsList = forms.slice(0, 10).map(f => `"${f.title}" - ${f.description || 'No description'}`).join('\n');
            const checklistsList = checklists.slice(0, 10).map(c => `"${c.title}" - ${c.description || 'No description'}`).join('\n');
            
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are an intelligent assistant helping users find the right forms and checklists.

CONTEXT: "${contextText}"

AVAILABLE FORMS:
${formsList || 'None'}

AVAILABLE CHECKLISTS:
${checklistsList || 'None'}

Task: Suggest the top 3 most relevant forms or checklists for this context.

Requirements:
- Match the exact title from the lists above
- Provide clear, actionable reasoning
- Focus on practical use cases
- Return ONLY the 3 best matches

Return JSON with "suggestions" array containing exactly 3 items with:
- id: Exact title from lists above
- type: "form" or "checklist"
- relevance: One sentence why it matches (max 100 chars)
- use_case: Specific example of how to use it (max 120 chars)`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        suggestions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    type: { type: "string", enum: ["form", "checklist"] },
                                    relevance: { type: "string" },
                                    use_case: { type: "string" }
                                },
                                required: ["id", "type", "relevance", "use_case"]
                            },
                            minItems: 1,
                            maxItems: 3
                        }
                    },
                    required: ["suggestions"]
                }
            });
            
            console.log('✅ Smart Suggestions Test:', {
                context: contextText,
                formsCount: forms.length,
                checklistsCount: checklists.length,
                suggestionsCount: response.suggestions?.length,
                output: response.suggestions,
                status: 'SUCCESS'
            });
            
            return response.suggestions || [];
        },
        onSuccess: (data) => {
            setSuggestions(data);
            toast.success(`Found ${data.length} relevant suggestion${data.length !== 1 ? 's' : ''}!`);
        },
        onError: (error) => {
            console.error('❌ Smart Suggestions Error:', error);
            toast.error(error.message || 'Failed to generate suggestions');
        }
    });

    const handleCreateWorkflow = () => {
        if (!workflowResult) {
            toast.error('No workflow to create');
            return;
        }
        navigate(createPageUrl('EditAutomation'), {
            state: { draftData: workflowResult }
        });
        toast.success('Opening automation builder...');
    };

    const copyWorkflow = () => {
        navigator.clipboard.writeText(JSON.stringify(workflowResult, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copied to clipboard');
    };

    const findMatchingTemplate = (title, type) => {
        if (type === 'form') {
            return forms.find(f => f.title.toLowerCase().includes(title.toLowerCase()));
        }
        return checklists.find(c => c.title.toLowerCase().includes(title.toLowerCase()));
    };

    if (mode !== 'full') {
        // Single mode view
        return (
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#FF8C00]" />
                        AI Assistant
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {mode === 'workflow' && (
                        <div className="space-y-4">
                            <Textarea
                                value={workflowPrompt}
                                onChange={(e) => setWorkflowPrompt(e.target.value)}
                                placeholder="Describe the workflow you want to create... e.g., 'When a dairy inspection form is submitted, send an email notification to the farm manager'"
                                className="min-h-[100px] bg-black/30 border-blue-900/30 text-white"
                            />
                            <Button
                                onClick={() => workflowMutation.mutate(workflowPrompt)}
                                disabled={!workflowPrompt.trim() || workflowMutation.isPending}
                                className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                            >
                                {workflowMutation.isPending ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                                ) : (
                                    <><Sparkles className="w-4 h-4 mr-2" />Generate Workflow</>
                                )}
                            </Button>
                            {workflowResult && (
                                <WorkflowResult result={workflowResult} onCopy={copyWorkflow} onCreate={handleCreateWorkflow} copied={copied} />
                            )}
                        </div>
                    )}
                    {mode === 'summarize' && (
                        <div className="space-y-4">
                            <Button
                                onClick={() => summarizeMutation.mutate()}
                                disabled={!document?.file_url || summarizeMutation.isPending}
                                className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                            >
                                {summarizeMutation.isPending ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Summarizing...</>
                                ) : (
                                    <><FileText className="w-4 h-4 mr-2" />Summarize Document</>
                                )}
                            </Button>
                            {summary && (
                                <div className="bg-black/30 border border-blue-900/30 rounded-lg p-4">
                                    <pre className="text-sm text-blue-100 whitespace-pre-wrap">{summary}</pre>
                                </div>
                            )}
                        </div>
                    )}
                    {mode === 'suggest' && (
                        <div className="space-y-4">
                            <Button
                                onClick={() => suggestMutation.mutate()}
                                disabled={suggestMutation.isPending}
                                className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                            >
                                {suggestMutation.isPending ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Finding...</>
                                ) : (
                                    <><CheckSquare className="w-4 h-4 mr-2" />Get Suggestions</>
                                )}
                            </Button>
                            {suggestions && (
                                <SuggestionList 
                                    suggestions={suggestions} 
                                    findTemplate={findMatchingTemplate}
                                    navigate={navigate}
                                />
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Full tabbed view
    return (
        <Card className="bg-[#0f1419] border-blue-900/20">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#FF8C00]" />
                    AI Assistant
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 bg-black/30">
                        <TabsTrigger value="workflow">Workflows</TabsTrigger>
                        <TabsTrigger value="summarize">Summarize</TabsTrigger>
                        <TabsTrigger value="suggest">Suggestions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="workflow" className="space-y-4 mt-4">
                        <Textarea
                            value={workflowPrompt}
                            onChange={(e) => setWorkflowPrompt(e.target.value)}
                            placeholder="Describe the workflow you want to create... e.g., 'When a dairy inspection form is submitted, send an email notification to the farm manager'"
                            className="min-h-[120px] bg-black/30 border-blue-900/30 text-white"
                        />
                        <Button
                            onClick={() => workflowMutation.mutate(workflowPrompt)}
                            disabled={!workflowPrompt.trim() || workflowMutation.isPending}
                            className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                        >
                            {workflowMutation.isPending ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                            ) : (
                                <><Sparkles className="w-4 h-4 mr-2" />Generate Workflow</>
                            )}
                        </Button>
                        {workflowResult && (
                            <WorkflowResult result={workflowResult} onCopy={copyWorkflow} onCreate={handleCreateWorkflow} copied={copied} />
                        )}
                    </TabsContent>

                    <TabsContent value="summarize" className="space-y-4 mt-4">
                        <p className="text-sm text-blue-400">
                            {document ? `Ready to summarize: ${document.title}` : 'No document selected'}
                        </p>
                        <Button
                            onClick={() => summarizeMutation.mutate()}
                            disabled={!document?.file_url || summarizeMutation.isPending}
                            className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                        >
                            {summarizeMutation.isPending ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Summarizing...</>
                            ) : (
                                <><FileText className="w-4 h-4 mr-2" />Summarize Document</>
                            )}
                        </Button>
                        {summary && (
                            <div className="bg-black/30 border border-blue-900/30 rounded-lg p-4">
                                <pre className="text-sm text-blue-100 whitespace-pre-wrap">{summary}</pre>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="suggest" className="space-y-4 mt-4">
                        <p className="text-sm text-blue-400">
                            Get smart recommendations for forms and checklists
                        </p>
                        <Button
                            onClick={() => suggestMutation.mutate()}
                            disabled={suggestMutation.isPending}
                            className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                        >
                            {suggestMutation.isPending ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Finding...</>
                            ) : (
                                <><CheckSquare className="w-4 h-4 mr-2" />Get Suggestions</>
                            )}
                        </Button>
                        {suggestions && (
                            <SuggestionList 
                                suggestions={suggestions} 
                                findTemplate={findMatchingTemplate}
                                navigate={navigate}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function WorkflowResult({ result, onCopy, onCreate, copied }) {
    return (
        <div className="bg-black/30 border border-blue-900/30 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="font-semibold text-white">{result.name}</h4>
                    <p className="text-sm text-blue-400 mt-1">{result.description}</p>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onCopy}
                    className="text-blue-400"
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
            </div>
            <div className="space-y-2">
                <Badge className="bg-blue-600/20 text-blue-300">
                    Trigger: {result.trigger_type}
                </Badge>
                <div className="text-sm text-blue-300">
                    <div className="font-medium mb-1">Actions:</div>
                    {result.actions?.map((action, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-blue-400">
                            <ArrowRight className="w-3 h-3" />
                            {action.type}
                        </div>
                    ))}
                </div>
            </div>
            <Button
                onClick={onCreate}
                className="w-full bg-blue-600 hover:bg-blue-700"
            >
                <Workflow className="w-4 h-4 mr-2" />
                Create This Workflow
            </Button>
        </div>
    );
}

function SuggestionList({ suggestions, findTemplate, navigate }) {
    return (
        <div className="space-y-2">
            {suggestions?.map((suggestion, idx) => {
                const template = findTemplate(suggestion.id, suggestion.type);
                return (
                    <div key={idx} className="bg-black/30 border border-blue-900/30 rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    {suggestion.type === 'form' ? <FileText className="w-4 h-4 text-[#FF8C00]" /> : <CheckSquare className="w-4 h-4 text-[#FF8C00]" />}
                                    <h4 className="font-medium text-white text-sm">{suggestion.id}</h4>
                                </div>
                                <p className="text-xs text-blue-400 mt-1">{suggestion.relevance}</p>
                                <p className="text-xs text-blue-300 mt-1 italic">{suggestion.use_case}</p>
                            </div>
                            {template && (
                                <Button
                                    size="sm"
                                    onClick={() => navigate(createPageUrl(suggestion.type === 'form' ? 'FillForm' : 'FillChecklist') + `?id=${template.id}`)}
                                    className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
                                >
                                    Use
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}