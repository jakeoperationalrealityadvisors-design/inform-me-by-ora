import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Flag, CheckCircle2, Clock, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function TaskCard({ task, onEdit }) {
    const queryClient = useQueryClient();

    const priorityColors = {
        low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };

    const statusColors = {
        todo: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
        in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

    const updateStatusMutation = useMutation({
        mutationFn: (newStatus) => base44.entities.Task.update(task.id, { 
            status: newStatus,
            ...(newStatus === 'completed' ? { completed_date: new Date().toISOString() } : {})
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task status updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => base44.entities.Task.delete(task.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task deleted');
        }
    });

    return (
        <Card className={`bg-white dark:bg-[#0a0e17] border-slate-200 dark:border-blue-900/30 hover:shadow-lg transition-all ${
            isOverdue ? 'border-l-4 border-l-red-500' : ''
        }`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-[#FF8C00] truncate">
                                {task.title}
                            </h3>
                            {isOverdue && (
                                <Badge className="bg-red-500 text-white text-xs">Overdue</Badge>
                            )}
                        </div>

                        {task.description && (
                            <p className="text-sm text-slate-600 dark:text-[#FF8C00]/70 mb-3 line-clamp-2">
                                {task.description}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={priorityColors[task.priority]}>
                                <Flag className="w-3 h-3 mr-1" />
                                {task.priority}
                            </Badge>
                            <Badge className={statusColors[task.status]}>
                                {task.status.replace('_', ' ')}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-[#FF8C00]/70">
                            {task.assigned_to_name && (
                                <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span>{task.assigned_to_name}</span>
                                </div>
                            )}
                            {task.due_date && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                                </div>
                            )}
                            {task.completed_date && (
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Completed {format(new Date(task.completed_date), 'MMM d')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        {task.status !== 'completed' && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateStatusMutation.mutate(
                                    task.status === 'todo' ? 'in_progress' : 'completed'
                                )}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                            </Button>
                        )}
                        {onEdit && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onEdit(task)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate()}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}