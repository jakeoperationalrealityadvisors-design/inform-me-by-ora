import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, User, MapPin, Clock, FileText, Image, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CommentSection from '@/components/collaboration/CommentSection';
import AssignmentPanel from '@/components/collaboration/AssignmentPanel';
import ExportButton from '@/components/pdf/ExportButton';
import AICompletionAssistant from '@/components/ai/AICompletionAssistant';

export default function ViewFormSubmission() {
    const urlParams = new URLSearchParams(window.location.search);
    const submissionId = urlParams.get('id');
    const queryClient = useQueryClient();
    
    const { data: submission, isLoading: subLoading } = useQuery({
        queryKey: ['form-submission', submissionId],
        queryFn: async () => {
            const subs = await base44.entities.FormSubmission.filter({ id: submissionId });
            return subs[0];
        },
        enabled: !!submissionId
    });
    
    const { data: formTemplate } = useQuery({
        queryKey: ['form-template', submission?.form_template_id],
        queryFn: async () => {
            const forms = await base44.entities.FormTemplate.filter({ id: submission.form_template_id });
            return forms[0];
        },
        enabled: !!submission?.form_template_id
    });
    
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.FormSubmission.update(id, data),
        onSuccess: () => queryClient.invalidateQueries(['form-submission', submissionId])
    });
    
    const updateAssignmentMutation = useMutation({
        mutationFn: (updates) => base44.entities.FormSubmission.update(submissionId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries(['form-submission', submissionId]);
        }
    });
    
    const statusColors = {
        submitted: 'bg-blue-100 text-blue-700',
        reviewed: 'bg-amber-100 text-amber-700',
        approved: 'bg-emerald-100 text-emerald-700',
        rejected: 'bg-red-100 text-red-700'
    };
    
    const getFieldLabel = (fieldId) => {
        const field = formTemplate?.fields?.find(f => f.id === fieldId);
        return field?.label || fieldId;
    };
    
    const getFieldType = (fieldId) => {
        const field = formTemplate?.fields?.find(f => f.id === fieldId);
        return field?.type || 'text';
    };
    
    const renderValue = (fieldId, value) => {
        const type = getFieldType(fieldId);
        
        if (!value && value !== false) return <span className="text-slate-400">—</span>;
        
        if (type === 'checkbox') {
            return value ? (
                <span className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle className="w-4 h-4" /> Yes
                </span>
            ) : (
                <span className="flex items-center gap-2 text-slate-400">
                    <XCircle className="w-4 h-4" /> No
                </span>
            );
        }
        
        if (type === 'photo') {
            return (
                <a href={value} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={value} alt="Uploaded" className="max-w-xs rounded-xl hover:opacity-90 transition" />
                </a>
            );
        }
        
        if (type === 'signature') {
            return <span className="italic text-lg">{value}</span>;
        }
        
        return value;
    };
    
    if (subLoading) {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }
    
    if (!submission) {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex flex-col items-center justify-center p-4">
                <p className="text-blue-400 mb-4">Submission not found</p>
                <Link to={createPageUrl('Submissions')}>
                    <Button>Go Back</Button>
                </Link>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to={createPageUrl('Submissions')}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold text-white">{submission.form_title}</h1>
                        <p className="text-sm text-blue-400">Form Submission</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButton 
                            submission={submission}
                            template={formTemplate}
                            type="form"
                            size="sm"
                        />
                        <Badge className={statusColors[submission.status]}>
                            {submission.status}
                        </Badge>
                    </div>
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {/* AI Completion Assistant */}
                <AICompletionAssistant entity="form" data={submission} />
                
                {/* Meta Info */}
                <div className="bg-[#0f1419] rounded-2xl border border-blue-900/20 p-6">
                    <div className="grid grid-cols-2 gap-4">
                        {submission.submitted_by_name && (
                            <div>
                                <p className="text-sm text-blue-400 mb-1">Submitted By</p>
                                <p className="font-medium flex items-center gap-2 text-white">
                                    <User className="w-4 h-4 text-blue-400/70" />
                                    {submission.submitted_by_name}
                                </p>
                            </div>
                        )}
                        {submission.location && (
                            <div>
                                <p className="text-sm text-blue-400 mb-1">Location</p>
                                <p className="font-medium flex items-center gap-2 text-white">
                                    <MapPin className="w-4 h-4 text-blue-400/70" />
                                    {submission.location}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-blue-400 mb-1">Submitted</p>
                            <p className="font-medium flex items-center gap-2 text-white">
                                <Clock className="w-4 h-4 text-blue-400/70" />
                                {format(new Date(submission.created_date), 'MMM d, yyyy h:mm a')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-400 mb-1">Update Status</p>
                            <Select
                                value={submission.status}
                                onValueChange={(value) => updateMutation.mutate({ id: submission.id, data: { status: value } })}
                            >
                                <SelectTrigger className="w-full bg-[#0a0e17] border-blue-900/20 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="reviewed">Reviewed</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                
                {/* Responses */}
                <div className="bg-[#0f1419] rounded-2xl border border-blue-900/20 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Responses</h2>
                    <div className="space-y-4">
                        {submission.responses && Object.entries(submission.responses).map(([fieldId, value]) => (
                            <div key={fieldId} className="border-b border-blue-900/20 pb-4 last:border-0 last:pb-0">
                                <p className="text-sm text-blue-400 mb-1">{getFieldLabel(fieldId)}</p>
                                <div className="font-medium text-white">
                                    {renderValue(fieldId, value)}
                                </div>
                            </div>
                        ))}
                        {(!submission.responses || Object.keys(submission.responses).length === 0) && (
                            <p className="text-blue-400/60 text-center py-4">No responses recorded</p>
                        )}
                    </div>
                </div>
                
                {/* Assignment Panel */}
                <div>
                    <AssignmentPanel 
                        submission={submission}
                        onUpdate={(updates) => updateAssignmentMutation.mutate(updates)}
                    />
                </div>
                
                {/* Comments */}
                <div>
                    <CommentSection 
                        submissionId={submissionId}
                        submissionType="form"
                    />
                </div>
            </div>
        </div>
    );
}