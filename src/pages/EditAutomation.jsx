import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoleGuard from '@/components/auth/RoleGuard';
import { toast } from 'sonner';

function EditAutomationContent() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const urlParams = new URLSearchParams(window.location.search);
    const ruleId = urlParams.get('id');

    const { data: rule } = useQuery({
        queryKey: ['automation-rule', ruleId],
        queryFn: () => base44.entities.AutomationRule.filter({ id: ruleId }).then(r => r[0]),
        enabled: !!ruleId
    });

    const { data: forms = [] } = useQuery({
        queryKey: ['forms'],
        queryFn: () => base44.entities.FormTemplate.filter({ status: 'active' })
    });

    const { data: checklists = [] } = useQuery({
        queryKey: ['checklists'],
        queryFn: () => base44.entities.ChecklistTemplate.filter({ status: 'active' })
    });

    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: () => base44.entities.User.list()
    });

    const [formData, setFormData] = useState({
        name: rule?.name || '',
        description: rule?.description || '',
        trigger_type: rule?.trigger_type || 'form_submitted',
        trigger_config: rule?.trigger_config || {},
        actions: rule?.actions || [{ type: 'send_notification', config: {} }],
        enabled: rule?.enabled ?? true
    });

    React.useEffect(() => {
        if (rule) {
            setFormData({
                name: rule.name || '',
                description: rule.description || '',
                trigger_type: rule.trigger_type || 'form_submitted',
                trigger_config: rule.trigger_config || {},
                actions: rule.actions || [{ type: 'send_notification', config: {} }],
                enabled: rule.enabled ?? true
            });
        }
    }, [rule]);

    const saveMutation = useMutation({
        mutationFn: (data) => {
            if (ruleId) {
                return base44.entities.AutomationRule.update(ruleId, data);
            }
            return base44.entities.AutomationRule.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
            toast.success('Automation rule saved');
            navigate(createPageUrl('ManageAutomations'));
        }
    });

    const addAction = () => {
        setFormData({
            ...formData,
            actions: [...formData.actions, { type: 'send_notification', config: {} }]
        });
    };

    const removeAction = (index) => {
        setFormData({
            ...formData,
            actions: formData.actions.filter((_, i) => i !== index)
        });
    };

    const updateAction = (index, field, value) => {
        const newActions = [...formData.actions];
        if (field === 'type') {
            newActions[index] = { type: value, config: {} };
        } else {
            newActions[index].config[field] = value;
        }
        setFormData({ ...formData, actions: newActions });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('ManageAutomations')}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                {ruleId ? 'Edit Automation' : 'New Automation'}
                            </h1>
                            <p className="text-sm text-slate-600">Configure triggers and actions</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Rule Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Auto-assign form submissions"
                                    required
                                />
                            </div>
                            <div>
                                <Label>Description (Optional)</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What does this automation do?"
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trigger */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Trigger</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>When this happens</Label>
                                <Select 
                                    value={formData.trigger_type}
                                    onValueChange={(v) => setFormData({ ...formData, trigger_type: v, trigger_config: {} })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="form_submitted">Form Submitted</SelectItem>
                                        <SelectItem value="checklist_completed">Checklist Completed</SelectItem>
                                        <SelectItem value="document_uploaded">Document Uploaded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.trigger_type === 'form_submitted' && (
                                <div>
                                    <Label>Specific Form (Optional)</Label>
                                    <Select 
                                        value={formData.trigger_config.template_id || ''}
                                        onValueChange={(v) => setFormData({ 
                                            ...formData, 
                                            trigger_config: { ...formData.trigger_config, template_id: v || undefined }
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Any form" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={null}>Any form</SelectItem>
                                            {forms.map(form => (
                                                <SelectItem key={form.id} value={form.id}>{form.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {formData.trigger_type === 'checklist_completed' && (
                                <div>
                                    <Label>Specific Checklist (Optional)</Label>
                                    <Select 
                                        value={formData.trigger_config.template_id || ''}
                                        onValueChange={(v) => setFormData({ 
                                            ...formData, 
                                            trigger_config: { ...formData.trigger_config, template_id: v || undefined }
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Any checklist" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={null}>Any checklist</SelectItem>
                                            {checklists.map(cl => (
                                                <SelectItem key={cl.id} value={cl.id}>{cl.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Actions</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={addAction}>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Action
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.actions.map((action, index) => (
                                <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Action {index + 1}</Label>
                                        {formData.actions.length > 1 && (
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => removeAction(index)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        )}
                                    </div>

                                    <Select 
                                        value={action.type}
                                        onValueChange={(v) => updateAction(index, 'type', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="assign_task">Assign Task</SelectItem>
                                            <SelectItem value="send_notification">Send Notification</SelectItem>
                                            <SelectItem value="send_email">Send Email</SelectItem>
                                            <SelectItem value="create_followup">Create Follow-up Event</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {action.type === 'assign_task' && (
                                        <>
                                            <div>
                                                <Label>Assign To</Label>
                                                <Select 
                                                    value={action.config.assignee_email || ''}
                                                    onValueChange={(v) => updateAction(index, 'assignee_email', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select user" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {users.map(user => (
                                                            <SelectItem key={user.id} value={user.email}>
                                                                {user.full_name || user.email}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Priority</Label>
                                                <Select 
                                                    value={action.config.priority || 'medium'}
                                                    onValueChange={(v) => updateAction(index, 'priority', v)}
                                                >
                                                    <SelectTrigger>
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
                                        </>
                                    )}

                                    {action.type === 'send_notification' && (
                                        <>
                                            <div>
                                                <Label>Title</Label>
                                                <Input
                                                    value={action.config.title || ''}
                                                    onChange={(e) => updateAction(index, 'title', e.target.value)}
                                                    placeholder="Notification title"
                                                />
                                            </div>
                                            <div>
                                                <Label>Message</Label>
                                                <Textarea
                                                    value={action.config.message || ''}
                                                    onChange={(e) => updateAction(index, 'message', e.target.value)}
                                                    placeholder="Notification message"
                                                    rows={2}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {action.type === 'send_email' && (
                                        <>
                                            <div>
                                                <Label>Recipient Email</Label>
                                                <Input
                                                    type="email"
                                                    value={action.config.recipient_email || ''}
                                                    onChange={(e) => updateAction(index, 'recipient_email', e.target.value)}
                                                    placeholder="email@example.com"
                                                />
                                            </div>
                                            <div>
                                                <Label>Subject</Label>
                                                <Input
                                                    value={action.config.subject || ''}
                                                    onChange={(e) => updateAction(index, 'subject', e.target.value)}
                                                    placeholder="Email subject"
                                                />
                                            </div>
                                            <div>
                                                <Label>Body</Label>
                                                <Textarea
                                                    value={action.config.body || ''}
                                                    onChange={(e) => updateAction(index, 'body', e.target.value)}
                                                    placeholder="Email body"
                                                    rows={3}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {action.type === 'create_followup' && (
                                        <>
                                            <div>
                                                <Label>Follow-up Title</Label>
                                                <Input
                                                    value={action.config.title || ''}
                                                    onChange={(e) => updateAction(index, 'title', e.target.value)}
                                                    placeholder="Follow-up event title"
                                                />
                                            </div>
                                            <div>
                                                <Label>Days Ahead</Label>
                                                <Input
                                                    type="number"
                                                    value={action.config.days_ahead || 7}
                                                    onChange={(e) => updateAction(index, 'days_ahead', parseInt(e.target.value))}
                                                    min="1"
                                                />
                                            </div>
                                            <div>
                                                <Label>Assign To</Label>
                                                <Select 
                                                    value={action.config.assignee_email || ''}
                                                    onValueChange={(v) => updateAction(index, 'assignee_email', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select user" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {users.map(user => (
                                                            <SelectItem key={user.id} value={user.email}>
                                                                {user.full_name || user.email}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="flex gap-3 justify-end">
                        <Link to={createPageUrl('ManageAutomations')}>
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button 
                            type="submit" 
                            disabled={saveMutation.isPending}
                            className="bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saveMutation.isPending ? 'Saving...' : 'Save Automation'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function EditAutomation() {
    return (
        <RoleGuard allowedRoles={['admin', 'manager']}>
            <EditAutomationContent />
        </RoleGuard>
    );
}