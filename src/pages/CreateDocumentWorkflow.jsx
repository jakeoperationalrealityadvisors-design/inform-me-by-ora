import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import RoleGuard from '@/components/auth/RoleGuard';

function CreateDocumentWorkflowContent() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [workflow, setWorkflow] = useState({
        name: '',
        description: '',
        trigger_type: 'document_uploaded',
        trigger_config: { entity_type: 'document' },
        actions: [],
        enabled: true
    });

    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: () => httpClient.entities.User.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => httpClient.entities.AutomationRule.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['document-workflows']);
            toast.success('Workflow created');
            navigate(createPageUrl('DocumentWorkflows'));
        }
    });

    const addAction = (type) => {
        const newAction = { type, config: {} };
        
        if (type === 'send_notification') {
            newAction.config = { message: 'Document requires your attention' };
        } else if (type === 'send_email') {
            newAction.config = { subject: 'Document Update', body: 'A document has been updated' };
        } else if (type === 'update_status') {
            newAction.config = { new_status: 'active' };
        } else if (type === 'assign_task') {
            newAction.config = { title: 'Review document', assigned_to_email: '' };
        }
        
        setWorkflow({ ...workflow, actions: [...workflow.actions, newAction] });
    };

    const updateAction = (index, field, value) => {
        const newActions = [...workflow.actions];
        newActions[index].config[field] = value;
        setWorkflow({ ...workflow, actions: newActions });
    };

    const removeAction = (index) => {
        setWorkflow({ ...workflow, actions: workflow.actions.filter((_, i) => i !== index) });
    };

    const handleSubmit = () => {
        if (!workflow.name.trim()) {
            toast.error('Please enter a workflow name');
            return;
        }
        if (workflow.actions.length === 0) {
            toast.error('Please add at least one action');
            return;
        }
        createMutation.mutate(workflow);
    };

    const actionTypes = [
        { value: 'send_notification', label: 'Send Notification' },
        { value: 'send_email', label: 'Send Email' },
        { value: 'assign_task', label: 'Create Task' },
        { value: 'update_status', label: 'Update Status' },
        { value: 'add_comment', label: 'Add Comment' }
    ];

    const triggerTypes = [
        { value: 'document_uploaded', label: 'Document Uploaded' },
        { value: 'document_updated', label: 'Document Updated' },
        { value: 'document_status_changed', label: 'Status Changed' },
        { value: 'document_approved', label: 'Document Approved' },
        { value: 'document_rejected', label: 'Document Rejected' }
    ];

    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('DocumentWorkflows')}>
                                <Button variant="ghost" size="icon" className="rounded-full text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <h1 className="text-xl font-bold text-white">Create Workflow</h1>
                        </div>
                        <Button
                            onClick={handleSubmit}
                            disabled={createMutation.isPending}
                            className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save Workflow
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Basic Info */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white">Workflow Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-white">Name *</Label>
                            <Input
                                value={workflow.name}
                                onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                                placeholder="Document Approval Process"
                                className="bg-[#0a0e17] border-blue-900/30 text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-white">Description</Label>
                            <Textarea
                                value={workflow.description}
                                onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                                placeholder="Automatically notify team when documents are uploaded"
                                className="bg-[#0a0e17] border-blue-900/30 text-white"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Trigger */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white">When should this run?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Label className="text-white mb-2">Trigger Event *</Label>
                        <Select
                            value={workflow.trigger_type}
                            onValueChange={(val) => setWorkflow({ ...workflow, trigger_type: val })}
                        >
                            <SelectTrigger className="bg-[#0a0e17] border-blue-900/30 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {triggerTypes.map(t => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white">Actions</CardTitle>
                            <Select onValueChange={addAction}>
                                <SelectTrigger className="w-48 bg-[#0a0e17] border-blue-900/30 text-white">
                                    <SelectValue placeholder="Add Action" />
                                </SelectTrigger>
                                <SelectContent>
                                    {actionTypes.map(t => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {workflow.actions.length === 0 ? (
                            <p className="text-blue-400 text-center py-4">No actions yet. Add one above.</p>
                        ) : (
                            workflow.actions.map((action, idx) => (
                                <div key={idx} className="bg-[#0a0e17] rounded-lg p-4 border border-blue-900/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-white">
                                            {actionTypes.find(t => t.value === action.type)?.label}
                                        </h4>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeAction(idx)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </Button>
                                    </div>

                                    {action.type === 'send_notification' && (
                                        <div>
                                            <Label className="text-white">Message</Label>
                                            <Input
                                                value={action.config.message}
                                                onChange={(e) => updateAction(idx, 'message', e.target.value)}
                                                placeholder="Document requires your attention"
                                                className="bg-[#0f1419] border-blue-900/30 text-white"
                                            />
                                        </div>
                                    )}

                                    {action.type === 'send_email' && (
                                        <div className="space-y-2">
                                            <div>
                                                <Label className="text-white">To (email)</Label>
                                                <Input
                                                    value={action.config.to}
                                                    onChange={(e) => updateAction(idx, 'to', e.target.value)}
                                                    placeholder="user@example.com"
                                                    className="bg-[#0f1419] border-blue-900/30 text-white"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-white">Subject</Label>
                                                <Input
                                                    value={action.config.subject}
                                                    onChange={(e) => updateAction(idx, 'subject', e.target.value)}
                                                    className="bg-[#0f1419] border-blue-900/30 text-white"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-white">Body</Label>
                                                <Textarea
                                                    value={action.config.body}
                                                    onChange={(e) => updateAction(idx, 'body', e.target.value)}
                                                    className="bg-[#0f1419] border-blue-900/30 text-white"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {action.type === 'assign_task' && (
                                        <div className="space-y-2">
                                            <div>
                                                <Label className="text-white">Task Title</Label>
                                                <Input
                                                    value={action.config.title}
                                                    onChange={(e) => updateAction(idx, 'title', e.target.value)}
                                                    className="bg-[#0f1419] border-blue-900/30 text-white"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-white">Assign To</Label>
                                                <Select
                                                    value={action.config.assigned_to_email}
                                                    onValueChange={(val) => updateAction(idx, 'assigned_to_email', val)}
                                                >
                                                    <SelectTrigger className="bg-[#0f1419] border-blue-900/30 text-white">
                                                        <SelectValue placeholder="Select user" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {users.map(u => (
                                                            <SelectItem key={u.id} value={u.email}>
                                                                {u.full_name || u.email}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    )}

                                    {action.type === 'update_status' && (
                                        <div>
                                            <Label className="text-white">New Status</Label>
                                            <Select
                                                value={action.config.new_status}
                                                onValueChange={(val) => updateAction(idx, 'new_status', val)}
                                            >
                                                <SelectTrigger className="bg-[#0f1419] border-blue-900/30 text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="archived">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {action.type === 'add_comment' && (
                                        <div>
                                            <Label className="text-white">Comment</Label>
                                            <Textarea
                                                value={action.config.comment}
                                                onChange={(e) => updateAction(idx, 'comment', e.target.value)}
                                                placeholder="Document processed automatically"
                                                className="bg-[#0f1419] border-blue-900/30 text-white"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function CreateDocumentWorkflow() {
    return (
        <RoleGuard allowedRoles={['admin', 'manager']} fallbackPath="Documents">
            <CreateDocumentWorkflowContent />
        </RoleGuard>
    );
}