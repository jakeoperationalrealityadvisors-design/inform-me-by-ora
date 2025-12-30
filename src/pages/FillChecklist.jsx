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
        mutationFn: (data) => base44.entities.ChecklistSubmission.create(data),
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }
    
    if (!checklist) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <p className="text-slate-500 mb-4">Checklist not found</p>
                <Link to={createPageUrl('Home')}>
                    <Button>Go Back</Button>
                </Link>
            </div>
        );
    }
    
    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6"
                >
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Submitted!</h2>
                <p className="text-slate-500 mb-6">{progress}% completed</p>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => {
                        setCompletedItems([]);
                        setItemNotes({});
                        setSubmitterName('');
                        setLocation('');
                        setSubmitted(false);
                    }}>
                        Start Fresh
                    </Button>
                    <Link to={createPageUrl('Home')}>
                        <Button className="bg-slate-900 hover:bg-slate-800">Back to Home</Button>
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold text-slate-900">{checklist.title}</h1>
                            {checklist.description && (
                                <p className="text-sm text-slate-500">{checklist.description}</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Progress */}
                    <div className="flex items-center gap-4">
                        <Progress value={progress} className="h-2" />
                        <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                            {completedItems.length}/{checklist.items?.length || 0}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Submitter Info */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4 space-y-4">
                    <div>
                        <Label className="text-slate-700 font-medium">
                            Your Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={submitterName}
                            onChange={(e) => setSubmitterName(e.target.value)}
                            placeholder="Enter your name"
                            className="mt-2 bg-slate-50 border-slate-200 focus:bg-white"
                        />
                    </div>
                    <div>
                        <Label className="text-slate-700 font-medium">Location / Site</Label>
                        <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Enter location (optional)"
                            className="mt-2 bg-slate-50 border-slate-200 focus:bg-white"
                        />
                    </div>
                </div>
                
                {/* Checklist Items */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
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
                                        "border-b border-slate-100 last:border-0",
                                        isCompleted && "bg-emerald-50/50"
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
                                                    className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                                                >
                                                    <CheckCircle className="w-5 h-5 text-white" />
                                                </motion.div>
                                            ) : (
                                                <Circle className="w-6 h-6 text-slate-300" />
                                            )}
                                        </button>
                                        <div className="flex-1">
                                            <p className={cn(
                                                "text-slate-700",
                                                isCompleted && "line-through text-slate-400"
                                            )}>
                                                {item.text}
                                                {item.required && <span className="text-red-500 ml-1">*</span>}
                                            </p>
                                            {item.notes_enabled && (
                                                <button
                                                    onClick={() => setActiveNoteItem(showNotes ? null : item.id)}
                                                    className="mt-2 text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1"
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
                                                className="bg-slate-50 border-slate-200 focus:bg-white"
                                            />
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    
                    {(!checklist.items || checklist.items.length === 0) && (
                        <p className="text-slate-500 text-center py-8">No items in this checklist</p>
                    )}
                </div>
                
                {/* Submit Button */}
                <div className="mt-6">
                    <Button
                        onClick={handleSubmit}
                        disabled={!submitterName.trim() || submitMutation.isPending}
                        className="w-full h-14 text-lg rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
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