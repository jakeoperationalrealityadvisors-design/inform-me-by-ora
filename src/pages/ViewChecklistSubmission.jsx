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
import ExportButton from '@/components/pdf/ExportButton';

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
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to={createPageUrl('Submissions')}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold text-white">{submission.checklist_title}</h1>
                            <p className="text-sm text-blue-400">Checklist Submission</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ExportButton 
                                submission={submission}
                                template={checklistTemplate}
                                type="checklist"
                                size="sm"
                            />
                            <Badge className={statusColors[submission.status]}>
                                {submission.status?.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                    
                    {/* Progress */}
                    <div className="flex items-center gap-4">
                        <Progress value={submission.completion_percentage || 0} className="h-2" />
                        <span className="text-sm font-medium text-blue-100 whitespace-nowrap">
                            {submission.completion_percentage || 0}%
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
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
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="reviewed">Reviewed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                
                {/* Checklist Items */}
                <div className="bg-[#0f1419] rounded-2xl border border-blue-900/20 overflow-hidden">
                    <div className="p-6 border-b border-blue-900/20">
                        <h2 className="text-lg font-semibold text-white">Checklist Items</h2>
                    </div>
                    <div>
                        {checklistTemplate?.items?.map((item) => {
                            const isCompleted = submission.completed_items?.includes(item.id);
                            const hasNote = submission.item_notes?.[item.id];
                            
                            return (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "border-b border-blue-900/20 last:border-0 p-4",
                                        isCompleted && "bg-emerald-950/20"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        {isCompleted ? (
                                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-5 h-5 text-white" />
                                            </div>
                                        ) : (
                                            <Circle className="w-6 h-6 text-blue-400/40 flex-shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <p className={cn(
                                                "text-white",
                                                isCompleted && "text-blue-300"
                                            )}>
                                                {item.text}
                                            </p>
                                            {hasNote && (
                                                <div className="mt-2 flex items-start gap-2 text-sm text-blue-300 bg-blue-950/30 rounded-lg p-3">
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
                            <p className="text-blue-400/60 text-center py-8">No items in checklist</p>
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