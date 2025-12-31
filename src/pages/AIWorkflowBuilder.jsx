import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Sparkles, Loader2, Wand2, CheckCircle2, Edit, LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import RoleGuard from '@/components/auth/RoleGuard';

function AIWorkflowBuilderContent() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [prompt, setPrompt] = useState('');
    const [generatedWorkflow, setGeneratedWorkflow] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    
    const examples = [
        "When a form is submitted with priority 'high', immediately notify the manager and create a task",
        "If a checklist completion is below 80%, send a reminder email to the assigned user",
        "Auto-assign new form submissions to team members in a round-robin fashion based on workload",
        "When a task is overdue by 2 days, escalate it to the admin and change priority to urgent",
        "Create a follow-up event 7 days after form submission for customer check-in",
        "When project status changes to 'completed', update all linked documents and notify stakeholders",
        "If submission status changes to 'approved', update associated documents metadata and send confirmation email",
        "When a form is submitted with 'Support Request' category, automatically log it to Salesforce as a case"
    ];
    
    const generateMutation = useMutation({
        mutationFn: async (userPrompt) => {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are an automation workflow expert. Convert this natural language request into a structured automation rule:

"${userPrompt}"

Create a complete automation configuration with:
- Appropriate trigger type
- Conditional logic (if mentioned)
- Specific actions with proper configurations
- Realistic field values and parameters

Be specific and practical. Use actual trigger types like 'form_submitted', 'task_overdue', etc.
For actions, use types like 'assign_task', 'send_notification', 'send_email', 'create_task', 'create_followup', 'update_status', 'update_documents', 'add_comment', 'log_to_salesforce'.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        trigger_type: { 
                            type: "string",
                            enum: ["form_submitted", "checklist_completed", "task_created", "task_completed", "task_overdue", "task_due_soon", "document_uploaded", "status_changed"]
                        },
                        trigger_config: {
                            type: "object",
                            properties: {
                                template_id: { type: "string" },
                                days_before_due: { type: "number" },
                                priority: { type: "string" }
                            }
                        },
                        condition_logic: {
                            type: "object",
                            properties: {
                                operator: { type: "string", enum: ["AND", "OR"] },
                                groups: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            operator: { type: "string", enum: ["AND", "OR"] },
                                            conditions: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        field: { type: "string" },
                                                        operator: { type: "string" },
                                                        value: { type: "string" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        actions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    config: { type: "object" },
                                    delay_minutes: { type: "number" }
                                }
                            }
                        },
                        explanation: { type: "string" },
                        benefits: { type: "array", items: { type: "string" } }
                    }
                }
            });
            
            return response;
        },
        onSuccess: (data) => {
            setGeneratedWorkflow(data);
            toast.success('Workflow generated successfully!');
        },
        onError: (error) => {
            toast.error('Failed to generate workflow: ' + error.message);
        }
    });
    
    const createAutomationMutation = useMutation({
        mutationFn: async () => {
            const automation = await base44.entities.AutomationRule.create({
                name: generatedWorkflow.name,
                description: generatedWorkflow.description,
                trigger_type: generatedWorkflow.trigger_type,
                trigger_config: generatedWorkflow.trigger_config || {},
                condition_logic: generatedWorkflow.condition_logic || { operator: 'AND', groups: [] },
                actions: generatedWorkflow.actions,
                enabled: false
            });
            
            // Create initial version
            await base44.entities.AutomationRuleVersion.create({
                rule_id: automation.id,
                version_number: 1,
                name: automation.name,
                description: automation.description,
                trigger_type: automation.trigger_type,
                trigger_config: automation.trigger_config,
                condition_logic: automation.condition_logic,
                actions: automation.actions,
                change_notes: 'AI-generated automation',
                is_active: true
            });
            
            return automation;
        },
        onSuccess: (automation) => {
            queryClient.invalidateQueries(['automation-rules']);
            toast.success('Automation created! Redirecting to editor...');
            setTimeout(() => {
                navigate(createPageUrl(`EditAutomation?id=${automation.id}`));
            }, 1500);
        }
    });
    
    const handleGenerate = () => {
        if (!prompt.trim()) {
            toast.error('Please describe your workflow');
            return;
        }
        generateMutation.mutate(prompt);
    };
    
    const actionLabels = {
        assign_task: 'Assign Submission',
        create_task: 'Create Task',
        send_notification: 'Send Notification',
        send_email: 'Send Email',
        create_followup: 'Create Follow-up',
        update_status: 'Update Status',
        add_comment: 'Add Comment',
        update_documents: 'Update Linked Documents',
        log_to_salesforce: 'Log to Salesforce'
    };
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('ManageAutomations')}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Wand2 className="w-6 h-6 text-purple-400" />
                                AI Workflow Builder
                            </h1>
                            <p className="text-sm text-blue-400">Describe your workflow in plain English</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                <Card className="bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-purple-900/30">
                    <CardHeader>
                        <CardTitle className="text-white">Describe Your Workflow</CardTitle>
                        <CardDescription className="text-blue-400">
                            Tell us what you want to automate, and AI will create the workflow for you
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Example: When a form is submitted with priority 'high', notify the manager immediately and create a task..."
                            rows={5}
                            className="bg-[#0a0e17] border-blue-900/30 text-white placeholder:text-blue-400/50"
                        />
                        
                        <Button
                            onClick={handleGenerate}
                            disabled={generateMutation.isPending || !prompt.trim()}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                            size="lg"
                        >
                            {generateMutation.isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating Workflow...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Generate Workflow
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
                
                {!generatedWorkflow && (
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white text-lg">Example Workflows</CardTitle>
                                <div className="flex gap-1 bg-[#0a0e17] rounded-lg border border-blue-900/30 p-1">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded transition-colors ${
                                            viewMode === 'list' 
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                                                : 'text-blue-400/70 hover:bg-blue-900/20'
                                        }`}
                                    >
                                        <LayoutList className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded transition-colors ${
                                            viewMode === 'grid' 
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                                                : 'text-blue-400/70 hover:bg-blue-900/20'
                                        }`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-2"}>
                            {examples.map((example, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setPrompt(example)}
                                    className="w-full text-left p-3 rounded-lg bg-[#0a0e17] border border-blue-900/20 hover:border-purple-600/50 transition-colors"
                                >
                                    <p className="text-sm text-blue-300">{example}</p>
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                )}
                
                {generatedWorkflow && (
                    <Card className="bg-[#0f1419] border-green-900/30">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        Generated Workflow
                                    </CardTitle>
                                    <CardDescription className="text-blue-400 mt-2">
                                        Review the automation and create it
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                                <h3 className="text-lg font-semibold text-white mb-2">{generatedWorkflow.name}</h3>
                                <p className="text-sm text-blue-300 mb-4">{generatedWorkflow.description}</p>
                                
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-blue-400 mb-1">TRIGGER</p>
                                        <Badge className="bg-blue-600">{generatedWorkflow.trigger_type.replace(/_/g, ' ')}</Badge>
                                    </div>
                                    
                                    {generatedWorkflow.condition_logic?.groups?.length > 0 && (
                                        <div>
                                            <p className="text-xs text-blue-400 mb-1">CONDITIONS</p>
                                            <Badge variant="outline" className="text-orange-400 border-orange-600">
                                                {generatedWorkflow.condition_logic.groups.reduce((sum, g) => sum + (g.conditions?.length || 0), 0)} conditions
                                            </Badge>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <p className="text-xs text-blue-400 mb-1">ACTIONS</p>
                                        <div className="flex flex-wrap gap-2">
                                            {generatedWorkflow.actions.map((action, idx) => (
                                                <Badge key={idx} className="bg-green-600">
                                                    {actionLabels[action.type] || action.type}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-purple-950/30 p-4 rounded-lg border border-purple-900/30">
                                <p className="text-sm text-purple-300 mb-2">
                                    <strong>How it works:</strong> {generatedWorkflow.explanation}
                                </p>
                                {generatedWorkflow.benefits?.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs text-purple-400 mb-1">BENEFITS:</p>
                                        <ul className="space-y-1">
                                            {generatedWorkflow.benefits.map((benefit, idx) => (
                                                <li key={idx} className="text-sm text-purple-300 pl-3">✓ {benefit}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setGeneratedWorkflow(null)}
                                    variant="outline"
                                    className="flex-1 border-blue-600 text-blue-300"
                                >
                                    Generate Another
                                </Button>
                                <Button
                                    onClick={() => createAutomationMutation.mutate()}
                                    disabled={createAutomationMutation.isPending}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                                >
                                    {createAutomationMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="w-4 h-4 mr-2" />
                                            Create & Edit
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default function AIWorkflowBuilder() {
    return (
        <RoleGuard requiredPermission="automations.create">
            <AIWorkflowBuilderContent />
        </RoleGuard>
    );
}