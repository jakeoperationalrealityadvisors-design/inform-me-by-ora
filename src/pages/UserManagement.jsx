import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, UserPlus, Mail, Shield, Users, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import RoleGuard from '@/components/auth/RoleGuard';
import { toast } from 'sonner';

export default function UserManagement() {
    return (
        <RoleGuard allowedRoles={['admin']}>
            <UserManagementContent />
        </RoleGuard>
    );
}

function UserManagementContent() {
    const [search, setSearch] = useState('');
    const [inviteOpen, setInviteOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const queryClient = useQueryClient();
    
    const { data: users = [] } = useQuery({
        queryKey: ['all-users'],
        queryFn: () => base44.entities.User.list()
    });
    
    const inviteMutation = useMutation({
        mutationFn: ({ email, role }) => base44.users.inviteUser(email, role),
        onSuccess: () => {
            toast.success('User invited successfully');
            setInviteOpen(false);
            queryClient.invalidateQueries(['all-users']);
        },
        onError: (error) => {
            toast.error('Failed to invite user');
        }
    });
    
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
        onSuccess: () => {
            toast.success('User updated successfully');
            setEditingUser(null);
            queryClient.invalidateQueries(['all-users']);
        }
    });
    
    const filteredUsers = users.filter(u => 
        !search || 
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(search.toLowerCase())
    );
    
    const roleColors = {
        admin: 'bg-purple-500/10 text-purple-400',
        user: 'bg-blue-500/10 text-blue-400'
    };
    
    const teamRoleColors = {
        manager: 'bg-green-500/10 text-green-400',
        team_member: 'bg-slate-500/10 text-slate-400'
    };
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Home')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">User Management</h1>
                                <p className="text-sm text-blue-400">Manage team members and permissions</p>
                            </div>
                        </div>
                        
                        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Invite User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#0f1419] border-blue-900/20">
                                <DialogHeader>
                                    <DialogTitle className="text-white">Invite New User</DialogTitle>
                                </DialogHeader>
                                <InviteUserForm 
                                    onSubmit={(data) => inviteMutation.mutate(data)}
                                    isLoading={inviteMutation.isPending}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
            
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/60" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users by name or email..."
                        className="pl-10 bg-[#0f1419] border-blue-900/20 text-white"
                    />
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0f1419] border border-blue-900/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-950/50 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-400">Total Users</p>
                                <p className="text-2xl font-bold text-white">{users.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-[#0f1419] border border-blue-900/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-950/50 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-400">Admins</p>
                                <p className="text-2xl font-bold text-white">
                                    {users.filter(u => u.role === 'admin').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-[#0f1419] border border-blue-900/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-950/50 flex items-center justify-center">
                                <Users className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-400">Managers</p>
                                <p className="text-2xl font-bold text-white">
                                    {users.filter(u => u.team_role === 'manager').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* User List */}
                <div className="bg-[#0f1419] border border-blue-900/20 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-blue-900/20">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-blue-400">User</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-blue-400">Role</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-blue-400">Team Role</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-blue-400">Department</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-blue-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-blue-900/20 last:border-0 hover:bg-blue-950/20">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-white">{user.full_name || 'No name'}</p>
                                                <p className="text-sm text-blue-400/70">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={roleColors[user.role] || roleColors.user}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.team_role ? (
                                                <Badge className={teamRoleColors[user.team_role]}>
                                                    {user.team_role?.replace('_', ' ')}
                                                </Badge>
                                            ) : (
                                                <span className="text-blue-400/40">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-blue-100">
                                                {user.department || <span className="text-blue-400/40">—</span>}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingUser(user)}
                                                className="text-blue-400 hover:bg-blue-950/50"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12 text-blue-400/60">
                                No users found
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Edit User Dialog */}
            <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                <DialogContent className="bg-[#0f1419] border-blue-900/20">
                    <DialogHeader>
                        <DialogTitle className="text-white">Edit User</DialogTitle>
                    </DialogHeader>
                    {editingUser && (
                        <EditUserForm
                            user={editingUser}
                            onSubmit={(data) => updateMutation.mutate({ id: editingUser.id, data })}
                            isLoading={updateMutation.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function InviteUserForm({ onSubmit, isLoading }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ email, role });
        setEmail('');
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label className="text-blue-100">Email Address</Label>
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="bg-[#0a0e17] border-blue-900/20 text-white"
                />
            </div>
            
            <div>
                <Label className="text-blue-100">App Role</Label>
                <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="bg-[#0a0e17] border-blue-900/20 text-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                <Mail className="w-4 h-4 mr-2" />
                Send Invitation
            </Button>
        </form>
    );
}

function EditUserForm({ user, onSubmit, isLoading }) {
    const [teamRole, setTeamRole] = useState(user.team_role || '');
    const [department, setDepartment] = useState(user.department || '');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ team_role: teamRole || null, department: department || null });
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label className="text-blue-100">Email</Label>
                <Input value={user.email} disabled className="bg-[#0a0e17] border-blue-900/20 text-blue-400/60" />
            </div>
            
            <div>
                <Label className="text-blue-100">Team Role</Label>
                <Select value={teamRole} onValueChange={setTeamRole}>
                    <SelectTrigger className="bg-[#0a0e17] border-blue-900/20 text-white">
                        <SelectValue placeholder="Select team role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={null}>None</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="team_member">Team Member</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div>
                <Label className="text-blue-100">Department</Label>
                <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g., Construction, Electrical, HVAC"
                    className="bg-[#0a0e17] border-blue-900/20 text-white"
                />
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                Save Changes
            </Button>
        </form>
    );
}