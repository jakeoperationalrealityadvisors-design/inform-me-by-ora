import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle, Circle, MessageSquare, Loader2, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { logActivity } from '@/components/activity/ActivityLogger';

export default function FillChecklist() {
    const urlParams = new URLSearchParams(window.location.search);
    const checklistId = urlParams.get('id');
    const queryClient = useQueryClient();
    
    const [completedItems, setCompletedItems] = useState([]);
    const [itemNotes, setItemNotes] = useState({});
    const [activeNoteItem, setActiveNoteItem] = useState(null);
    const [submitterName, setSubmitterName] = useState('');
    const [location, setLocation] = useState('');
    const [submitted, setSubmitted] = useState(false);
    
    const { data: checklist, isLoading } = useQuery({
        queryKey: ['checklist', checklistId],
        queryFn: async () => {
            const checklists = await base44.entities.ChecklistTemplate.filter({ id: checklistId });
            return checklists[0];
        },
        enabled: !!checklistId
    });
    
    const submitMutation = useMutation({
        mutationFn: async (data) => {
            const submission = await base44.entities.ChecklistSubmission.create(data);
            
            await logActivity({
                action_type: 'checklist_submitted',
                entity_type: 'checklist',
                entity_id: submission.id,
                entity_title: checklist.title,
                description: `Submitted checklist: ${checklist.title} (${data.completion_percentage}% complete)`
            });
            
            // Trigger automations
            if (data.status === 'completed') {
                await base44.functions.invoke('executeAutomations', {
                    trigger_type: 'checklist_completed',
                    trigger_data: {
                        template_id: checklist.id,
                        submission_id: submission.id,
                        submission_type: 'checklist',
                        title: checklist.title,
                        submitted_by_email: data.created_by,
                        link_page: 'ViewChecklistSubmission',
                        link_params: `id=${submission.id}`
                    }
                });
            }
            
            return submission;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['submissions']);
            setSubmitted(true);
        }
    });
    
    const toggleItem = (itemId) => {
        setCompletedItems(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };
    
    const progress = checklist?.items?.length 
        ? Math.round((completedItems.length / checklist.items.length) * 100)
        : 0;
    
    const handleSubmit = () => {
        if (!submitterName.trim()) return;
        
        submitMutation.mutate({
            checklist_template_id: checklist.id,
            checklist_title: checklist.title,
            completed_items: completedItems,
            item_notes: itemNotes,
            submitted_by_name: submitterName,
            location,
            completion_percentage: progress,
            status: progress === 100 ? 'completed' : 'in_progress'
        });
    };
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }
    
    if (!checklist) {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex flex-col items-center justify-center p-4">
                <p className="text-blue-300 mb-4">Checklist not found</p>
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
                <p className="text-blue-300 mb-6">{progress}% completed</p>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-blue-800 text-blue-300 hover:bg-blue-950/50" onClick={() => {
                        setCompletedItems([]);
                        setItemNotes({});
                        setSubmitterName('');
                        setLocation('');
                        setSubmitted(false);
                    }}>
                        Start Fresh
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
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold text-white">{checklist.title}</h1>
                            {checklist.description && (
                                <p className="text-sm text-blue-400">{checklist.description}</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Progress */}
                    <div className="flex items-center gap-4">
                        <Progress value={progress} className="h-2 bg-blue-950/50" />
                        <span className="text-sm font-medium text-blue-300 whitespace-nowrap">
                            {completedItems.length}/{checklist.items?.length || 0}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Submitter Info */}
                <div className="bg-[#0f1419] rounded-2xl border border-blue-900/20 p-6 mb-4 space-y-4">
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
                
                {/* Checklist Items */}
                <div className="bg-[#0f1419] rounded-2xl border border-blue-900/20 overflow-hidden">
                    <AnimatePresence>
                        {checklist.items?.map((item, idx) => {
                            const isCompleted = completedItems.includes(item.id);
                            const showNotes = activeNoteItem === item.id;
                            
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className={cn(
                                        "border-b border-blue-900/20 last:border-0",
                                        isCompleted && "bg-blue-950/30"
                                    )}
                                >
                                    <div className="p-4 flex items-start gap-4">
                                        <button
                                            onClick={() => toggleItem(item.id)}
                                            className="mt-0.5 flex-shrink-0"
                                        >
                                            {isCompleted ? (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center"
                                                >
                                                    <CheckCircle className="w-5 h-5 text-white" />
                                                </motion.div>
                                            ) : (
                                                <Circle className="w-6 h-6 text-blue-700" />
                                            )}
                                        </button>
                                        <div className="flex-1">
                                            <p className={cn(
                                                "text-blue-100",
                                                isCompleted && "line-through text-blue-400/50"
                                            )}>
                                                {item.text}
                                                {item.required && <span className="text-red-500 ml-1">*</span>}
                                            </p>
                                            {item.notes_enabled && (
                                                <button
                                                    onClick={() => setActiveNoteItem(showNotes ? null : item.id)}
                                                    className="mt-2 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    {itemNotes[item.id] ? 'Edit note' : 'Add note'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {showNotes && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-4 pb-4"
                                        >
                                            <Textarea
                                                value={itemNotes[item.id] || ''}
                                                onChange={(e) => setItemNotes(prev => ({
                                                    ...prev,
                                                    [item.id]: e.target.value
                                                }))}
                                                placeholder="Add a note..."
                                                className="bg-black/30 border-blue-900/30 focus:bg-black/50 text-white placeholder:text-blue-400/50"
                                            />
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    
                    {(!checklist.items || checklist.items.length === 0) && (
                        <p className="text-blue-300/70 text-center py-8">No items in this checklist</p>
                    )}
                </div>
                
                {/* Submit Button */}
                <div className="mt-6">
                    <Button
                        onClick={handleSubmit}
                        disabled={!submitterName.trim() || submitMutation.isPending}
                        className="w-full h-14 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/30"
                    >
                        {submitMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <Send className="w-5 h-5 mr-2" />
                        )}
                        Submit Checklist
                    </Button>
                </div>
            </div>
        </div>
    );
}