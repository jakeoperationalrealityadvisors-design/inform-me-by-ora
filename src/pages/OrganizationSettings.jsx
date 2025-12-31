import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Building2, Copy, Users, Calendar, ArrowLeft, Crown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function OrganizationSettings() {
    const queryClient = useQueryClient();
    const [copied, setCopied] = useState(false);
    
    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });
    
    const { data: organization } = useQuery({
        queryKey: ['organization', user?.organization_id],
        queryFn: () => base44.entities.Organization.filter({ id: user.organization_id }).then(r => r[0]),
        enabled: !!user?.organization_id
    });
    
    const { data: members = [] } = useQuery({
        queryKey: ['org-members', user?.organization_id],
        queryFn: () => base44.entities.User.filter({ organization_id: user.organization_id }),
        enabled: !!user?.organization_id
    });
    
    const isOwner = user?.team_role === 'owner';
    
    const copyInviteCode = () => {
        navigator.clipboard.writeText(organization?.invite_code);
        setCopied(true);
        toast.success('Invite code copied!');
        setTimeout(() => setCopied(false), 2000);
    };
    
    const updateOrgMutation = useMutation({
        mutationFn: (data) => base44.entities.Organization.update(organization.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['organization']);
            toast.success('Organization updated');
        }
    });
    
    const removeMemberMutation = useMutation({
        mutationFn: async (userId) => {
            await base44.entities.User.update(userId, {
                organization_id: null,
                team_role: null
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['org-members']);
            toast.success('Member removed');
        }
    });
    
    if (!organization) {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
                <p className="text-white">Loading organization...</p>
            </div>
        );
    }
    
    const daysLeft = organization.trial_ends 
        ? Math.ceil((new Date(organization.trial_ends) - new Date()) / (1000 * 60 * 60 * 24))
        : 0;
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Settings')}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white">Organization Settings</h1>
                            <p className="text-sm text-blue-400">Manage your network and members</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Organization Info */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-[#FF8C00]" />
                            {organization.name}
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Owner: {organization.owner_email}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-blue-300">Plan</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-[#FF8C00] capitalize">
                                        {organization.plan_type}
                                    </Badge>
                                    {organization.plan_type === 'trial' && daysLeft > 0 && (
                                        <span className="text-xs text-blue-400">
                                            {daysLeft} days left
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <Label className="text-blue-300">Users</Label>
                                <p className="text-white mt-1">
                                    {members.length} / {organization.max_users}
                                </p>
                            </div>
                        </div>
                        
                        <div>
                            <Label className="text-blue-300">Invite Code</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    value={organization.invite_code}
                                    readOnly
                                    className="font-mono text-lg bg-[#0a0e17] text-white border-blue-900/30"
                                />
                                <Button onClick={copyInviteCode} variant="outline" className="border-blue-900/30">
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-blue-400 mt-1">
                                Share this code with team members to join your network
                            </p>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Members List */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            Team Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {members.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-[#0a0e17] rounded-lg border border-blue-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                            {member.full_name?.[0] || member.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{member.full_name || member.email}</p>
                                            <p className="text-xs text-blue-400">{member.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <Badge variant={member.team_role === 'owner' ? 'default' : 'outline'} className="capitalize">
                                            {member.team_role === 'owner' && <Crown className="w-3 h-3 mr-1" />}
                                            {member.team_role}
                                        </Badge>
                                        
                                        {isOwner && member.team_role !== 'owner' && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-500">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to remove {member.full_name || member.email} from the organization?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => removeMemberMutation.mutate(member.id)}>
                                                            Remove
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                
                {/* Trial Info */}
                {organization.plan_type === 'trial' && (
                    <Card className="bg-gradient-to-br from-orange-950/30 to-blue-950/30 border-orange-900/30">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <Calendar className="w-12 h-12 text-[#FF8C00]" />
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold mb-1">Trial Period</h3>
                                    <p className="text-blue-300 text-sm">
                                        Your trial ends on {new Date(organization.trial_ends).toLocaleDateString()}
                                    </p>
                                    {daysLeft <= 7 && daysLeft > 0 && (
                                        <p className="text-orange-400 text-xs mt-1">
                                            ⚠️ Only {daysLeft} days remaining
                                        </p>
                                    )}
                                </div>
                                <Button className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]">
                                    Upgrade Plan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}