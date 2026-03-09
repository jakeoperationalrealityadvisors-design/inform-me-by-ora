import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle2, Circle, Plus, Settings, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { useUserRole } from '@/components/auth/RoleGuard';

export default function DailyTasks() {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const queryClient = useQueryClient();
    const { user, isAdmin } = useUserRole();
    
    const { data: dailyTasks = [] } = useQuery({
        queryKey: ['daily-tasks'],
        queryFn: () => base44.entities.DailyTask.filter({ active: true }, 'order')
    });
    
    const { data: completions = [] } = useQuery({
        queryKey: ['daily-completions', selectedDate],
        queryFn: () => base44.entities.DailyTaskCompletion.filter({ completed_date: selectedDate })
    });
    
    const toggleMutation = useMutation({
        mutationFn: async ({ taskId, isCompleted }) => {
            if (isCompleted) {
                const completion = completions.find(c => c.daily_task_id === taskId);
                if (completion) {
                    await base44.entities.DailyTaskCompletion.delete(completion.id);
                }
            } else {
                await base44.entities.DailyTaskCompletion.create({
                    daily_task_id: taskId,
                    completed_date: selectedDate,
                    completed_by: user?.email
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['daily-completions']);
        }
    });
    
    const isTaskCompleted = (taskId) => {
        return completions.some(c => c.daily_task_id === taskId);
    };
    
    const completionRate = dailyTasks.length > 0 
        ? Math.round((completions.length / dailyTasks.length) * 100) 
        : 0;
    
    const handleToggle = (taskId) => {
        const isCompleted = isTaskCompleted(taskId);
        toggleMutation.mutate({ taskId, isCompleted });
    };
    
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
                            <p className="text-sm text-blue-400">Complete your daily checklist</p>
                        </div>
                        {isAdmin && (
                            <Link to={createPageUrl('ManageDailyTasks')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                    <Settings className="w-5 h-5" />
                                </Button>
                            </Link>
                        )}
                    </div>
                    
                    {/* Date Selector */}
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-[#0a0e17] border border-blue-900/20 rounded-lg px-3 py-2 text-white text-sm"
                        />
                    </div>
                    
                    {/* Progress */}
                    <div className="bg-[#0a0e17] rounded-xl p-4 border border-blue-900/20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-blue-300">Today's Progress</span>
                            <span className="text-lg font-bold text-white">{completionRate}%</span>
                        </div>
                        <Progress value={completionRate} className="h-2" />
                        <p className="text-xs text-blue-400/70 mt-2">
                            {completions.length} of {dailyTasks.length} tasks completed
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Task List */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                {dailyTasks.length > 0 ? (
                    <div className="space-y-3">
                        {dailyTasks.map((task, idx) => {
                            const isCompleted = isTaskCompleted(task.id);
                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <button
                                        onClick={() => handleToggle(task.id)}
                                        className="w-full bg-[#0f1419] border border-blue-900/20 rounded-xl p-4 hover:border-blue-700/50 transition-all text-left"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {isCompleted ? (
                                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                                ) : (
                                                    <Circle className="w-6 h-6 text-blue-400/50" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-semibold ${isCompleted ? 'text-blue-400/70 line-through' : 'text-white'}`}>
                                                    {task.title}
                                                </h3>
                                                {task.description && (
                                                    <p className="text-sm text-blue-300/70 mt-1">
                                                        {task.description}
                                                    </p>
                                                )}
                                                {task.category && (
                                                    <Badge className="mt-2 bg-blue-500/20 text-blue-400">
                                                        {task.category}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Circle className="w-12 h-12 text-blue-400/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No Daily Tasks</h3>
                        <p className="text-blue-400/70 mb-4">
                            {isAdmin ? 'Create daily tasks to get started' : 'Daily tasks will appear here when added'}
                        </p>
                        {isAdmin && (
                            <Link to={createPageUrl('ManageDailyTasks')}>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Daily Task
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}