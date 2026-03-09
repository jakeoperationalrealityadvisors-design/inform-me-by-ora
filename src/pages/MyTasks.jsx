import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, FileText, CheckSquare, Calendar, AlertCircle, User, LayoutList, CalendarDays, ArrowUpDown, Plus, ListTodo } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isPast, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { useUserRole } from '@/components/auth/RoleGuard';
import TaskCalendar from '@/components/tasks/TaskCalendar';
import TaskReminderBadge from '@/components/tasks/TaskReminderBadge';
import TaskCard from '@/components/tasks/TaskCard';
import ProjectManagementAI from '@/components/ai/ProjectManagementAI';

export default function MyTasks() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [sortBy, setSortBy] = useState('due_date'); // 'due_date', 'priority', 'status'
    const { user, canViewAll } = useUserRole();
    
    const { data: standaloneTasks = [] } = useQuery({
        queryKey: ['standalone-tasks'],
        queryFn: async () => {
            const all = await base44.entities.Task.list('-created_date');
            if (canViewAll) return all;
            return all.filter(t => t.assigned_to_email === user?.email);
        },
        enabled: !!user
    });
    
    const { data: formTasks = [] } = useQuery({
        queryKey: ['my-form-tasks'],
        queryFn: async () => {
            const all = await base44.entities.FormSubmission.list('-due_date');
            // Managers and admins see all tasks, team members see only assigned
            if (canViewAll) return all;
            return all.filter(f => f.assigned_to_email === user?.email);
        },
        enabled: !!user
    });
    
    const { data: checklistTasks = [] } = useQuery({
        queryKey: ['my-checklist-tasks'],
        queryFn: async () => {
            const all = await base44.entities.ChecklistSubmission.list('-due_date');
            // Managers and admins see all tasks, team members see only assigned
            if (canViewAll) return all;
            return all.filter(c => c.assigned_to_email === user?.email);
        },
        enabled: !!user
    });
    
    const filterTasks = (tasks) => {
        let filtered = [...tasks];
        
        // Apply filter
        if (filter === 'overdue') {
            filtered = filtered.filter(t => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)));
        } else if (filter === 'today') {
            filtered = filtered.filter(t => t.due_date && isToday(new Date(t.due_date)));
        } else if (filter === 'upcoming') {
            filtered = filtered.filter(t => t.due_date && !isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)));
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            if (sortBy === 'due_date') {
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date) - new Date(b.due_date);
            } else if (sortBy === 'priority') {
                const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
            } else if (sortBy === 'status') {
                return (a.status || '').localeCompare(b.status || '');
            }
            return 0;
        });
        
        return filtered;
    };
    
    const filteredForms = filterTasks(formTasks);
    const filteredChecklists = filterTasks(checklistTasks);
    const filteredStandaloneTasks = filterTasks(standaloneTasks);
    
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
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Home')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    {canViewAll ? 'Team Tasks' : 'My Tasks'}
                                </h1>
                                <p className="text-sm text-blue-400">
                                    {canViewAll ? 'All team tasks and assignments' : 'Tasks assigned to you'}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate(createPageUrl('CreateTask'))}
                            className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] hover:opacity-90 text-black"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Task
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* AI Project Management Assistant */}
                <ProjectManagementAI
                    tasks={standaloneTasks}
                    users={[]}
                    formSubmissions={formTasks}
                    checklistSubmissions={checklistTasks}
                />
                
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* View Toggle */}
                    <div className="flex gap-2 p-1 bg-[#0f1419] rounded-lg border border-blue-900/20">
                        <Button
                            onClick={() => setViewMode('list')}
                            variant="ghost"
                            size="sm"
                            className={viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-950/50 text-blue-300'}
                        >
                            <LayoutList className="w-4 h-4 mr-2" />
                            List
                        </Button>
                        <Button
                            onClick={() => setViewMode('calendar')}
                            variant="ghost"
                            size="sm"
                            className={viewMode === 'calendar' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-950/50 text-blue-300'}
                        >
                            <CalendarDays className="w-4 h-4 mr-2" />
                            Calendar
                        </Button>
                    </div>
                    
                    {/* Sort By */}
                    {viewMode === 'list' && (
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[180px] bg-[#0f1419] border-blue-900/20 text-white">
                                <ArrowUpDown className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="due_date">Due Date</SelectItem>
                                <SelectItem value="priority">Priority</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                    
                    {/* Filter Buttons */}
                    {viewMode === 'list' && (
                        <div className="flex gap-2 overflow-x-auto">
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
                    )}
                </div>
                
                {/* Calendar View */}
                {viewMode === 'calendar' ? (
                    <TaskCalendar 
                        formTasks={filteredForms}
                        checklistTasks={filteredChecklists}
                    />
                ) : (
                    /* List View */
                    <Tabs defaultValue="tasks">
                        <TabsList className="w-full grid grid-cols-3">
                            <TabsTrigger value="tasks" className="gap-2">
                                <ListTodo className="w-4 h-4" />
                                Tasks ({filteredStandaloneTasks.length})
                            </TabsTrigger>
                            <TabsTrigger value="forms" className="gap-2">
                                <FileText className="w-4 h-4" />
                                Forms ({filteredForms.length})
                            </TabsTrigger>
                            <TabsTrigger value="checklists" className="gap-2">
                                <CheckSquare className="w-4 h-4" />
                                Checklists ({filteredChecklists.length})
                            </TabsTrigger>
                        </TabsList>
                    
                    <TabsContent value="tasks" className="space-y-4 mt-4">
                        {filteredStandaloneTasks.length > 0 ? (
                            filteredStandaloneTasks.map((task, idx) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <TaskCard task={task} />
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-blue-400/60">
                                <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No tasks found</p>
                                <Button
                                    onClick={() => navigate(createPageUrl('CreateTask'))}
                                    className="mt-4 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] hover:opacity-90 text-black"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Task
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                    
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
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-white mb-2">{task.form_title}</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge className={priorityColors[task.priority || 'medium']}>
                                                            {task.priority || 'medium'}
                                                        </Badge>
                                                        <TaskReminderBadge dueDate={task.due_date} />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-3 text-sm text-blue-300">
                                                {task.due_date && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {format(new Date(task.due_date), 'MMM d, yyyy')}
                                                    </div>
                                                )}
                                                {task.assigned_to_email && (
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-4 h-4" />
                                                        {task.assigned_to_email}
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
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-white mb-2">{task.checklist_title}</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge className={priorityColors[task.priority || 'medium']}>
                                                            {task.priority || 'medium'}
                                                        </Badge>
                                                        <Badge className="bg-blue-500/20 text-blue-400">
                                                            {task.completion_percentage || 0}% complete
                                                        </Badge>
                                                        <TaskReminderBadge dueDate={task.due_date} />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-3 text-sm text-blue-300">
                                                {task.due_date && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {format(new Date(task.due_date), 'MMM d, yyyy')}
                                                    </div>
                                                )}
                                                {task.assigned_to_email && (
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-4 h-4" />
                                                        {task.assigned_to_email}
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
                )}
            </div>
        </div>
    );
}