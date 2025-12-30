import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, FileText, CheckSquare, Calendar, AlertCircle, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isPast, isToday } from 'date-fns';
import { motion } from 'framer-motion';

export default function MyTasks() {
    const [filter, setFilter] = useState('all');
    
    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });
    
    const { data: formTasks = [] } = useQuery({
        queryKey: ['my-form-tasks'],
        queryFn: async () => {
            const all = await base44.entities.FormSubmission.list('-due_date');
            return all.filter(f => f.assigned_to_email === user?.email);
        },
        enabled: !!user
    });
    
    const { data: checklistTasks = [] } = useQuery({
        queryKey: ['my-checklist-tasks'],
        queryFn: async () => {
            const all = await base44.entities.ChecklistSubmission.list('-due_date');
            return all.filter(c => c.assigned_to_email === user?.email);
        },
        enabled: !!user
    });
    
    const filterTasks = (tasks) => {
        if (filter === 'overdue') {
            return tasks.filter(t => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)));
        }
        if (filter === 'today') {
            return tasks.filter(t => t.due_date && isToday(new Date(t.due_date)));
        }
        if (filter === 'upcoming') {
            return tasks.filter(t => t.due_date && !isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)));
        }
        return tasks;
    };
    
    const filteredForms = filterTasks(formTasks);
    const filteredChecklists = filterTasks(checklistTasks);
    
    const priorityColors = {
        low: 'bg-blue-500/10 text-blue-400',
        medium: 'bg-yellow-500/10 text-yellow-400',
        high: 'bg-orange-500/10 text-orange-400',
        urgent: 'bg-red-500/10 text-red-400'
    };
    
    const isOverdue = (dueDate) => dueDate && isPast(new Date(dueDate)) && !isToday(new Date(dueDate));
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white">My Tasks</h1>
                            <p className="text-sm text-blue-400">Tasks assigned to you</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Filter Buttons */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['all', 'overdue', 'today', 'upcoming'].map((f) => (
                        <Button
                            key={f}
                            onClick={() => setFilter(f)}
                            variant={filter === f ? 'default' : 'outline'}
                            size="sm"
                            className={filter === f 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'border-blue-800 text-blue-300 hover:bg-blue-950/50'}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Button>
                    ))}
                </div>
                
                {/* Tabs */}
                <Tabs defaultValue="forms">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="forms" className="gap-2">
                            <FileText className="w-4 h-4" />
                            Forms ({filteredForms.length})
                        </TabsTrigger>
                        <TabsTrigger value="checklists" className="gap-2">
                            <CheckSquare className="w-4 h-4" />
                            Checklists ({filteredChecklists.length})
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="forms" className="space-y-4 mt-4">
                        {filteredForms.length > 0 ? (
                            filteredForms.map((task, idx) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Link to={createPageUrl(`ViewFormSubmission?id=${task.id}`)}>
                                        <div className="bg-[#0f1419] border border-blue-900/20 rounded-xl p-4 hover:border-blue-700/50 transition-all">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-semibold text-white">{task.form_title}</h3>
                                                <Badge className={priorityColors[task.priority || 'medium']}>
                                                    {task.priority || 'medium'}
                                                </Badge>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-3 text-sm">
                                                {task.due_date && (
                                                    <div className={`flex items-center gap-1 ${isOverdue(task.due_date) ? 'text-red-400' : 'text-blue-300'}`}>
                                                        <Calendar className="w-4 h-4" />
                                                        Due {format(new Date(task.due_date), 'MMM d, yyyy')}
                                                        {isOverdue(task.due_date) && <AlertCircle className="w-4 h-4" />}
                                                    </div>
                                                )}
                                                {task.location && (
                                                    <span className="text-blue-400/70">{task.location}</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-blue-400/60">
                                No form tasks found
                            </div>
                        )}
                    </TabsContent>
                    
                    <TabsContent value="checklists" className="space-y-4 mt-4">
                        {filteredChecklists.length > 0 ? (
                            filteredChecklists.map((task, idx) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Link to={createPageUrl(`ViewChecklistSubmission?id=${task.id}`)}>
                                        <div className="bg-[#0f1419] border border-blue-900/20 rounded-xl p-4 hover:border-blue-700/50 transition-all">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-semibold text-white">{task.checklist_title}</h3>
                                                <Badge className={priorityColors[task.priority || 'medium']}>
                                                    {task.completion_percentage || 0}% complete
                                                </Badge>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-3 text-sm">
                                                {task.due_date && (
                                                    <div className={`flex items-center gap-1 ${isOverdue(task.due_date) ? 'text-red-400' : 'text-blue-300'}`}>
                                                        <Calendar className="w-4 h-4" />
                                                        Due {format(new Date(task.due_date), 'MMM d, yyyy')}
                                                        {isOverdue(task.due_date) && <AlertCircle className="w-4 h-4" />}
                                                    </div>
                                                )}
                                                {task.location && (
                                                    <span className="text-blue-400/70">{task.location}</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-blue-400/60">
                                No checklist tasks found
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}