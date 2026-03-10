import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Send, Loader2, CheckCircle, ChevronDown, Camera, Share2, X } from 'lucide-react';
import ShareFormDialog from '@/components/forms/ShareFormDialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from 'framer-motion';
import DynamicField from '@/components/forms/DynamicField';
import { logActivity } from '@/components/activity/ActivityLogger';

export default function FillForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const formId = urlParams.get('id');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [responses, setResponses] = useState({});
    const [submitterName, setSubmitterName] = useState('');
    const [location, setLocation] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [photos, setPhotos] = useState([]);

    const handleAddPhoto = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                setPhotos(prev => [...prev, { url, name: file.name }]);
            }
        };
        input.click();
    };
    
    const { data: form, isLoading } = useQuery({
        queryKey: ['form', formId],
        queryFn: async () => {
            const forms = await base44.entities.FormTemplate.filter({ id: formId });
            return forms[0];
        },
        enabled: !!formId
    });
    
    const submitMutation = useMutation({
        mutationFn: async (data) => {
            const submission = await base44.entities.FormSubmission.create(data);
            
            await logActivity({
                action_type: 'form_submitted',
                entity_type: 'form',
                entity_id: submission.id,
                entity_title: form.title,
                description: `Submitted form: ${form.title}`
            });
            
            // Trigger automations
            await base44.functions.invoke('executeAutomations', {
                trigger_type: 'form_submitted',
                trigger_data: {
                    template_id: form.id,
                    submission_id: submission.id,
                    submission_type: 'form',
                    title: form.title,
                    submitted_by_email: data.created_by,
                    link_page: 'ViewFormSubmission',
                    link_params: `id=${submission.id}`
                }
            });
            
            return submission;
        },
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
        <>
        <div className="min-h-screen bg-[#0a0e17] overflow-y-auto">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-20 shadow-sm">
                <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-4">
                    <Link to={createPageUrl('Home')}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400 shrink-0 h-9 w-9">
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base sm:text-lg font-semibold text-white truncate">{form.title}</h1>
                        {form.description && (
                            <p className="text-xs sm:text-sm text-blue-400 truncate">{form.description}</p>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                <div className="bg-[#0f1419] rounded-xl sm:rounded-2xl border border-blue-900/20 p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Submitter Info - Collapsible */}
                    <Collapsible defaultOpen>
                        <CollapsibleTrigger className="w-full flex items-center justify-between pb-3 border-b border-blue-900/20">
                            <h3 className="text-sm sm:text-base font-medium text-blue-100">Your Information</h3>
                            <ChevronDown className="w-4 h-4 text-blue-400" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="pt-4 space-y-3">
                                <div>
                                    <Label className="text-xs sm:text-sm text-blue-100 font-medium">
                                        Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        value={submitterName}
                                        onChange={(e) => setSubmitterName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="mt-1 h-10 sm:h-11 bg-black/30 border-blue-900/30 focus:bg-black/50 text-white placeholder:text-blue-400/50"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs sm:text-sm text-blue-100 font-medium">Location</Label>
                                    <Input
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Optional"
                                        className="mt-1 h-10 sm:h-11 bg-black/30 border-blue-900/30 focus:bg-black/50 text-white placeholder:text-blue-400/50"
                                    />
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                    
                    {/* Form Fields */}
                    <div className="space-y-4">
                        {form.fields?.map((field, idx) => (
                            <motion.div
                                key={field.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.02 }}
                            >
                                <DynamicField
                                    field={field}
                                    value={responses[field.id]}
                                    onChange={(val) => handleFieldChange(field.id, val)}
                                />
                            </motion.div>
                        ))}
                    </div>
                    
                    {(!form.fields || form.fields.length === 0) && (
                        <p className="text-blue-300/70 text-center py-8">No fields in this form</p>
                    )}
                </div>
                
                {/* Photos preview */}
                {photos.length > 0 && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                        {photos.map((p, i) => (
                            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                                <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 rounded-full flex items-center justify-center"
                                >
                                    <X className="w-2.5 h-2.5 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sticky Action Bar */}
            <div className="sticky bottom-0 left-0 right-0 bg-[#0d1120]/95 backdrop-blur border-t border-white/5 px-4 py-3 -mx-0">
                <div className="max-w-2xl mx-auto flex items-center gap-2">
                    <button
                        onClick={handleAddPhoto}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#1a2236] border border-white/8 text-white/50 hover:text-white hover:border-white/20 text-sm font-medium transition-all"
                    >
                        <Camera className="w-4 h-4" />
                        <span className="hidden sm:inline">Photo</span>
                    </button>
                    <button
                        onClick={() => setShareOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#1a2236] border border-white/8 text-white/50 hover:text-emerald-400 hover:border-emerald-500/30 text-sm font-medium transition-all"
                    >
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Share</span>
                    </button>
                    <Link to={createPageUrl('Home')} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#1a2236] border border-white/8 text-white/50 hover:text-red-400 hover:border-red-500/30 text-sm font-medium transition-all">
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Cancel</span>
                    </Link>
                    <Button
                        onClick={handleSubmit}
                        disabled={!validateForm() || submitMutation.isPending}
                        className="flex-1 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold disabled:opacity-40 text-sm"
                    >
                        {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Send className="w-4 h-4 mr-1.5" />}
                        Send
                    </Button>
                </div>
            </div>
        </div>

        {form && <ShareFormDialog open={shareOpen} onOpenChange={setShareOpen} formId={form.id} formTitle={form.title} type="form" />}
        </>
    );
}