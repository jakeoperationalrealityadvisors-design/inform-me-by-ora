import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, GripVertical, Trash2, Edit2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import RoleGuard from '@/components/auth/RoleGuard';

export default function ManageDailyTasks() {
    return (
        <RoleGuard allowedRoles={['admin']}>
            <ManageDailyTasksContent />
        </RoleGuard>
    );
}

function ManageDailyTasksContent() {
    const [open, setOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', category: '' });
    const queryClient = useQueryClient();
    
    const { data: dailyTasks = [] } = useQuery({
        queryKey: ['daily-tasks'],
        queryFn: () => base44.entities.DailyTask.filter({ active: true }, 'order')
    });
    
    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.DailyTask.create({
            ...data,
            order: dailyTasks.length
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['daily-tasks']);
            setOpen(false);
            resetForm();
        }
    });
    
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.DailyTask.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['daily-tasks']);
            setOpen(false);
            resetForm();
        }
    });
    
    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.DailyTask.update(id, { active: false }),
        onSuccess: () => {
            queryClient.invalidateQueries(['daily-tasks']);
        }
    });
    
    const reorderMutation = useMutation({
        mutationFn: async (items) => {
            await Promise.all(
                items.map((item, index) => 
                    base44.entities.DailyTask.update(item.id, { order: index })
                )
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['daily-tasks']);
        }
    });
    
    const handleDragEnd = (result) => {
        if (!result.destination) return;
        
        const items = Array.from(dailyTasks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        queryClient.setQueryData(['daily-tasks'], items);
        reorderMutation.mutate(items);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTask) {
            updateMutation.mutate({ id: editingTask.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };
    
    const handleEdit = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            category: task.category || ''
        });
        setOpen(true);
    };
    
    const resetForm = () => {
        setFormData({ title: '', description: '', category: '' });
        setEditingTask(null);
    };
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('DailyTasks')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">Manage Daily Tasks</h1>
                                <p className="text-sm text-blue-400">Configure recurring daily checklist</p>
                            </div>
                        </div>
                        <Dialog open={open} onOpenChange={(isOpen) => {
                            setOpen(isOpen);
                            if (!isOpen) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Task
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#0f1419] border-blue-900/20">
                                <DialogHeader>
                                    <DialogTitle className="text-white">
                                        {editingTask ? 'Edit Task' : 'Add Daily Task'}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label className="text-blue-300">Title</Label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Task title"
                                            className="bg-[#0a0e17] border-blue-900/20 text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-blue-300">Description</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Task description"
                                            className="bg-[#0a0e17] border-blue-900/20 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-blue-300">Category</Label>
                                        <Input
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            placeholder="e.g., Morning, Safety, Cleanup"
                                            className="bg-[#0a0e17] border-blue-900/20 text-white"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                            {editingTask ? 'Update' : 'Create'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto px-4 py-6">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="tasks">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                {dailyTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="bg-[#0f1419] border border-blue-900/20 rounded-xl p-4"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div {...provided.dragHandleProps} className="mt-1">
                                                        <GripVertical className="w-5 h-5 text-blue-400/50" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-white">{task.title}</h3>
                                                        {task.description && (
                                                            <p className="text-sm text-blue-300/70 mt-1">{task.description}</p>
                                                        )}
                                                        {task.category && (
                                                            <span className="inline-block mt-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                                                {task.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(task)}
                                                            className="hover:bg-blue-950/50 text-blue-400"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => deleteMutation.mutate(task.id)}
                                                            className="hover:bg-red-950/50 text-red-400"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                
                {dailyTasks.length === 0 && (
                    <div className="text-center py-12 text-blue-400/60">
                        No daily tasks yet. Click "Add Task" to create one.
                    </div>
                )}
            </div>
        </div>
    );
}