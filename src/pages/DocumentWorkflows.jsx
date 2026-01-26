import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { ArrowLeft, Plus, Zap, Trash2, Edit, Power, PowerOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import RoleGuard from '@/components/auth/RoleGuard';

function DocumentWorkflowsContent() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deletingId, setDeletingId] = useState(null);

    const { data: workflows = [], isLoading } = useQuery({
        queryKey: ['document-workflows'],
        queryFn: async () => {
            const rules = await httpClient.entities.AutomationRule.list();
            return rules.filter(r => 
                r.trigger_type?.includes('document') || 
                r.trigger_config?.entity_type === 'document'
            );
        }
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, enabled }) => 
            httpClient.entities.AutomationRule.update(id, { enabled: !enabled }),
        onSuccess: () => {
            queryClient.invalidateQueries(['document-workflows']);
            toast.success('Workflow updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => httpClient.entities.AutomationRule.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['document-workflows']);
            toast.success('Workflow deleted');
            setDeletingId(null);
        }
    });

    const triggerLabels = {
        document_uploaded: 'Document Uploaded',
        document_updated: 'Document Updated',
        document_status_changed: 'Status Changed',
        document_approved: 'Document Approved',
        document_rejected: 'Document Rejected'
    };

    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Documents')}>
                                <Button variant="ghost" size="icon" className="rounded-full text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">Document Workflows</h1>
                                <p className="text-sm text-blue-400">Automate document processes</p>
                            </div>
                        </div>
                        <Link to={createPageUrl('CreateDocumentWorkflow')}>
                            <Button className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]">
                                <Plus className="w-4 h-4 mr-2" />
                                New Workflow
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="bg-[#0f1419] border-blue-900/20 animate-pulse">
                                <CardContent className="p-6">
                                    <div className="h-6 bg-blue-900/20 rounded mb-2 w-1/3" />
                                    <div className="h-4 bg-blue-900/10 rounded w-2/3" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : workflows.length === 0 ? (
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardContent className="p-12 text-center">
                            <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">No Workflows Yet</h3>
                            <p className="text-blue-400 mb-4">Create automated workflows for your documents</p>
                            <Link to={createPageUrl('CreateDocumentWorkflow')}>
                                <Button className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Workflow
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {workflows.map((workflow) => (
                            <Card key={workflow.id} className="bg-[#0f1419] border-blue-900/20">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                                                <Badge variant={workflow.enabled ? "default" : "outline"}>
                                                    {workflow.enabled ? 'Active' : 'Disabled'}
                                                </Badge>
                                            </div>
                                            {workflow.description && (
                                                <p className="text-sm text-blue-400">{workflow.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => toggleMutation.mutate({ id: workflow.id, enabled: workflow.enabled })}
                                            >
                                                {workflow.enabled ? 
                                                    <PowerOff className="w-4 h-4 text-blue-400" /> : 
                                                    <Power className="w-4 h-4 text-green-400" />
                                                }
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => navigate(createPageUrl('EditDocumentWorkflow') + `?id=${workflow.id}`)}
                                            >
                                                <Edit className="w-4 h-4 text-blue-400" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeletingId(workflow.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            <Zap className="w-3 h-3 mr-1" />
                                            {triggerLabels[workflow.trigger_type] || workflow.trigger_type}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {workflow.actions?.length || 0} Actions
                                        </Badge>
                                        {workflow.execution_count > 0 && (
                                            <Badge variant="outline" className="text-xs text-green-400">
                                                Ran {workflow.execution_count}x
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {deletingId && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="bg-[#0f1419] border-blue-900/20 max-w-md w-full mx-4">
                            <CardHeader>
                                <CardTitle className="text-white">Delete Workflow?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-blue-300">This action cannot be undone.</p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setDeletingId(null)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => deleteMutation.mutate(deletingId)}
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DocumentWorkflows() {
    return (
        <RoleGuard allowedRoles={['admin', 'manager']} fallbackPath="Documents">
            <DocumentWorkflowsContent />
        </RoleGuard>
    );
}