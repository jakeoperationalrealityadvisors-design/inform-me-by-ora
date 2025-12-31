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
import { Building2, Users, Key, ArrowRight, CheckCircle2, Zap, Shield, TrendingUp, User } from 'lucide-react';
import { toast } from 'sonner';

export default function NetworkOnboarding() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [step, setStep] = useState('account-type');
    const [accountType, setAccountType] = useState('');
    const [selectedPath, setSelectedPath] = useState(null);
    
    // Join network state
    const [inviteCode, setInviteCode] = useState('');
    
    // Create network state
    const [orgName, setOrgName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    
    // Age and technical level
    const [age, setAge] = useState('');
    const [technicalLevel, setTechnicalLevel] = useState('intermediate');
    
    // Auto-calculate technical level based on age
    const calculateTechnicalLevel = (ageValue) => {
        const numAge = parseInt(ageValue);
        if (numAge >= 70) return 'senior';
        if (numAge >= 60) return 'simple';
        if (numAge >= 50) return 'beginner';
        if (numAge >= 40) return 'intermediate';
        return 'expert';
    };
    
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
        { 
            value: 'simple', 
            label: 'Simple & Easy', 
            desc: 'Large buttons, simple words, step-by-step help. Perfect if technology isn\'t your thing.',
            emoji: '🌟',
            color: 'from-green-500 to-emerald-600'
        },
        { 
            value: 'beginner', 
            label: 'Some Guidance', 
            desc: 'I can figure things out but appreciate clear instructions and helpful tips.',
            emoji: '📚',
            color: 'from-blue-500 to-cyan-600'
        },
        { 
            value: 'intermediate', 
            label: 'I Know Apps', 
            desc: 'I use apps all the time. Just show me what\'s different here.',
            emoji: '💡',
            color: 'from-purple-500 to-pink-600'
        },
        { 
            value: 'expert', 
            label: 'Full Bore Tech', 
            desc: 'I\'m a power user. Give me everything, no training wheels.',
            emoji: '⚡',
            color: 'from-orange-500 to-red-600'
        }
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
                account_type: accountType,
                onboarding_completed: true,
                age: parseInt(age),
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
                account_type: accountType,
                onboarding_completed: true,
                age: parseInt(age),
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
    
    if (step === 'account-type') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#1a1f2e] flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full bg-white/95 backdrop-blur">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center gap-2 pt-6">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white flex items-center justify-center font-bold">1</div>
                        <div className="w-16 h-1 bg-slate-200"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold">2</div>
                        <div className="w-16 h-1 bg-slate-200"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold">3</div>
                        <div className="w-16 h-1 bg-slate-200"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold">4</div>
                    </div>
                    
                    <CardHeader className="text-center pb-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF8C00] to-[#1E40AF] rounded-2xl flex items-center justify-center">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">What describes you?</CardTitle>
                        <CardDescription className="text-base">
                            This helps us customize your experience
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <button
                                onClick={() => setAccountType('organization')}
                                className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                                    accountType === 'organization'
                                        ? 'border-[#FF8C00] bg-gradient-to-br from-orange-50 to-blue-50 shadow-lg'
                                        : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF8C00] to-orange-600 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-slate-900">I Run an Organization</div>
                                        <div className="text-sm text-slate-600">Manage teams, projects, and workflows</div>
                                    </div>
                                </div>
                            </button>
                            
                            <button
                                onClick={() => setAccountType('self_employed')}
                                className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                                    accountType === 'self_employed'
                                        ? 'border-[#FF8C00] bg-gradient-to-br from-orange-50 to-blue-50 shadow-lg'
                                        : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-slate-900">I'm Self-Employed</div>
                                        <div className="text-sm text-slate-600">Independent contractor or freelancer</div>
                                    </div>
                                </div>
                            </button>
                            
                            <button
                                onClick={() => setAccountType('employee')}
                                className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                                    accountType === 'employee'
                                        ? 'border-[#1E40AF] bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg'
                                        : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1E40AF] to-blue-600 flex items-center justify-center flex-shrink-0">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-slate-900">I'm an Employee</div>
                                        <div className="text-sm text-slate-600">Working for an organization</div>
                                    </div>
                                </div>
                            </button>
                        </div>
                        
                        <Button
                            onClick={() => setStep('welcome')}
                            disabled={!accountType}
                            className="w-full h-12 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-base font-semibold disabled:opacity-50"
                        >
                            Continue
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (step === 'welcome') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#1a1f2e] flex items-center justify-center p-4">
                <Card className="max-w-4xl w-full bg-white/95 backdrop-blur">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center gap-2 pt-6">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">✓</div>
                        <div className="w-16 h-1 bg-green-500"></div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white flex items-center justify-center font-bold">2</div>
                        <div className="w-16 h-1 bg-slate-200"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold">3</div>
                        <div className="w-16 h-1 bg-slate-200"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold">4</div>
                    </div>
                    
                    <CardHeader className="text-center pb-6">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#FF8C00] to-[#1E40AF] rounded-2xl flex items-center justify-center">
                            <Building2 className="w-10 h-10 text-white" />
                        </div>
                        <CardTitle className="text-3xl">What brings you here?</CardTitle>
                        <CardDescription className="text-lg">
                            Choose what best describes what you'll be doing
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
                        
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setStep('account-type')}
                                variant="outline"
                                className="flex-1 h-12"
                            >
                                ← Back
                            </Button>
                            <Button
                                onClick={() => setStep('technical')}
                                disabled={!selectedPath}
                                className="flex-1 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] h-12 text-base font-semibold disabled:opacity-50"
                            >
                                Next Step →
                            </Button>
                        </div>
                        
                        <div className="text-center text-sm text-slate-500 bg-blue-50 rounded-lg p-3 border border-blue-200">
                            💡 <strong>Don't worry!</strong> You'll have access to all features no matter what you pick
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
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center gap-2 pt-6">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">✓</div>
                        <div className="w-12 h-1 bg-green-500"></div>
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">✓</div>
                        <div className="w-12 h-1 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"></div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white flex items-center justify-center font-bold">3</div>
                        <div className="w-12 h-1 bg-slate-200"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold">4</div>
                    </div>
                    
                    <CardHeader className="text-center pb-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">What's your age?</CardTitle>
                        <CardDescription className="text-base">
                            We'll automatically adjust the app to be easier or more advanced based on your age. You can always customize it later.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="text-center">
                                <Label htmlFor="age" className="text-lg">Your Age</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={age}
                                    onChange={(e) => {
                                        setAge(e.target.value);
                                        if (e.target.value) {
                                            setTechnicalLevel(calculateTechnicalLevel(e.target.value));
                                        }
                                    }}
                                    placeholder="Enter your age"
                                    className="text-center text-3xl h-20 mt-2 font-bold"
                                    min="18"
                                    max="120"
                                />
                            </div>
                            
                            {age && (
                                <div className="bg-gradient-to-r from-orange-50 to-blue-50 border-2 border-orange-300 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="text-center">
                                        <div className="text-5xl mb-3">
                                            {technicalLevel === 'senior' && '👴'}
                                            {technicalLevel === 'simple' && '🌟'}
                                            {technicalLevel === 'beginner' && '📚'}
                                            {technicalLevel === 'intermediate' && '💡'}
                                            {technicalLevel === 'expert' && '⚡'}
                                        </div>
                                        <p className="font-bold text-xl text-slate-900 mb-2">
                                            {technicalLevel === 'senior' && 'Extra Large & Simple Mode'}
                                            {technicalLevel === 'simple' && 'Simple & Easy Mode'}
                                            {technicalLevel === 'beginner' && 'Guided Mode'}
                                            {technicalLevel === 'intermediate' && 'Standard Mode'}
                                            {technicalLevel === 'expert' && 'Advanced Mode'}
                                        </p>
                                        <p className="text-slate-700">
                                            {technicalLevel === 'senior' && 'Very large buttons, plain language, one step at a time'}
                                            {technicalLevel === 'simple' && 'Large buttons, simple words, step-by-step help'}
                                            {technicalLevel === 'beginner' && 'Clear instructions and helpful tips'}
                                            {technicalLevel === 'intermediate' && 'Streamlined interface with essential features'}
                                            {technicalLevel === 'expert' && 'Full access to all advanced features'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setStep('welcome')}
                                variant="outline"
                                className="flex-1 h-12"
                            >
                                ← Back
                            </Button>
                            <Button
                                onClick={() => setStep('network')}
                                disabled={!age}
                                className="flex-1 h-12 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-base font-semibold disabled:opacity-50"
                            >
                                Final Step: Connect →
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
                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-2 pt-6">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">✓</div>
                    <div className="w-12 h-1 bg-green-500"></div>
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">✓</div>
                    <div className="w-12 h-1 bg-green-500"></div>
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">✓</div>
                    <div className="w-12 h-1 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white flex items-center justify-center font-bold">4</div>
                </div>
                
                <CardHeader className="text-center pb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF8C00] to-[#1E40AF] rounded-2xl flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">🚀 Almost There!</CardTitle>
                    <CardDescription className="text-base">
                        Do you have an invite code from your team, or are you starting fresh?
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => setStep('join')}
                            className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                                step === 'join' 
                                    ? 'border-[#FF8C00] bg-gradient-to-br from-orange-50 to-blue-50' 
                                    : 'border-slate-200 hover:border-[#FF8C00] bg-white'
                            }`}
                        >
                            <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[#FF8C00] to-orange-600 rounded-xl flex items-center justify-center">
                                <Key className="w-7 h-7 text-white" />
                            </div>
                            <div className="font-bold text-lg mb-1">I Have a Code</div>
                            <div className="text-sm text-slate-600">Join my team's network</div>
                        </button>
                        <button
                            onClick={() => setStep('create')}
                            className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                                step === 'create' 
                                    ? 'border-[#1E40AF] bg-gradient-to-br from-blue-50 to-cyan-50' 
                                    : 'border-slate-200 hover:border-[#1E40AF] bg-white'
                            }`}
                        >
                            <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[#1E40AF] to-blue-600 rounded-xl flex items-center justify-center">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                            <div className="font-bold text-lg mb-1">Start Fresh</div>
                            <div className="text-sm text-slate-600">Create my own network</div>
                        </button>
                    </div>
                    
                    {step === 'join' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-5 text-blue-800">
                                <div className="flex items-start gap-3">
                                    <div className="text-2xl">📧</div>
                                    <div>
                                        <p className="font-bold text-base mb-1">Got an invite code?</p>
                                        <p className="text-sm">Your admin should have sent you an 8-character code. It looks like: ABCD1234</p>
                                    </div>
                                </div>
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
                                className="w-full h-14 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-lg font-semibold"
                            >
                                {joinMutation.isPending ? 'Joining...' : '🎉 Join My Team'}
                            </Button>
                        </div>
                    )}
                    
                    {step === 'create' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-gradient-to-r from-orange-50 to-blue-50 border-2 border-orange-300 rounded-xl p-5 text-orange-900">
                                <div className="flex items-start gap-3">
                                    <div className="text-2xl">🎁</div>
                                    <div>
                                        <p className="font-bold text-base mb-1">Free 30-Day Trial!</p>
                                        <p className="text-sm">Start with up to 10 team members. No credit card needed to begin.</p>
                                    </div>
                                </div>
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
                                className="w-full h-14 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-lg font-semibold"
                            >
                                {createMutation.isPending ? 'Creating...' : '✨ Create My Network'}
                            </Button>
                        </div>
                    )}
                    
                    <Button
                        onClick={() => setStep('network')}
                        variant="ghost"
                        className="w-full h-12 text-base"
                    >
                        ← Back to Options
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}