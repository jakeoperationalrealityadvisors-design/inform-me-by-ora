import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle, Circle, MessageSquare, Loader2, Send, ChevronDown, Camera, Share2, X } from 'lucide-react';
import ShareFormDialog from '@/components/forms/ShareFormDialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
        <>
        <div className="min-h-screen bg-[#0a0e17] overflow-y-auto">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-20 shadow-sm">
                <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-2 sm:gap-4 mb-3">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400 shrink-0 h-9 w-9">
                                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base sm:text-lg font-semibold text-white truncate">{checklist.title}</h1>
                            {checklist.description && (
                                <p className="text-xs sm:text-sm text-blue-400 truncate hidden sm:block">{checklist.description}</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Progress */}
                    <div className="flex items-center gap-3">
                        <Progress value={progress} className="h-2 bg-blue-950/50" />
                        <span className="text-xs sm:text-sm font-medium text-blue-300 whitespace-nowrap">
                            {completedItems.length}/{checklist.items?.length || 0}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                {/* Submitter Info - Collapsible */}
                <Collapsible defaultOpen>
                    <div className="bg-[#0f1419] rounded-xl sm:rounded-2xl border border-blue-900/20 p-4 sm:p-6 mb-3 sm:mb-4">
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
                    </div>
                </Collapsible>
                
                {/* Checklist Items */}
                <div className="bg-[#0f1419] rounded-xl sm:rounded-2xl border border-blue-900/20 overflow-hidden max-h-[60vh] overflow-y-auto">
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
            <div className="sticky bottom-0 left-0 right-0 bg-[#0d1120]/95 backdrop-blur border-t border-white/5 px-4 py-3">
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
                        disabled={!submitterName.trim() || submitMutation.isPending}
                        className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-40 text-sm"
                    >
                        {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Send className="w-4 h-4 mr-1.5" />}
                        Send
                    </Button>
                </div>
            </div>
        </div>

        {checklist && <ShareFormDialog open={shareOpen} onOpenChange={setShareOpen} formId={checklist.id} formTitle={checklist.title} type="checklist" />}
        </>
    );
}