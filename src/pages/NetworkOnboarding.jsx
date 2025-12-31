import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building2, Users, Key, ArrowRight, CheckCircle2, Zap, Shield, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function NetworkOnboarding() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [step, setStep] = useState('welcome');
    const [selectedPath, setSelectedPath] = useState(null);
    
    // Join network state
    const [inviteCode, setInviteCode] = useState('');
    
    // Create network state
    const [orgName, setOrgName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    
    // Technical level
    const [technicalLevel, setTechnicalLevel] = useState('intermediate');
    
    const paths = [
        {
            id: 'fill',
            icon: CheckCircle2,
            title: 'Fill Forms & Checklists',
            description: 'Complete tasks assigned to you',
            level: 'beginner',
            color: 'from-green-500 to-emerald-600',
            features: ['Simple form filling', 'Task completion', 'Photo uploads']
        },
        {
            id: 'manage',
            icon: Users,
            title: 'Manage Operations',
            description: 'Oversee submissions and teams',
            level: 'intermediate',
            color: 'from-blue-500 to-cyan-600',
            features: ['Review submissions', 'Assign tasks', 'Generate reports']
        },
        {
            id: 'create',
            icon: Zap,
            title: 'Build Workflows',
            description: 'Create forms and automations',
            level: 'advanced',
            color: 'from-purple-500 to-pink-600',
            features: ['Form builder', 'Workflow automation', 'Custom templates']
        },
        {
            id: 'admin',
            icon: Shield,
            title: 'System Administration',
            description: 'Configure and optimize the platform',
            level: 'expert',
            color: 'from-orange-500 to-red-600',
            features: ['User management', 'Role configuration', 'Analytics & insights']
        }
    ];
    
    const technicalLevels = [
        { value: 'beginner', label: 'Beginner', desc: 'Show me everything step by step' },
        { value: 'intermediate', label: 'Intermediate', desc: 'Show helpful tooltips and guides' },
        { value: 'advanced', label: 'Advanced', desc: 'Minimal guidance, I learn fast' },
        { value: 'expert', label: 'Expert', desc: 'No tutorials, I know what I\'m doing' }
    ];
    
    const joinMutation = useMutation({
        mutationFn: async (code) => {
            const user = await base44.auth.me();
            
            const orgs = await base44.entities.Organization.filter({ invite_code: code });
            if (orgs.length === 0) {
                throw new Error('Invalid invite code');
            }
            
            const org = orgs[0];
            
            if (org.status !== 'active') {
                throw new Error('This organization is not active');
            }
            
            const orgUsers = await base44.entities.User.filter({ organization_id: org.id });
            if (orgUsers.length >= org.max_users) {
                throw new Error('Organization has reached maximum users');
            }
            
            await base44.auth.updateMe({
                organization_id: org.id,
                team_role: 'member',
                onboarding_completed: true,
                technical_level: technicalLevel,
                preferred_tutorial_style: technicalLevel === 'expert' ? 'none' : 'tooltips'
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
            
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 30);
            
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
            
            await base44.auth.updateMe({
                organization_id: org.id,
                team_role: 'owner',
                onboarding_completed: true,
                technical_level: technicalLevel,
                preferred_tutorial_style: technicalLevel === 'expert' ? 'none' : 'tooltips'
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
    
    if (step === 'welcome') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#1a1f2e] flex items-center justify-center p-4">
                <Card className="max-w-4xl w-full bg-white/95 backdrop-blur">
                    <CardHeader className="text-center pb-6">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#FF8C00] to-[#1E40AF] rounded-2xl flex items-center justify-center">
                            <Building2 className="w-10 h-10 text-white" />
                        </div>
                        <CardTitle className="text-3xl">Welcome to InForm Me</CardTitle>
                        <CardDescription className="text-lg">
                            What would you like to do today?
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paths.map((path) => {
                                const Icon = path.icon;
                                return (
                                    <button
                                        key={path.id}
                                        onClick={() => setSelectedPath(path.id)}
                                        className={`group relative p-6 rounded-xl border-2 transition-all text-left ${
                                            selectedPath === path.id
                                                ? 'border-[#FF8C00] bg-gradient-to-br from-orange-50 to-blue-50 shadow-lg scale-[1.02]'
                                                : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-md'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${path.color} flex items-center justify-center mb-3`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">{path.title}</h3>
                                        <p className="text-sm text-slate-600 mb-3">{path.description}</p>
                                        <div className="space-y-1">
                                            {path.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                                                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            <div className={`text-xs px-2 py-1 rounded-full ${
                                                selectedPath === path.id
                                                    ? 'bg-[#FF8C00] text-white'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {path.level}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        
                        <Button
                            onClick={() => setStep('technical')}
                            disabled={!selectedPath}
                            className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] h-12 text-base"
                        >
                            Continue
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        
                        <div className="text-center text-sm text-slate-500">
                            Don't worry, you can access all features regardless of your choice
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (step === 'technical') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#1a1f2e] flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full bg-white/95 backdrop-blur">
                    <CardHeader className="text-center pb-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">How much guidance do you need?</CardTitle>
                        <CardDescription className="text-base">
                            We'll customize your experience based on your comfort level
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <RadioGroup value={technicalLevel} onValueChange={setTechnicalLevel}>
                            <div className="space-y-3">
                                {technicalLevels.map((level) => (
                                    <label
                                        key={level.value}
                                        className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                            technicalLevel === level.value
                                                ? 'border-[#FF8C00] bg-gradient-to-br from-orange-50 to-blue-50'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                    >
                                        <RadioGroupItem value={level.value} className="mt-1" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900">{level.label}</div>
                                            <div className="text-sm text-slate-600">{level.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </RadioGroup>
                        
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setStep('welcome')}
                                variant="outline"
                                className="flex-1"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={() => setStep('network')}
                                className="flex-1 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                            >
                                Continue
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#1a1f2e] flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full bg-white/95 backdrop-blur">
                <CardHeader className="text-center pb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF8C00] to-[#1E40AF] rounded-2xl flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Join or Create a Network</CardTitle>
                    <CardDescription className="text-base">
                        Connect with your organization or start your own
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={() => setStep('join')}
                            variant="outline"
                            className="h-24 flex-col gap-2 border-2 hover:border-[#FF8C00] hover:bg-orange-50"
                        >
                            <Key className="w-6 h-6" />
                            <span className="font-semibold">Join Network</span>
                        </Button>
                        <Button
                            onClick={() => setStep('create')}
                            variant="outline"
                            className="h-24 flex-col gap-2 border-2 hover:border-[#1E40AF] hover:bg-blue-50"
                        >
                            <Users className="w-6 h-6" />
                            <span className="font-semibold">Create Network</span>
                        </Button>
                    </div>
                    
                    {step === 'join' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                                <p className="font-medium mb-1">Have an invite code?</p>
                                <p className="text-xs">Enter the code provided by your organization administrator.</p>
                            </div>
                            
                            <div>
                                <Label htmlFor="invite-code">Invite Code</Label>
                                <Input
                                    id="invite-code"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    placeholder="XXXXXXXX"
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
                    )}
                    
                    {step === 'create' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800">
                                <p className="font-medium mb-1">Start your own network</p>
                                <p className="text-xs">30-day free trial with up to 10 users</p>
                            </div>
                            
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
                            
                            <Button 
                                onClick={() => createMutation.mutate({ name: orgName, email: contactEmail })}
                                disabled={!orgName || createMutation.isPending}
                                className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                            >
                                Create Network
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}
                    
                    <Button
                        onClick={() => setStep('network')}
                        variant="ghost"
                        className="w-full"
                    >
                        Back
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}