import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from 'lucide-react';
import DynamicField from '@/components/forms/DynamicField';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function PublicSubmission() {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const type = urlParams.get('type');
    const id = urlParams.get('id');
    
    const [responses, setResponses] = useState({});
    const [completedItems, setCompletedItems] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    
    const { data: template, isLoading } = useQuery({
        queryKey: ['public-template', type, id],
        queryFn: async () => {
            if (type === 'form') {
                return await base44.asServiceRole.entities.FormTemplate.filter({ id }).then(r => r[0]);
            } else {
                return await base44.asServiceRole.entities.ChecklistTemplate.filter({ id }).then(r => r[0]);
            }
        },
        enabled: !!id && !!type
    });
    
    const submitMutation = useMutation({
        mutationFn: async (data) => {
            if (type === 'form') {
                const submission = await base44.asServiceRole.entities.FormSubmission.create({
                    form_template_id: id,
                    form_title: template.title,
                    responses: data.responses,
                    submitted_by_name: data.submitterName,
                    status: 'submitted'
                });
                
                // Trigger automations
                await base44.asServiceRole.functions.invoke('executeAutomations', {
                    trigger_type: 'form_submitted',
                    trigger_config: { template_id: id },
                    data: submission
                });
                
                return submission;
            } else {
                const submission = await base44.asServiceRole.entities.ChecklistSubmission.create({
                    checklist_template_id: id,
                    checklist_title: template.title,
                    completed_items: data.completedItems,
                    submitted_by_name: data.submitterName,
                    completion_percentage: Math.round((data.completedItems.length / template.items.length) * 100),
                    status: 'completed'
                });
                
                // Trigger automations
                await base44.asServiceRole.functions.invoke('executeAutomations', {
                    trigger_type: 'checklist_completed',
                    trigger_config: { template_id: id },
                    data: submission
                });
                
                return submission;
            }
        },
        onSuccess: () => {
            setSubmitted(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            toast.success('Submission received!');
        },
        onError: (error) => {
            toast.error('Submission failed: ' + error.message);
        }
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const submitterName = responses['_submitter_name'] || 'Anonymous';
        
        if (type === 'form') {
            const requiredFields = template.fields?.filter(f => f.required) || [];
            const missingFields = requiredFields.filter(f => !responses[f.id]);
            
            if (missingFields.length > 0) {
                toast.error('Please fill in all required fields');
                return;
            }
            
            submitMutation.mutate({ responses, submitterName });
        } else {
            submitMutation.mutate({ completedItems, submitterName });
        }
    };
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-950 to-purple-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }
    
    if (!template) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-950 to-purple-950 flex items-center justify-center p-4">
                <Card className="max-w-md bg-[#0f1419] border-red-900/30">
                    <CardContent className="pt-6 text-center">
                        <p className="text-red-400">Template not found or no longer available</p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-950 to-purple-950 flex items-center justify-center p-4">
                <Card className="max-w-md bg-[#0f1419] border-green-900/30">
                    <CardContent className="pt-6 text-center space-y-4">
                        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
                        <h2 className="text-2xl font-bold text-white">Thank You!</h2>
                        <p className="text-blue-300">Your submission has been received successfully.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 to-purple-950 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <Card className="bg-[#0f1419] border-blue-900/30">
                    <CardHeader>
                        <div className="text-center mb-2">
                            <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6954526c42ec916a050b905d/d38d72306_file_00000000ab1471f5a410df212e51129f1.png"
                                alt="InForm Me"
                                className="h-12 mx-auto mb-4"
                            />
                        </div>
                        <CardTitle className="text-white text-2xl">{template.title}</CardTitle>
                        {template.description && (
                            <p className="text-blue-300 mt-2">{template.description}</p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Submitter Name */}
                            <div>
                                <label className="text-blue-300 text-sm font-medium mb-1 block">
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={responses['_submitter_name'] || ''}
                                    onChange={(e) => setResponses({...responses, _submitter_name: e.target.value})}
                                    className="w-full bg-[#0a0e17] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
                                    placeholder="Enter your name"
                                />
                            </div>
                            
                            {type === 'form' ? (
                                template.fields?.map((field) => (
                                    <DynamicField
                                        key={field.id}
                                        field={field}
                                        value={responses[field.id]}
                                        onChange={(value) => setResponses({...responses, [field.id]: value})}
                                    />
                                ))
                            ) : (
                                <div className="space-y-3">
                                    {template.items?.map((item) => (
                                        <label key={item.id} className="flex items-start gap-3 p-3 bg-[#0a0e17] rounded-lg cursor-pointer hover:bg-blue-950/20">
                                            <input
                                                type="checkbox"
                                                checked={completedItems.includes(item.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setCompletedItems([...completedItems, item.id]);
                                                    } else {
                                                        setCompletedItems(completedItems.filter(id => id !== item.id));
                                                    }
                                                }}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <p className="text-white">{item.text}</p>
                                                {item.required && <span className="text-red-400 text-xs">* Required</span>}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                            
                            <Button
                                type="submit"
                                disabled={submitMutation.isPending}
                                className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] hover:opacity-90 text-black text-lg py-6"
                            >
                                {submitMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                
                <p className="text-center text-blue-400/60 text-sm mt-4">
                    Powered by InForm Me - Operational Reality Advisors
                </p>
            </div>
        </div>
    );
}