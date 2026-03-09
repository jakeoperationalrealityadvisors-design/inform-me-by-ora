import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function TaskCard({ task }) {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const priorityColors = {
        low: 'bg-blue-500/20 text-blue-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        high: 'bg-orange-500/20 text-orange-400',
        urgent: 'bg-red-500/20 text-red-400'
    };

    const statusColors = {
        todo: 'bg-slate-500/20 text-slate-400',
        in_progress: 'bg-blue-500/20 text-blue-400',
        completed: 'bg-green-500/20 text-green-400',
        cancelled: 'bg-red-500/20 text-red-400'
    };

    const updateMutation = useMutation({
        mutationFn: (updates) => base44.entities.Task.update(task.id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task updated');
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
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="bg-[#0f1419] border border-blue-900/20 rounded-lg hover:border-blue-700/50 transition-all">
                <div className="flex items-center gap-3 p-3">
                    <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left">
                        {isOpen ? <ChevronDown className="w-4 h-4 text-blue-400" /> : <ChevronRight className="w-4 h-4 text-blue-400" />}
                        <span className="font-medium text-white">{task.title}</span>
                    </CollapsibleTrigger>
                    <Badge className={`${priorityColors[task.priority]} text-xs`}>{task.priority}</Badge>
                    <Badge className={`${statusColors[task.status]} text-xs`}>{task.status.replace('_', ' ')}</Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4 text-blue-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0f1419] border-blue-900/20">
                            {task.status !== 'completed' && (
                                <DropdownMenuItem onClick={() => updateMutation.mutate({ status: 'completed', completed_date: new Date().toISOString() })}>
                                    Mark Complete
                                </DropdownMenuItem>
                            )}
                            {task.status === 'todo' && (
                                <DropdownMenuItem onClick={() => updateMutation.mutate({ status: 'in_progress' })}>
                                    Start Task
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => deleteMutation.mutate()} className="text-red-400">
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <CollapsibleContent>
                    <div className="px-3 pb-3 space-y-2 border-t border-blue-900/20 mt-2 pt-2">
                        {task.description && <p className="text-sm text-blue-400/70">{task.description}</p>}
                        <div className="flex flex-wrap gap-3 text-xs text-blue-400/60">
                            {task.assigned_to_name && (
                                <span className="flex items-center gap-1"><User className="w-3 h-3" />{task.assigned_to_name}</span>
                            )}
                            {task.due_date && (
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                            )}
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}