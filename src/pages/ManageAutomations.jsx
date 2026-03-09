import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Zap, Trash2, Edit, Power, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import RoleGuard, { useUserRole } from '@/components/auth/RoleGuard';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

function ManageAutomationsContent() {
    const queryClient = useQueryClient();
    const [deleteId, setDeleteId] = useState(null);
    const { canCreateAutomations, canEditAutomations, canDeleteAutomations } = useUserRole();

    const { data: rules = [], isLoading } = useQuery({
        queryKey: ['automation-rules'],
        queryFn: () => base44.entities.AutomationRule.list('-created_date')
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, enabled }) => 
            base44.entities.AutomationRule.update(id, { enabled }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
            toast.success('Automation rule updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.AutomationRule.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
            toast.success('Automation rule deleted');
            setDeleteId(null);
        }
    });

    const triggerLabels = {
        form_submitted: 'Form Submitted',
        checklist_completed: 'Checklist Completed',
        task_created: 'Task Created',
        task_completed: 'Task Completed',
        task_overdue: 'Task Overdue',
        task_due_soon: 'Task Due Soon',
        document_uploaded: 'Document Uploaded',
        user_invited: 'User Invited',
        status_changed: 'Status Changed',
        manual_trigger: 'Manual Trigger'
    };

    const actionLabels = {
        assign_task: 'Assign Submission',
        create_task: 'Create Task',
        send_notification: 'Send Notification',
        send_email: 'Send Email',
        create_followup: 'Create Follow-up',
        update_status: 'Update Status',
        trigger_automation: 'Trigger Automation',
        add_comment: 'Add Comment',
        update_field: 'Update Field'
    };

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Settings')}>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Zap className="w-6 h-6 text-blue-600" />
                                    Automation Rules
                                </h1>
                                <p className="text-sm text-slate-600">Configure automated workflows</p>
                            </div>
                        </div>
                        {canCreateAutomations && (
                            <div className="flex gap-2">
                                <Link to={createPageUrl('AIWorkflowBuilder')}>
                                    <Button variant="outline" className="border-green-600 text-green-600 gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        AI Builder
                                    </Button>
                                </Link>
                                <Link to={createPageUrl('AutomationOptimizer')}>
                                    <Button variant="outline" className="border-purple-600 text-purple-600 gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Optimize
                                    </Button>
                                </Link>
                                <Link to={createPageUrl('EditAutomation')}>
                                    <Button className="bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white gap-2">
                                        <Plus className="w-4 h-4" />
                                        New Rule
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {isLoading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-5 w-1/3 bg-slate-200 rounded" />
                                    <div className="h-4 w-1/2 bg-slate-100 rounded" />
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : rules.length === 0 ? (
                    <Card>
                        <CardContent className="pt-12 pb-12 text-center">
                            <Zap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No automation rules yet</h3>
                            <p className="text-slate-600 mb-4">Create your first automation to streamline workflows</p>
                            <Link to={createPageUrl('EditAutomation')}>
                                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Create with AI
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {rules.map(rule => (
                            <Card key={rule.id} className={!rule.enabled ? 'opacity-60' : ''}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <CardTitle className="text-lg">{rule.name}</CardTitle>
                                                <Badge variant={rule.enabled ? 'default' : 'secondary'} className="gap-1">
                                                    <Power className="w-3 h-3" />
                                                    {rule.enabled ? 'Active' : 'Disabled'}
                                                </Badge>
                                            </div>
                                            {rule.description && (
                                                <CardDescription>{rule.description}</CardDescription>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {canEditAutomations && (
                                                <Switch
                                                    checked={rule.enabled}
                                                    onCheckedChange={(enabled) => 
                                                        toggleMutation.mutate({ id: rule.id, enabled })
                                                    }
                                                />
                                            )}
                                            {canEditAutomations && (
                                                <Link to={createPageUrl(`EditAutomation?id=${rule.id}`)}>
                                                    <Button variant="ghost" size="icon">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            )}
                                            {canDeleteAutomations && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => setDeleteId(rule.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">TRIGGER</p>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                {triggerLabels[rule.trigger_type] || rule.trigger_type}
                                            </Badge>
                                        </div>
                                        {rule.conditions && rule.conditions.length > 0 && (
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">CONDITIONS</p>
                                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                    {rule.conditions.length} condition{rule.conditions.length > 1 ? 's' : ''}
                                                </Badge>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">ACTIONS</p>
                                            <div className="flex flex-wrap gap-2">
                                                {rule.actions?.map((action, idx) => (
                                                    <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        {actionLabels[action.type] || action.type}
                                                        {action.delay_minutes > 0 && (
                                                            <span className="ml-1 text-xs opacity-70">({action.delay_minutes}m delay)</span>
                                                        )}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        {rule.execution_count > 0 && (
                                            <div className="text-xs text-slate-500">
                                                Executed {rule.execution_count} time{rule.execution_count > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Automation Rule</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this automation rule? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate(deleteId)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function ManageAutomations() {
    return (
        <RoleGuard requiredPermission="can_view_automations">
            <ManageAutomationsContent />
        </RoleGuard>
    );
}