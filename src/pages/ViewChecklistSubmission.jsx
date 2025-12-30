import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, User, MapPin, Clock, CheckCircle, Circle, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import CommentSection from '@/components/collaboration/CommentSection';
import AssignmentPanel from '@/components/collaboration/AssignmentPanel';

export default function ViewChecklistSubmission() {
    const urlParams = new URLSearchParams(window.location.search);
    const submissionId = urlParams.get('id');
    const queryClient = useQueryClient();
    
    const { data: submission, isLoading: subLoading } = useQuery({
        queryKey: ['checklist-submission', submissionId],
        queryFn: async () => {
            const subs = await base44.entities.ChecklistSubmission.filter({ id: submissionId });
            return subs[0];
        },
        enabled: !!submissionId
    });
    
    const { data: checklistTemplate } = useQuery({
        queryKey: ['checklist-template', submission?.checklist_template_id],
        queryFn: async () => {
            const checklists = await base44.entities.ChecklistTemplate.filter({ id: submission.checklist_template_id });
            return checklists[0];
        },
        enabled: !!submission?.checklist_template_id
    });
    
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ChecklistSubmission.update(id, data),
        onSuccess: () => queryClient.invalidateQueries(['checklist-submission', submissionId])
    });
    
    const updateAssignmentMutation = useMutation({
        mutationFn: (updates) => base44.entities.ChecklistSubmission.update(submissionId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries(['checklist-submission', submissionId]);
        }
    });
    
    const statusColors = {
        in_progress: 'bg-amber-100 text-amber-700',
        completed: 'bg-emerald-100 text-emerald-700',
        reviewed: 'bg-blue-100 text-blue-700'
    };
    
    if (subLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }
    
    if (!submission) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <p className="text-slate-500 mb-4">Submission not found</p>
                <Link to={createPageUrl('Submissions')}>
                    <Button>Go Back</Button>
                </Link>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to={createPageUrl('Submissions')}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold text-slate-900">{submission.checklist_title}</h1>
                            <p className="text-sm text-slate-500">Checklist Submission</p>
                        </div>
                        <Badge className={statusColors[submission.status]}>
                            {submission.status?.replace('_', ' ')}
                        </Badge>
                    </div>
                    
                    {/* Progress */}
                    <div className="flex items-center gap-4">
                        <Progress value={submission.completion_percentage || 0} className="h-2" />
                        <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                            {submission.completion_percentage || 0}%
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {/* Meta Info */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="grid grid-cols-2 gap-4">
                        {submission.submitted_by_name && (
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Submitted By</p>
                                <p className="font-medium flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    {submission.submitted_by_name}
                                </p>
                            </div>
                        )}
                        {submission.location && (
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Location</p>
                                <p className="font-medium flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    {submission.location}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Submitted</p>
                            <p className="font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                {format(new Date(submission.created_date), 'MMM d, yyyy h:mm a')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Update Status</p>
                            <Select
                                value={submission.status}
                                onValueChange={(value) => updateMutation.mutate({ id: submission.id, data: { status: value } })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="reviewed">Reviewed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                
                {/* Checklist Items */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-900">Checklist Items</h2>
                    </div>
                    <div>
                        {checklistTemplate?.items?.map((item) => {
                            const isCompleted = submission.completed_items?.includes(item.id);
                            const hasNote = submission.item_notes?.[item.id];
                            
                            return (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "border-b border-slate-100 last:border-0 p-4",
                                        isCompleted && "bg-emerald-50/50"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        {isCompleted ? (
                                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-5 h-5 text-white" />
                                            </div>
                                        ) : (
                                            <Circle className="w-6 h-6 text-slate-300 flex-shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <p className={cn(
                                                "text-slate-700",
                                                isCompleted && "text-slate-500"
                                            )}>
                                                {item.text}
                                            </p>
                                            {hasNote && (
                                                <div className="mt-2 flex items-start gap-2 text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
                                                    <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                    <span>{hasNote}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {(!checklistTemplate?.items || checklistTemplate.items.length === 0) && (
                            <p className="text-slate-400 text-center py-8">No items in checklist</p>
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
                        submissionType="checklist"
                    />
                </div>
            </div>
        </div>
    );
}