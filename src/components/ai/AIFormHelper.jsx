import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2, Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';

export function SuggestFieldsButton({ formTitle, onFieldsSuggested }) {
    const [loading, setLoading] = useState(false);
    
    const handleSuggest = async () => {
        if (!formTitle?.trim()) {
            toast.error('Please enter a form title first');
            return;
        }
        
        setLoading(true);
        try {
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Based on the form title "${formTitle}", suggest 5-8 relevant form fields that would be commonly needed. For each field, provide: label, type (text, textarea, number, date, select, checkbox), a helpful placeholder, and whether it should be required. Return as JSON array.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        fields: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    label: { type: "string" },
                                    type: { type: "string", enum: ["text", "textarea", "number", "date", "select", "checkbox"] },
                                    placeholder: { type: "string" },
                                    required: { type: "boolean" },
                                    options: { type: "array", items: { type: "string" } }
                                }
                            }
                        }
                    }
                }
            });
            
            const suggestedFields = result.fields.map((f, i) => ({
                id: `field_${Date.now()}_${i}`,
                label: f.label,
                type: f.type,
                placeholder: f.placeholder || '',
                required: f.required || false,
                options: f.options || []
            }));
            
            onFieldsSuggested(suggestedFields);
            toast.success(`Added ${suggestedFields.length} suggested fields`);
        } catch (error) {
            toast.error('Failed to generate field suggestions');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Button
            onClick={handleSuggest}
            disabled={loading || !formTitle?.trim()}
            variant="outline"
            size="sm"
            className="gap-2"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Sparkles className="w-4 h-4" />
            )}
            AI Suggest Fields
        </Button>
    );
}

export function AutoCategorizeButton({ formTitle, formDescription, categories, onCategorySelected }) {
    const [loading, setLoading] = useState(false);
    
    const handleCategorize = async () => {
        if (!formTitle?.trim() || categories.length === 0) {
            toast.error('Please enter a form title and ensure categories exist');
            return;
        }
        
        setLoading(true);
        try {
            const categoryNames = categories.map(c => c.name).join(', ');
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Based on the form titled "${formTitle}" ${formDescription ? `with description: "${formDescription}"` : ''}, which of these categories is most appropriate: ${categoryNames}. Return only the exact category name that best fits.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        category: { type: "string" }
                    }
                }
            });
            
            const matchedCategory = categories.find(
                c => c.name.toLowerCase() === result.category.toLowerCase()
            );
            
            if (matchedCategory) {
                onCategorySelected(matchedCategory.id);
                toast.success(`Categorized as: ${matchedCategory.name}`);
            } else {
                toast.error('Could not match to existing category');
            }
        } catch (error) {
            toast.error('Failed to auto-categorize');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Button
            onClick={handleCategorize}
            disabled={loading || !formTitle?.trim() || categories.length === 0}
            variant="ghost"
            size="sm"
            className="gap-2"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Tag className="w-4 h-4" />
            )}
            Auto-Categorize
        </Button>
    );
}

export function GenerateExamplesButton({ form, onExamplesGenerated }) {
    const [loading, setLoading] = useState(false);
    
    const handleGenerate = async () => {
        if (!form.title?.trim() || form.fields.length === 0) {
            toast.error('Please add form title and fields first');
            return;
        }
        
        setLoading(true);
        try {
            const fieldDescriptions = form.fields.map(f => 
                `${f.label} (${f.type}${f.required ? ', required' : ''})${f.options?.length ? ` - options: ${f.options.join(', ')}` : ''}`
            ).join('\n');
            
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate 3 realistic example submissions for a form titled "${form.title}". The form has these fields:\n${fieldDescriptions}\n\nFor each submission, provide realistic values that match the field types and requirements. For select fields, use only the provided options. For checkboxes, use true/false.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        submissions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    submitted_by_name: { type: "string" },
                                    location: { type: "string" },
                                    responses: { type: "object" }
                                }
                            }
                        }
                    }
                }
            });
            
            const submissions = result.submissions.map(sub => ({
                form_template_id: 'demo',
                form_title: form.title,
                submitted_by_name: sub.submitted_by_name,
                location: sub.location,
                responses: sub.responses,
                status: 'submitted'
            }));
            
            onExamplesGenerated(submissions);
            toast.success(`Generated ${submissions.length} example submissions`);
        } catch (error) {
            toast.error('Failed to generate examples');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Button
            onClick={handleGenerate}
            disabled={loading || !form.title?.trim() || form.fields.length === 0}
            variant="outline"
            size="sm"
            className="gap-2"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Wand2 className="w-4 h-4" />
            )}
            Generate Examples
        </Button>
    );
}