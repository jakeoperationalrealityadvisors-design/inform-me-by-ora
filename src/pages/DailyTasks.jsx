import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle2, Circle, Calendar, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isToday, startOfDay } from 'date-fns';
import { motion } from 'framer-motion';

export default function DailyTasks() {
    const queryClient = useQueryClient();
    const [user, setUser] = useState(null);
    
    // Get current user
    useQuery({
        queryKey: ['current-user'],
        queryFn: async () => {
            const u = await base44.auth.me();
            setUser(u);
            return u;
        }
    });
    
    // Get daily checklists
    const { data: dailyChecklists = [], isLoading } = useQuery({
        queryKey: ['daily-checklists'],
        queryFn: () => base44.entities.ChecklistTemplate.filter({ 
            status: 'active',
            recurrence: 'daily'
        })
    });
    
    // Get today's submissions
    const { data: todaySubmissions = [] } = useQuery({
        queryKey: ['today-submissions', user?.email],
        queryFn: async () => {
            if (!user) return [];
            const all = await base44.entities.ChecklistSubmission.list('-created_date');
            return all.filter(sub => 
                sub.created_by === user.email && 
                isToday(new Date(sub.created_date))
            );
        },
        enabled: !!user
    });
    
    const isCompletedToday = (checklistId) => {
        return todaySubmissions.some(sub => 
            sub.checklist_template_id === checklistId && 
            sub.status === 'completed'
        );
    };
    
    const createSubmissionMutation = useMutation({
        mutationFn: (checklist) => base44.entities.ChecklistSubmission.create({
            checklist_template_id: checklist.id,
            checklist_title: checklist.title,
            completed_items: [],
            item_notes: {},
            submitted_by_name: user?.full_name || user?.email,
            completion_percentage: 0,
            status: 'in_progress'
        }),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['today-submissions']);
            window.location.href = createPageUrl(`FillChecklist?submissionId=${data.id}`);
        }
    });
    
    const handleStartChecklist = (checklist) => {
        createSubmissionMutation.mutate(checklist);
    };
    
    const completedCount = dailyChecklists.filter(cl => isCompletedToday(cl.id)).length;
    
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
                            <h1 className="text-xl font-bold text-white">Daily Tasks</h1>
                            <p className="text-sm text-blue-400">
                                {format(new Date(), 'EEEE, MMMM d, yyyy')}
                            </p>
                        </div>
                    </div>
                    
                    {/* Progress */}
                    <div className="bg-[#0a0e17] rounded-xl p-4 border border-blue-900/20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">Today's Progress</span>
                            <span className="text-blue-400 font-semibold">
                                {completedCount} / {dailyChecklists.length}
                            </span>
                        </div>
                        <div className="w-full bg-blue-950/30 rounded-full h-2">
                            <div 
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${dailyChecklists.length > 0 ? (completedCount / dailyChecklists.length) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto px-4 py-6">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    </div>
                ) : dailyChecklists.length > 0 ? (
                    <div className="space-y-3">
                        {dailyChecklists.map((checklist, idx) => {
                            const completed = isCompletedToday(checklist.id);
                            
                            return (
                                <motion.div
                                    key={checklist.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`bg-[#0f1419] border rounded-2xl p-5 transition-all ${
                                        completed 
                                            ? 'border-green-500/30 bg-green-950/10' 
                                            : 'border-blue-900/20 hover:border-blue-700/50'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 ${completed ? 'text-green-400' : 'text-blue-400'}`}>
                                            {completed ? (
                                                <CheckCircle2 className="w-6 h-6" />
                                            ) : (
                                                <Circle className="w-6 h-6" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className={`font-semibold text-lg ${completed ? 'text-green-400 line-through' : 'text-white'}`}>
                                                    {checklist.title}
                                                </h3>
                                                {completed && (
                                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                                        Completed
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            {checklist.description && (
                                                <p className="text-blue-300/70 text-sm mb-3">
                                                    {checklist.description}
                                                </p>
                                            )}
                                            
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-blue-400/60">
                                                    {checklist.items?.length || 0} items
                                                </span>
                                                
                                                {!completed && (
                                                    <Button
                                                        onClick={() => handleStartChecklist(checklist)}
                                                        disabled={createSubmissionMutation.isLoading}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                        size="sm"
                                                    >
                                                        {createSubmissionMutation.isLoading ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            'Start'
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-blue-400/40" />
                        <h3 className="text-lg font-semibold text-white mb-2">No Daily Tasks</h3>
                        <p className="text-blue-400/60 mb-4">
                            Set up daily checklists to track your routine tasks
                        </p>
                        <Link to={createPageUrl('Admin')}>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                Create Daily Checklist
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}