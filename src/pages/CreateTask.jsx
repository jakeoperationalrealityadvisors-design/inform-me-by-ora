import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function CreateTask() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        assigned_to_email: '',
        assigned_to_name: '',
        due_date: '',
        priority: 'medium',
        status: 'todo',
        category_id: '',
        tags: []
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => base44.entities.Category.list()
    });

    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: () => base44.entities.User.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Task.create(data),
        onSuccess: async (task) => {
            await logActivity({
                action_type: 'task_created',
                entity_type: 'task',
                entity_id: task.id,
                entity_title: task.title,
                description: `Created task: ${task.title}`,
                metadata: { assigned_to: task.assigned_to_email, priority: task.priority }
            });
            
            // Trigger automations for task creation
            await base44.functions.invoke('executeAutomations', {
                trigger_type: 'task_created',
                trigger_data: {
                    task_id: task.id,
                    title: task.title,
                    priority: task.priority,
                    assigned_to_email: task.assigned_to_email
                }
            });
            
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            
            // Send notification to assigned user
            if (task.assigned_to_email) {
                await base44.entities.Notification.create({
                    user_email: task.assigned_to_email,
                    title: 'New Task Assigned',
                    message: `You have been assigned: ${task.title}`,
                    type: 'task_assigned',
                    link_page: 'MyTasks'
                });
            }
            
            toast.success('Task created successfully');
            navigate(createPageUrl('MyTasks'));
        },
        onError: (error) => {
            toast.error('Failed to create task');
            console.error(error);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!taskData.title || !taskData.assigned_to_email) {
            toast.error('Title and assignee are required');
            return;
        }

        await createMutation.mutateAsync(taskData);
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-[#0a0e17] pb-20 md:pb-6">
            <div className="bg-white dark:bg-[#0a0e17] border-b border-slate-200 dark:border-blue-900/30 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(createPageUrl('MyTasks'))}
                            className="text-slate-700 dark:text-[#FF8C00]"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-[#FF8C00]">
                                Create New Task
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-[#FF8C00]/70">
                                Assign and track work items
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit}>
                    <Card className="bg-white dark:bg-[#0a0e17] border-slate-200 dark:border-blue-900/30">
                        <CardHeader>
                            <CardTitle className="text-slate-900 dark:text-[#FF8C00]">Task Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-slate-700 dark:text-[#FF8C00]">Title *</Label>
                                <Input
                                    value={taskData.title}
                                    onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                                    placeholder="Enter task title"
                                    required
                                    className="border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00]"
                                />
                            </div>

                            <div>
                                <Label className="text-slate-700 dark:text-[#FF8C00]">Description</Label>
                                <Textarea
                                    value={taskData.description}
                                    onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                                    placeholder="Enter task description"
                                    rows={4}
                                    className="border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00]"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-700 dark:text-[#FF8C00]">Assign To *</Label>
                                    <Select
                                        value={taskData.assigned_to_email}
                                        onValueChange={(value) => {
                                            const user = users.find(u => u.email === value);
                                            setTaskData({
                                                ...taskData,
                                                assigned_to_email: value,
                                                assigned_to_name: user?.full_name || ''
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00]">
                                            <SelectValue placeholder="Select user" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map(user => (
                                                <SelectItem key={user.email} value={user.email}>
                                                    {user.full_name} ({user.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-slate-700 dark:text-[#FF8C00]">Due Date</Label>
                                    <Input
                                        type="date"
                                        value={taskData.due_date}
                                        onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                                        className="border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-700 dark:text-[#FF8C00]">Priority</Label>
                                    <Select
                                        value={taskData.priority}
                                        onValueChange={(value) => setTaskData({ ...taskData, priority: value })}
                                    >
                                        <SelectTrigger className="border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-slate-700 dark:text-[#FF8C00]">Category</Label>
                                    <Select
                                        value={taskData.category_id}
                                        onValueChange={(value) => setTaskData({ ...taskData, category_id: value })}
                                    >
                                        <SelectTrigger className="border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00]">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3 justify-end mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(createPageUrl('MyTasks'))}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] hover:opacity-90 text-black"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Task
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}