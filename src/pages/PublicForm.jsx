import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PublicForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const formId = urlParams.get('id');
    const [responses, setResponses] = useState({});
    const [submitted, setSubmitted] = useState(false);
    
    const { data: form, isLoading } = useQuery({
        queryKey: ['public-form', formId],
        queryFn: async () => {
            const forms = await httpClient.entities.FormTemplate.filter({ id: formId });
            return forms[0];
        },
        enabled: !!formId
    });
    
    const submitMutation = useMutation({
        mutationFn: async (data) => {
            return await httpClient.entities.FormSubmission.create(data);
        },
        onSuccess: () => {
            setSubmitted(true);
            toast.success('Form submitted successfully!');
        },
        onError: (error) => {
            toast.error('Submission failed: ' + error.message);
        }
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate required fields
        const missingFields = form.fields
            .filter(f => f.required && !responses[f.id])
            .map(f => f.label);
            
        if (missingFields.length > 0) {
            toast.error(`Please fill required fields: ${missingFields.join(', ')}`);
            return;
        }
        
        submitMutation.mutate({
            form_template_id: formId,
            form_title: form.title,
            responses: responses,
            submitted_by_name: responses._submitter_name || 'Anonymous',
            status: 'submitted'
        });
    };
    
    const renderField = (field) => {
        switch (field.type) {
            case 'text':
            case 'number':
                return (
                    <Input
                        type={field.type}
                        value={responses[field.id] || ''}
                        onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="bg-white border-slate-300"
                    />
                );
            case 'textarea':
                return (
                    <Textarea
                        value={responses[field.id] || ''}
                        onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="bg-white border-slate-300"
                        rows={4}
                    />
                );
            case 'date':
                return (
                    <Input
                        type="date"
                        value={responses[field.id] || ''}
                        onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                        required={field.required}
                        className="bg-white border-slate-300"
                    />
                );
            case 'select':
                return (
                    <Select
                        value={responses[field.id]}
                        onValueChange={(value) => setResponses({ ...responses, [field.id]: value })}
                    >
                        <SelectTrigger className="bg-white border-slate-300">
                            <SelectValue placeholder={field.placeholder || 'Select an option'} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map((opt, idx) => (
                                <SelectItem key={idx} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'checkbox':
                return (
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={responses[field.id] || false}
                            onChange={(e) => setResponses({ ...responses, [field.id]: e.target.checked })}
                            className="rounded"
                        />
                        <span className="text-sm">{field.placeholder || 'Check to confirm'}</span>
                    </div>
                );
            case 'photo':
                return (
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                try {
                                    const { file_url } = await httpClient.integrations.Core.UploadFile({ file });
                                    setResponses({ ...responses, [field.id]: file_url });
                                    toast.success('Photo uploaded');
                                } catch (error) {
                                    toast.error('Upload failed');
                                }
                            }
                        }}
                        className="bg-white border-slate-300"
                    />
                );
            default:
                return null;
        }
    };
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }
    
    if (!form) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <p className="text-slate-600">Form not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-12 pb-12 text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
                        <p className="text-slate-600 mb-6">Your response has been submitted successfully.</p>
                        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
                            Submit Another Response
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white">
                    <CardTitle className="text-2xl">{form.title}</CardTitle>
                    {form.description && <p className="text-white/90 mt-2">{form.description}</p>}
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Submitter Name */}
                        <div>
                            <Label className="text-slate-700">Your Name *</Label>
                            <Input
                                value={responses._submitter_name || ''}
                                onChange={(e) => setResponses({ ...responses, _submitter_name: e.target.value })}
                                placeholder="Enter your name"
                                required
                                className="bg-white border-slate-300"
                            />
                        </div>
                        
                        {/* Form Fields */}
                        {form.fields?.map((field) => (
                            <div key={field.id}>
                                <Label className="text-slate-700">
                                    {field.label}
                                    {field.required && <span className="text-red-600 ml-1">*</span>}
                                </Label>
                                {renderField(field)}
                            </div>
                        ))}
                        
                        <Button
                            type="submit"
                            disabled={submitMutation.isPending}
                            className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] hover:opacity-90 text-white"
                        >
                            {submitMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}