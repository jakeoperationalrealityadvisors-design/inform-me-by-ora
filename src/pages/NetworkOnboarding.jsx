import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Key, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function NetworkOnboarding() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('join');
    
    // Join network state
    const [inviteCode, setInviteCode] = useState('');
    
    // Create network state
    const [orgName, setOrgName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    
    const joinMutation = useMutation({
        mutationFn: async (code) => {
            const user = await base44.auth.me();
            
            // Find organization by invite code
            const orgs = await base44.entities.Organization.filter({ invite_code: code });
            if (orgs.length === 0) {
                throw new Error('Invalid invite code');
            }
            
            const org = orgs[0];
            
            if (org.status !== 'active') {
                throw new Error('This organization is not active');
            }
            
            // Check user limit
            const orgUsers = await base44.entities.User.filter({ organization_id: org.id });
            if (orgUsers.length >= org.max_users) {
                throw new Error('Organization has reached maximum users');
            }
            
            // Update user with organization
            await base44.auth.updateMe({
                organization_id: org.id,
                team_role: 'member',
                onboarding_completed: true
            });
            
            return org;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['current-user']);
            toast.success('Successfully joined network!');
            navigate(createPageUrl('Home'));
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
    
    const createMutation = useMutation({
        mutationFn: async ({ name, email }) => {
            const user = await base44.auth.me();
            
            // Generate unique invite code
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            
            // Calculate trial end date (30 days)
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 30);
            
            // Create organization
            const org = await base44.entities.Organization.create({
                name,
                invite_code: code,
                owner_email: email || user.email,
                plan_type: 'trial',
                max_users: 10,
                status: 'active',
                trial_ends: trialEnd.toISOString().split('T')[0],
                settings: {
                    allow_public_signup: false,
                    require_approval: true
                }
            });
            
            // Update user as owner
            await base44.auth.updateMe({
                organization_id: org.id,
                team_role: 'owner',
                onboarding_completed: true
            });
            
            return org;
        },
        onSuccess: (org) => {
            queryClient.invalidateQueries(['current-user']);
            toast.success('Network created! Share your invite code with your team.');
            navigate(createPageUrl('Home'));
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#1a1f2e] flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full bg-white/95 backdrop-blur">
                <CardHeader className="text-center pb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF8C00] to-[#1E40AF] rounded-2xl flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Welcome to InForm Me</CardTitle>
                    <CardDescription className="text-base">
                        Join your organization's network or create a new one for your team
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="join" className="flex items-center gap-2">
                                <Key className="w-4 h-4" />
                                Join Network
                            </TabsTrigger>
                            <TabsTrigger value="create" className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Create Network
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="join" className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                                <p className="font-medium mb-1">Have an invite code?</p>
                                <p className="text-xs">Enter the code provided by your organization administrator to join their network.</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="invite-code">Invite Code</Label>
                                    <Input
                                        id="invite-code"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        placeholder="Enter 8-character code"
                                        className="text-center text-lg tracking-widest font-mono"
                                        maxLength={8}
                                    />
                                </div>
                                
                                <Button 
                                    onClick={() => joinMutation.mutate(inviteCode)}
                                    disabled={inviteCode.length !== 8 || joinMutation.isPending}
                                    className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                                >
                                    Join Network
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="create" className="space-y-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800">
                                <p className="font-medium mb-1">Start your own network</p>
                                <p className="text-xs">Create a private network for your organization. You'll get a 30-day free trial with up to 10 users.</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="org-name">Organization Name</Label>
                                    <Input
                                        id="org-name"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        placeholder="e.g., Acme Construction"
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="contact-email">Contact Email (Optional)</Label>
                                    <Input
                                        id="contact-email"
                                        type="email"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        placeholder="billing@example.com"
                                    />
                                </div>
                                
                                <div className="bg-slate-50 rounded-lg p-4 text-xs space-y-2">
                                    <p className="font-medium">What you'll get:</p>
                                    <ul className="space-y-1 text-slate-600">
                                        <li>✓ 30-day free trial</li>
                                        <li>✓ Up to 10 users</li>
                                        <li>✓ Private network with unique invite code</li>
                                        <li>✓ Full access to all features</li>
                                    </ul>
                                </div>
                                
                                <Button 
                                    onClick={() => createMutation.mutate({ name: orgName, email: contactEmail })}
                                    disabled={!orgName || createMutation.isPending}
                                    className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                                >
                                    Create Network
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}