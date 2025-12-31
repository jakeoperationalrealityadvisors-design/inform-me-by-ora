import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const WORKFLOW_TEMPLATES = [
    {
        name: "Lead Assignment",
        description: "Automatically assign new form submissions to team members based on priority or workload",
        prompt: "Create an automation that assigns new form submissions to available team members. High priority submissions should go to managers, while normal priority goes to regular team members in a round-robin fashion."
    },
    {
        name: "Customer Follow-up",
        description: "Send follow-up reminders after form submissions or task completions",
        prompt: "Create an automation that sends a follow-up email 3 days after a form is submitted, and creates a task for the assigned person to check in with the customer."
    },
    {
        name: "Task Escalation",
        description: "Escalate overdue tasks to managers automatically",
        prompt: "Create an automation that detects when a task is overdue by 2 days and automatically notifies the manager, increases the priority to urgent, and adds a comment about the escalation."
    },
    {
        name: "Quality Inspection",
        description: "Require manager approval for high-risk submissions",
        prompt: "Create an automation that detects when a form submission has a high-risk flag or critical category, then assigns it to a manager for review and sends an urgent notification."
    },
    {
        name: "Onboarding Workflow",
        description: "Create a sequence of tasks when a new user joins",
        prompt: "Create an automation that triggers when a new user is invited, creates a welcome task for them, schedules a follow-up meeting in 7 days, and sends them a welcome email with getting started information."
    },
    {
        name: "Maintenance Schedule",
        description: "Automatically create recurring inspection tasks",
        prompt: "Create an automation that creates a maintenance inspection task every 30 days, assigns it to the facilities team, and sends a reminder notification 3 days before it's due."
    }
];

export default function WorkflowGenerator({ onGenerate }) {
    const [customPrompt, setCustomPrompt] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    
    const generateMutation = useMutation({
        mutationFn: async (prompt) => {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are an automation expert. Generate a complete automation rule configuration based on this request: "${prompt}"

Return a JSON object with this exact structure:
{
    "name": "Clear, descriptive name",
    "description": "What this automation does",
    "trigger_type": "one of: form_submitted, checklist_completed, task_created, task_completed, task_overdue, document_uploaded, status_changed",
    "trigger_config": {
        "template_id": null (or specific ID if mentioned)
    },
    "condition_logic": {
        "operator": "AND",
        "groups": [
            {
                "operator": "AND",
                "conditions": [
                    {
                        "field": "priority",
                        "operator": "equals",
                        "value": "high"
                    }
                ]
            }
        ]
    },
    "actions": [
        {
            "type": "one of: assign_task, send_notification, send_email, create_followup, create_task, update_status, add_comment",
            "config": {
                (appropriate config for the action type)
            },
            "delay_minutes": 0 (if delayed)
        }
    ]
}

Available action types and their config:
- assign_task: { assignee_email, priority }
- send_notification: { title, message, recipient_email }
- send_email: { recipient_email, subject, body }
- create_followup: { title, days_ahead, assignee_email }
- create_task: { title, description, assignee_email, priority }
- update_status: { new_status }
- add_comment: { comment_text }

Available condition operators: equals, not_equals, contains, greater_than, less_than, is_empty, is_not_empty

Make the automation practical and complete. Include specific values and realistic configurations.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        trigger_type: { type: "string" },
                        trigger_config: { type: "object" },
                        condition_logic: { type: "object" },
                        actions: { type: "array" }
                    },
                    required: ["name", "trigger_type", "actions"]
                }
            });
            
            return response;
        },
        onSuccess: (data) => {
            toast.success('Automation rule generated!');
            onGenerate(data);
        },
        onError: (error) => {
            toast.error('Failed to generate automation: ' + error.message);
        }
    });
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Workflow Generator
                </CardTitle>
                <p className="text-sm text-slate-600">
                    Describe what you want to automate, or choose a template to get started
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Quick Templates */}
                <div>
                    <p className="text-sm font-medium mb-3">Popular Workflows</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {WORKFLOW_TEMPLATES.map((template, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setSelectedTemplate(template);
                                    generateMutation.mutate(template.prompt);
                                }}
                                disabled={generateMutation.isPending}
                                className={`text-left p-3 rounded-lg border-2 transition-all ${
                                    selectedTemplate?.name === template.name
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-slate-200 hover:border-purple-300 bg-white'
                                }`}
                            >
                                <div className="flex items-start gap-2">
                                    <Zap className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm">{template.name}</p>
                                        <p className="text-xs text-slate-600 line-clamp-2">{template.description}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Custom Prompt */}
                <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Or describe your own workflow</p>
                    <Textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Example: When a form is submitted with priority 'urgent', assign it to John and send an email to the manager..."
                        rows={4}
                        className="mb-3"
                    />
                    <Button 
                        onClick={() => generateMutation.mutate(customPrompt)}
                        disabled={!customPrompt || generateMutation.isPending}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                        {generateMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating Automation...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Automation
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
                
                {generateMutation.isPending && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">AI is analyzing your request...</p>
                                <p className="text-xs text-blue-700">Creating trigger, conditions, and actions</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}