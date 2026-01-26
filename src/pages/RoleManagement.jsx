import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Edit, Trash2, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import RoleGuard from '@/components/auth/RoleGuard';

export default function RoleManagement() {
    return (
        <RoleGuard allowedRoles={['admin']}>
            <RoleManagementContent />
        </RoleGuard>
    );
}

function RoleManagementContent() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const queryClient = useQueryClient();

    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: () => httpClient.entities.Role.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => httpClient.entities.Role.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['roles']);
            setDialogOpen(false);
            toast.success('Role created');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => httpClient.entities.Role.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['roles']);
            setDialogOpen(false);
            setEditingRole(null);
            toast.success('Role updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => httpClient.entities.Role.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['roles']);
            toast.success('Role deleted');
        }
    });

    const handleEdit = (role) => {
        setEditingRole(role);
        setDialogOpen(true);
    };

    const handleDelete = (role) => {
        if (role.is_system_role) {
            toast.error('Cannot delete system role');
            return;
        }
        if (confirm(`Delete role "${role.name}"?`)) {
            deleteMutation.mutate(role.id);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Settings')}>
                                <Button variant="ghost" size="icon" className="rounded-full text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">Role Management</h1>
                                <p className="text-sm text-blue-400">Define custom roles and permissions</p>
                            </div>
                        </div>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black" onClick={() => setEditingRole(null)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Role
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0f1419] border-blue-900/20">
                                <DialogHeader>
                                    <DialogTitle className="text-white">{editingRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
                                </DialogHeader>
                                <RoleForm
                                    role={editingRole}
                                    onSubmit={(data) => {
                                        if (editingRole) {
                                            updateMutation.mutate({ id: editingRole.id, data });
                                        } else {
                                            createMutation.mutate(data);
                                        }
                                    }}
                                    onCancel={() => {
                                        setDialogOpen(false);
                                        setEditingRole(null);
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid gap-4">
                    {roles.map((role) => (
                        <Card key={role.id} className="bg-[#0f1419] border-blue-900/20">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-[#FF8C00]" />
                                        <div>
                                            <CardTitle className="text-white flex items-center gap-2">
                                                {role.name}
                                                {role.is_system_role && <Badge className="bg-blue-500/20 text-blue-400">System</Badge>}
                                            </CardTitle>
                                            <p className="text-sm text-blue-400/70 mt-1">{role.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(role)} className="text-blue-400">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        {!role.is_system_role && (
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(role)} className="text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <PermissionSummary permissions={role.permissions} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

function RoleForm({ role, onSubmit, onCancel }) {
    const [formData, setFormData] = useState(role || {
        name: '',
        description: '',
        permissions: {
            forms: { view: false, create: false, edit: false, delete: false, submit: false },
            checklists: { view: false, create: false, edit: false, delete: false, submit: false },
            tasks: { view: false, create: false, edit: false, delete: false },
            documents: { view: false, upload: false, edit: false, delete: false },
            submissions: { view_all: false, view_own: false, approve: false, reject: false },
            automations: { view: false, create: false, edit: false, delete: false },
            reports: { view: false },
            users: { manage: false },
            categories: { manage: false }
        }
    });

    const updatePermission = (category, action, value) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [category]: {
                    ...prev.permissions[category],
                    [action]: value
                }
            }
        }));
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
            <div>
                <Label className="text-blue-100">Role Name</Label>
                <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[#0a0e17] border-blue-900/20 text-white"
                    required
                />
            </div>
            <div>
                <Label className="text-blue-100">Description</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-[#0a0e17] border-blue-900/20 text-white"
                />
            </div>

            <div className="space-y-4 border-t border-blue-900/20 pt-4">
                <h3 className="font-semibold text-white">Permissions</h3>
                
                {Object.entries(formData.permissions).map(([category, perms]) => (
                    <div key={category} className="space-y-2">
                        <h4 className="text-sm font-medium text-blue-300 capitalize">{category}</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(perms).map(([action, value]) => (
                                <div key={action} className="flex items-center justify-between bg-[#0a0e17] p-2 rounded">
                                    <Label className="text-xs text-blue-200 capitalize">{action.replace('_', ' ')}</Label>
                                    <Switch
                                        checked={value}
                                        onCheckedChange={(checked) => updatePermission(category, action, checked)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onCancel} className="border-blue-900/20 text-blue-400">
                    Cancel
                </Button>
                <Button type="submit" className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black">
                    {role ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    );
}

function PermissionSummary({ permissions }) {
    const enabledPermissions = [];
    Object.entries(permissions).forEach(([category, perms]) => {
        Object.entries(perms).forEach(([action, enabled]) => {
            if (enabled) {
                enabledPermissions.push(`${category}.${action}`);
            }
        });
    });

    return (
        <div className="flex flex-wrap gap-2">
            {enabledPermissions.map((perm) => (
                <Badge key={perm} variant="outline" className="border-blue-900/30 text-blue-400 text-xs">
                    {perm.replace('.', ': ').replace('_', ' ')}
                </Badge>
            ))}
        </div>
    );
}