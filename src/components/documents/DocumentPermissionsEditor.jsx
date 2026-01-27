import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, X, UserPlus } from 'lucide-react';

export default function DocumentPermissionsEditor({ currentPermissions = {}, onPermissionsUpdate, trigger }) {
    const [open, setOpen] = useState(false);
    const [permissions, setPermissions] = useState(currentPermissions);
    const [selectedUser, setSelectedUser] = useState('');

    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: () => httpClient.entities.User.list(),
        enabled: open
    });

    const addUser = (permission) => {
        if (!selectedUser) return;
        
        const newPermissions = { ...permissions };
        if (!newPermissions[permission]) {
            newPermissions[permission] = [];
        }
        
        if (!newPermissions[permission].includes(selectedUser)) {
            newPermissions[permission] = [...newPermissions[permission], selectedUser];
        }
        
        setPermissions(newPermissions);
        setSelectedUser('');
    };

    const removeUser = (permission, email) => {
        const newPermissions = { ...permissions };
        newPermissions[permission] = (newPermissions[permission] || []).filter(e => e !== email);
        setPermissions(newPermissions);
    };

    const togglePublic = (checked) => {
        setPermissions({ ...permissions, is_public: checked });
    };

    const handleSave = () => {
        onPermissionsUpdate(permissions);
        setOpen(false);
    };

    const getUserName = (email) => {
        const user = users.find(u => u.email === email);
        return user?.full_name || email;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <Shield className="w-4 h-4" />
                        Permissions
                        {permissions.is_public && (
                            <Badge className="ml-1 bg-green-600 text-white">Public</Badge>
                        )}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Document Permissions</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Public Access */}
                    <div className="flex items-center justify-between p-4 bg-blue-950/40 rounded-lg border border-blue-900/30">
                        <div>
                            <Label className="text-base">Public Access</Label>
                            <p className="text-sm text-blue-300">Allow anyone with the link to view this document</p>
                        </div>
                        <Switch
                            checked={permissions.is_public || false}
                            onCheckedChange={togglePublic}
                        />
                    </div>

                    {/* Add User */}
                    <div className="space-y-3">
                        <Label>Add User</Label>
                        <div className="flex gap-2">
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(user => (
                                        <SelectItem key={user.email} value={user.email}>
                                            {user.full_name || user.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => addUser('can_view')}
                                disabled={!selectedUser}
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add
                            </Button>
                        </div>
                    </div>

                    {/* View Permission */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Label className="text-base">Can View</Label>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {(permissions.can_view || []).length} user{(permissions.can_view || []).length !== 1 ? 's' : ''}
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            {(permissions.can_view || []).map(email => (
                                <div key={email} className="flex items-center justify-between p-3 bg-[#0f1419] rounded-lg border border-blue-900/30">
                                    <span className="text-sm">{getUserName(email)}</span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                if (!(permissions.can_edit || []).includes(email)) {
                                                    addUser('can_edit');
                                                    setSelectedUser(email);
                                                }
                                            }}
                                            className="text-xs"
                                        >
                                            {(permissions.can_edit || []).includes(email) ? '✓ Edit' : '+ Edit'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                if (!(permissions.can_delete || []).includes(email)) {
                                                    addUser('can_delete');
                                                    setSelectedUser(email);
                                                }
                                            }}
                                            className="text-xs"
                                        >
                                            {(permissions.can_delete || []).includes(email) ? '✓ Delete' : '+ Delete'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                removeUser('can_view', email);
                                                removeUser('can_edit', email);
                                                removeUser('can_delete', email);
                                            }}
                                        >
                                            <X className="w-4 h-4 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {(permissions.can_view || []).length === 0 && (
                                <p className="text-sm text-blue-400/70 text-center py-4">No users added yet</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        Save Permissions
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}