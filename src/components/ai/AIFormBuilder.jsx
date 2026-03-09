import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIFormBuilder() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [prompt, setPrompt] = useState('');
    const [generatedForm, setGeneratedForm] = useState(null);
    
    const examples = [
        "Create a contact form with name, email, subject, message, and file upload",
        "Build a customer feedback form with rating scale, satisfaction level, and comments",
        "Make an event registration form with attendee details, dietary preferences, and emergency contact",
        "Design a job application form with resume upload, cover letter, and work experience",
        "Create an incident report form with date, location, description, severity, and photo upload"
    ];
    
    const generateMutation = useMutation({
        mutationFn: async (userPrompt) => {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are a form builder expert. Generate a complete form structure based on this request:

"${userPrompt}"

Create a form with:
- Appropriate field types (text, textarea, number, date, select, checkbox, signature, photo)
- Validation rules (required, patterns, etc.)
- Logical field ordering
- Helpful placeholders and labels
- Default values where appropriate

Return a complete form configuration.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        fields: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    label: { type: "string" },
                                    type: { 
                                        type: "string",
                                        enum: ["text", "textarea", "number", "date", "select", "checkbox", "signature", "photo"]
                                    },
                                    required: { type: "boolean" },
                                    placeholder: { type: "string" },
                                    options: {
                                        type: "array",
                                        items: { type: "string" }
                                    }
                                }
                            }
                        },
                        suggested_automations: {
                            type: "array",
                            items: { type: "string" }
                        }
                    }
                }
            });
            
            return response;
        },
        onSuccess: (data) => {
            setGeneratedForm(data);
            toast.success('Form generated successfully!');
        },
        onError: (error) => {
            toast.error('Generation failed: ' + error.message);
        }
    });
    
    const createFormMutation = useMutation({
        mutationFn: async () => {
            const form = await base44.entities.FormTemplate.create({
                title: generatedForm.title,
                description: generatedForm.description,
                fields: generatedForm.fields,
                status: 'active'
            });
            
            return form;
        },
        onSuccess: (form) => {
            queryClient.invalidateQueries(['forms']);
            toast.success('Form created!');
            setTimeout(() => {
                navigate(createPageUrl(`EditForm?id=${form.id}`));
            }, 1000);
        }
    });
    
    const fieldTypeIcons = {
        text: '📝',
        textarea: '📄',
        number: '🔢',
        date: '📅',
        select: '📋',
        checkbox: '☑️',
        signature: '✍️',
        photo: '📷'
    };
    
    return (
        <Card className="bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-purple-900/30">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-purple-400" />
                    AI Form Builder
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!generatedForm ? (
                    <>
                        <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the form you need... (e.g., 'Create a customer feedback form with rating, comments, and contact info')"
                            rows={4}
                            className="bg-[#0a0e17] border-blue-900/30 text-white placeholder:text-blue-400/50"
                        />
                        
                        <Button
                            onClick={() => generateMutation.mutate(prompt)}
                            disabled={generateMutation.isPending || !prompt.trim()}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                        >
                            {generateMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating Form...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate Form
                                </>
                            )}
                        </Button>
                        
                        <div className="space-y-2">
                            <p className="text-sm text-blue-400">Example prompts:</p>
                            {examples.map((example, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setPrompt(example)}
                                    className="w-full text-left p-2 rounded text-xs text-blue-300 bg-[#0a0e17] border border-blue-900/20 hover:border-purple-600/50 transition-colors"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-[#0a0e17] p-4 rounded-lg border border-green-900/30">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                <h3 className="text-lg font-semibold text-white">{generatedForm.title}</h3>
                            </div>
                            <p className="text-sm text-blue-300 mb-3">{generatedForm.description}</p>
                            
                            <div className="space-y-2">
                                <p className="text-xs text-blue-400 font-semibold">FIELDS ({generatedForm.fields.length})</p>
                                {generatedForm.fields.map((field, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 bg-blue-950/20 rounded">
                                        <span className="text-lg">{fieldTypeIcons[field.type]}</span>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium">{field.label}</p>
                                            <div className="flex gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {field.type}
                                                </Badge>
                                                {field.required && (
                                                    <Badge className="bg-red-600 text-xs">Required</Badge>
                                                )}
                                                {field.options?.length > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {field.options.length} options
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {generatedForm.suggested_automations?.length > 0 && (
                            <div className="bg-purple-950/20 p-3 rounded-lg border border-purple-900/30">
                                <p className="text-xs text-purple-300 font-semibold mb-2">SUGGESTED AUTOMATIONS</p>
                                <ul className="space-y-1">
                                    {generatedForm.suggested_automations.map((auto, idx) => (
                                        <li key={idx} className="text-sm text-purple-300/80 pl-3">💡 {auto}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setGeneratedForm(null)}
                                variant="outline"
                                className="flex-1 border-blue-600 text-blue-300"
                            >
                                Generate Another
                            </Button>
                            <Button
                                onClick={() => createFormMutation.mutate()}
                                disabled={createFormMutation.isPending}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                            >
                                {createFormMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Form'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}