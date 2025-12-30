import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from 'framer-motion';
import DynamicField from '@/components/forms/DynamicField';

export default function FillForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const formId = urlParams.get('id');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [responses, setResponses] = useState({});
    const [submitterName, setSubmitterName] = useState('');
    const [location, setLocation] = useState('');
    const [submitted, setSubmitted] = useState(false);
    
    const { data: form, isLoading } = useQuery({
        queryKey: ['form', formId],
        queryFn: async () => {
            const forms = await base44.entities.FormTemplate.filter({ id: formId });
            return forms[0];
        },
        enabled: !!formId
    });
    
    const submitMutation = useMutation({
        mutationFn: (data) => base44.entities.FormSubmission.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['submissions']);
            setSubmitted(true);
        }
    });
    
    const handleFieldChange = (fieldId, value) => {
        setResponses(prev => ({ ...prev, [fieldId]: value }));
    };
    
    const validateForm = () => {
        if (!form?.fields) return true;
        for (const field of form.fields) {
            if (field.required && !responses[field.id]) {
                return false;
            }
        }
        return submitterName.trim() !== '';
    };
    
    const handleSubmit = () => {
        if (!validateForm()) return;
        
        submitMutation.mutate({
            form_template_id: form.id,
            form_title: form.title,
            responses,
            submitted_by_name: submitterName,
            location,
            status: 'submitted'
        });
    };
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }
    
    if (!form) {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex flex-col items-center justify-center p-4">
                <p className="text-blue-300 mb-4">Form not found</p>
                <Link to={createPageUrl('Home')}>
                    <Button>Go Back</Button>
                </Link>
            </div>
        );
    }
    
    if (submitted) {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-blue-950/50 flex items-center justify-center mb-6 border border-blue-600/30"
                >
                    <CheckCircle className="w-10 h-10 text-blue-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Submitted!</h2>
                <p className="text-blue-300 mb-6">Your form has been submitted successfully</p>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-blue-800 text-blue-300 hover:bg-blue-950/50" onClick={() => {
                        setResponses({});
                        setSubmitterName('');
                        setLocation('');
                        setSubmitted(false);
                    }}>
                        Fill Another
                    </Button>
                    <Link to={createPageUrl('Home')}>
                        <Button className="bg-blue-600 hover:bg-blue-700">Back to Home</Button>
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to={createPageUrl('Home')}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold text-white">{form.title}</h1>
                        {form.description && (
                            <p className="text-sm text-blue-400">{form.description}</p>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="bg-[#0f1419] rounded-2xl border border-blue-900/20 p-6 space-y-6">
                    {/* Submitter Info */}
                    <div className="pb-6 border-b border-blue-900/20 space-y-4">
                        <div>
                            <Label className="text-blue-100 font-medium">
                                Your Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={submitterName}
                                onChange={(e) => setSubmitterName(e.target.value)}
                                placeholder="Enter your name"
                                className="mt-2 bg-black/30 border-blue-900/30 focus:bg-black/50 text-white placeholder:text-blue-400/50"
                            />
                        </div>
                        <div>
                            <Label className="text-blue-100 font-medium">Location / Site</Label>
                            <Input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Enter location (optional)"
                                className="mt-2 bg-black/30 border-blue-900/30 focus:bg-black/50 text-white placeholder:text-blue-400/50"
                            />
                        </div>
                    </div>
                    
                    {/* Form Fields */}
                    <AnimatePresence>
                        {form.fields?.map((field, idx) => (
                            <motion.div
                                key={field.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <DynamicField
                                    field={field}
                                    value={responses[field.id]}
                                    onChange={(val) => handleFieldChange(field.id, val)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {(!form.fields || form.fields.length === 0) && (
                        <p className="text-blue-300/70 text-center py-8">No fields in this form</p>
                    )}
                </div>
                
                {/* Submit Button */}
                <div className="mt-6">
                    <Button
                        onClick={handleSubmit}
                        disabled={!validateForm() || submitMutation.isPending}
                        className="w-full h-14 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/30"
                    >
                        {submitMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <Send className="w-5 h-5 mr-2" />
                        )}
                        Submit Form
                    </Button>
                </div>
            </div>
        </div>
    );
}