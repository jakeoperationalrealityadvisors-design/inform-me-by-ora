import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, Square, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function PublicChecklist() {
    const urlParams = new URLSearchParams(window.location.search);
    const checklistId = urlParams.get('id');
    const [completed, setCompleted] = useState([]);
    const [notes, setNotes] = useState({});
    const [submitterName, setSubmitterName] = useState('');
    const [submitted, setSubmitted] = useState(false);
    
    const { data: checklist, isLoading } = useQuery({
        queryKey: ['public-checklist', checklistId],
        queryFn: async () => {
            const checklists = await httpClient.entities.ChecklistTemplate.filter({ id: checklistId });
            return checklists[0];
        },
        enabled: !!checklistId
    });
    
    const submitMutation = useMutation({
        mutationFn: async (data) => {
            return await httpClient.entities.ChecklistSubmission.create(data);
        },
        onSuccess: () => {
            setSubmitted(true);
            toast.success('Checklist submitted successfully!');
        },
        onError: (error) => {
            toast.error('Submission failed: ' + error.message);
        }
    });
    
    const toggleItem = (itemId) => {
        setCompleted(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!submitterName.trim()) {
            toast.error('Please enter your name');
            return;
        }
        
        const requiredItems = checklist.items?.filter(item => item.required) || [];
        const missingRequired = requiredItems.filter(item => !completed.includes(item.id));
        
        if (missingRequired.length > 0) {
            toast.error('Please complete all required items');
            return;
        }
        
        const completionPercentage = checklist.items?.length 
            ? Math.round((completed.length / checklist.items.length) * 100)
            : 0;
        
        submitMutation.mutate({
            checklist_template_id: checklistId,
            checklist_title: checklist.title,
            completed_items: completed,
            item_notes: notes,
            submitted_by_name: submitterName,
            completion_percentage: completionPercentage,
            status: completionPercentage === 100 ? 'completed' : 'in_progress'
        });
    };
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0b1220] to-[#0f1419] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }
    
    if (!checklist) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0b1220] to-[#0f1419] flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <p className="text-blue-300">Checklist not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0b1220] to-[#0f1419] flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-12 pb-12 text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                        <p className="text-blue-300 mb-6">Your checklist has been submitted successfully.</p>
                        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
                            Submit Another Response
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const completionPercentage = checklist.items?.length 
        ? Math.round((completed.length / checklist.items.length) * 100)
        : 0;
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0b1220] to-[#0f1419] py-12 px-4">
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white">
                    <CardTitle className="text-2xl">{checklist.title}</CardTitle>
                    {checklist.description && <p className="text-white/90 mt-2">{checklist.description}</p>}
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-white/90 mb-2">
                            <span>Progress</span>
                            <span>{completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-blue-950/40 rounded-full h-2">
                            <div
                                className="bg-[#0f1419] rounded-full h-2 transition-all duration-300"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label className="text-blue-200">Your Name *</Label>
                            <Input
                                value={submitterName}
                                onChange={(e) => setSubmitterName(e.target.value)}
                                placeholder="Enter your name"
                                required
                                className="bg-[#0f1419] border-blue-900/40"
                            />
                        </div>
                        
                        <div className="space-y-3">
                            {checklist.items?.map((item) => (
                                <div key={item.id} className="border border-blue-900/30 rounded-lg p-4 space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => toggleItem(item.id)}
                                        className="flex items-start gap-3 w-full text-left"
                                    >
                                        {completed.includes(item.id) ? (
                                            <CheckSquare className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <Square className="w-5 h-5 text-blue-400/60 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <span className={`text-white ${completed.includes(item.id) ? 'line-through' : ''}`}>
                                                {item.text}
                                            </span>
                                            {item.required && <span className="text-red-600 ml-1">*</span>}
                                        </div>
                                    </button>
                                    
                                    {item.notes_enabled && (
                                        <Textarea
                                            value={notes[item.id] || ''}
                                            onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                                            placeholder="Add notes..."
                                            className="bg-[#0f1419] border-blue-900/40"
                                            rows={2}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        
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
                                'Submit Checklist'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}