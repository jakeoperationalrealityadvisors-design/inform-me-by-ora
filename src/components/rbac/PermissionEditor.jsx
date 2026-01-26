import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, CheckSquare, ListTodo, FolderOpen, Zap, Shield } from 'lucide-react';

const permissionGroups = [
    {
        name: 'Forms',
        icon: FileText,
        permissions: [
            { key: 'can_view_forms', label: 'View Forms', description: 'View form templates' },
            { key: 'can_create_forms', label: 'Create Forms', description: 'Create new form templates' },
            { key: 'can_edit_forms', label: 'Edit Forms', description: 'Modify existing form templates' },
            { key: 'can_delete_forms', label: 'Delete Forms', description: 'Remove form templates' }
        ]
    },
    {
        name: 'Checklists',
        icon: CheckSquare,
        permissions: [
            { key: 'can_view_checklists', label: 'View Checklists', description: 'View checklist templates' },
            { key: 'can_create_checklists', label: 'Create Checklists', description: 'Create new checklist templates' },
            { key: 'can_edit_checklists', label: 'Edit Checklists', description: 'Modify existing checklist templates' },
            { key: 'can_delete_checklists', label: 'Delete Checklists', description: 'Remove checklist templates' }
        ]
    },
    {
        name: 'Tasks',
        icon: ListTodo,
        permissions: [
            { key: 'can_view_tasks', label: 'View Tasks', description: 'View all tasks' },
            { key: 'can_create_tasks', label: 'Create Tasks', description: 'Create new tasks' },
            { key: 'can_edit_tasks', label: 'Edit Tasks', description: 'Modify existing tasks' },
            { key: 'can_delete_tasks', label: 'Delete Tasks', description: 'Remove tasks' }
        ]
    },
    {
        name: 'Documents',
        icon: FolderOpen,
        permissions: [
            { key: 'can_view_documents', label: 'View Documents', description: 'View documents' },
            { key: 'can_upload_documents', label: 'Upload Documents', description: 'Upload new documents' },
            { key: 'can_edit_documents', label: 'Edit Documents', description: 'Modify document details' },
            { key: 'can_delete_documents', label: 'Delete Documents', description: 'Remove documents' }
        ]
    },
    {
        name: 'Automations',
        icon: Zap,
        permissions: [
            { key: 'can_view_automations', label: 'View Automations', description: 'View automation rules' },
            { key: 'can_create_automations', label: 'Create Automations', description: 'Create new automation rules' },
            { key: 'can_edit_automations', label: 'Edit Automations', description: 'Modify existing automation rules' },
            { key: 'can_delete_automations', label: 'Delete Automations', description: 'Remove automation rules' }
        ]
    },
    {
        name: 'System',
        icon: Shield,
        permissions: [
            { key: 'can_view_reports', label: 'View Reports', description: 'Access analytics and reports' },
            { key: 'can_manage_users', label: 'Manage Users', description: 'Invite and manage users' },
            { key: 'can_view_all_submissions', label: 'View All Submissions', description: 'See all form/checklist submissions' },
            { key: 'can_manage_categories', label: 'Manage Categories', description: 'Create and edit categories' },
            { key: 'can_view_activity_log', label: 'View Activity Log', description: 'Access system activity logs' }
        ]
    }
];

export default function PermissionEditor({ permissions = {}, onChange, disabled = false }) {
    const [localPermissions, setLocalPermissions] = useState(permissions);

    const handleToggle = (key, value) => {
        const updated = { ...localPermissions, [key]: value };
        setLocalPermissions(updated);
        onChange(updated);
    };

    const toggleGroup = (groupPermissions, value) => {
        const updated = { ...localPermissions };
        groupPermissions.forEach(perm => {
            updated[perm.key] = value;
        });
        setLocalPermissions(updated);
        onChange(updated);
    };

    const isGroupEnabled = (groupPermissions) => {
        return groupPermissions.every(perm => localPermissions[perm.key] === true);
    };

    return (
        <Card className="bg-[#0a0e17] border-blue-900/20">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Custom Permissions
                </CardTitle>
                <p className="text-sm text-blue-400 mt-1">
                    Override default role permissions for this user
                </p>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="space-y-2">
                    {permissionGroups.map((group) => {
                        const Icon = group.icon;
                        const groupEnabled = isGroupEnabled(group.permissions);
                        
                        return (
                            <AccordionItem 
                                key={group.name} 
                                value={group.name}
                                className="border border-blue-900/20 rounded-lg overflow-hidden"
                            >
                                <AccordionTrigger className="px-4 hover:bg-blue-950/20 hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-5 h-5 text-blue-400" />
                                            <span className="text-white font-medium">{group.name}</span>
                                        </div>
                                        <Switch
                                            checked={groupEnabled}
                                            onCheckedChange={(checked) => toggleGroup(group.permissions, checked)}
                                            onClick={(e) => e.stopPropagation()}
                                            disabled={disabled}
                                        />
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4">
                                    <div className="space-y-3 pt-2">
                                        {group.permissions.map((perm) => (
                                            <div key={perm.key} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#0f1419] border border-blue-900/10">
                                                <div className="flex-1">
                                                    <Label className="text-blue-100 font-medium cursor-pointer">
                                                        {perm.label}
                                                    </Label>
                                                    <p className="text-xs text-blue-400/60 mt-0.5">
                                                        {perm.description}
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={localPermissions[perm.key] === true}
                                                    onCheckedChange={(checked) => handleToggle(perm.key, checked)}
                                                    disabled={disabled}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
}