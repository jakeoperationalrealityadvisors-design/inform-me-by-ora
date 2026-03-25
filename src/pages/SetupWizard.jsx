import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
    CheckCircle2, Circle, ArrowRight, ArrowLeft, Building2, Tag, FileText,
    CheckSquare, Users, Zap, Rocket, ChevronRight, Sparkles, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const STEPS = [
    { id: 1, title: 'Welcome', icon: Rocket, desc: 'Get your workspace ready in 5 minutes' },
    { id: 2, title: 'Organization', icon: Building2, desc: 'Set up your organization profile' },
    { id: 3, title: 'First Category', icon: Tag, desc: 'Organize your forms by category' },
    { id: 4, title: 'First Form', icon: FileText, desc: 'Create your first digital form' },
    { id: 5, title: 'First Checklist', icon: CheckSquare, desc: 'Add an operational checklist' },
    { id: 6, title: 'Team', icon: Users, desc: 'Invite your team members' },
    { id: 7, title: 'Launch!', icon: Sparkles, desc: "You're ready to go" },
];

function StepIndicator({ current }) {
    return (
        <div className="flex items-center gap-1 justify-center mb-8">
            {STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                        s.id < current ? 'bg-emerald-500 text-white' :
                        s.id === current ? 'bg-orange-500 text-white ring-4 ring-orange-500/20' :
                        'bg-white/10 text-white/30'
                    }`}>
                        {s.id < current ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 max-w-[24px] rounded ${s.id < current ? 'bg-emerald-500' : 'bg-white/10'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// ── STEP COMPONENTS ──────────────────────────────────────

function StepWelcome({ onNext }) {
    return (
        <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center mx-auto">
                <Rocket className="w-10 h-10 text-white" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to InForm Me</h2>
                <p className="text-white/50 max-w-md mx-auto">
                    This wizard will guide you through setting up your workspace — creating categories, forms, checklists, and inviting your team. It takes about 5 minutes.
                </p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-sm">
                {[['Forms & Checklists', 'Build digital workflows for your team'],
                  ['Tasks & Assignments', 'Assign and track work items'],
                  ['Documents & Scanning', 'Store and OCR your documents']].map(([title, desc]) => (
                    <div key={title} className="bg-white/5 rounded-xl p-3 text-left border border-white/10">
                        <p className="text-white font-medium text-xs mb-1">{title}</p>
                        <p className="text-white/40 text-[10px]">{desc}</p>
                    </div>
                ))}
            </div>
            <Button onClick={onNext} className="bg-orange-500 hover:bg-orange-600 text-white px-8 gap-2">
                Let's Get Started <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
    );
}

function StepOrganization({ onNext, onSkip }) {
    const { data: orgs = [] } = useQuery({ queryKey: ['orgs'], queryFn: () => base44.entities.Organization.list() });
    const qc = useQueryClient();
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return toast.error('Please enter an organization name');
        setSaving(true);
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const me = await base44.auth.me();
        await base44.entities.Organization.create({
            name: name.trim(),
            invite_code: code,
            owner_email: me.email,
            status: 'active',
            plan_type: 'trial',
        });
        qc.invalidateQueries(['orgs']);
        toast.success('Organization created!');
        onNext();
    };

    if (orgs.length > 0) {
        return (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-white font-semibold">Organization already set up: <span className="text-orange-400">{orgs[0].name}</span></p>
                <Button onClick={onNext} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                    Continue <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-sm mx-auto">
            <div className="text-center">
                <Building2 className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white">Name Your Organization</h3>
                <p className="text-white/40 text-sm mt-1">This is your company or team name</p>
            </div>
            <Input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Acme Farms Ltd." onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-center text-lg h-12" />
            <div className="flex gap-3">
                <Button variant="ghost" onClick={onSkip} className="flex-1 text-white/40">Skip</Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-2">
                    {saving ? 'Saving...' : <>Save & Continue <ArrowRight className="w-4 h-4" /></>}
                </Button>
            </div>
        </div>
    );
}

function StepCategory({ onNext, onSkip }) {
    const { data: cats = [] } = useQuery({ queryKey: ['categories'], queryFn: () => base44.entities.Category.list() });
    const qc = useQueryClient();
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return toast.error('Please enter a category name');
        setSaving(true);
        await base44.entities.Category.create({ name: name.trim(), description: desc.trim(), color: '#FF8C00' });
        qc.invalidateQueries(['categories']);
        toast.success('Category created!');
        onNext();
    };

    return (
        <div className="space-y-6 max-w-sm mx-auto">
            <div className="text-center">
                <Tag className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white">Create a Category</h3>
                <p className="text-white/40 text-sm mt-1">Categories group your forms and checklists {cats.length > 0 && `(${cats.length} already exist)`}</p>
            </div>
            <div className="space-y-3">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Safety Inspections"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
            </div>
            {cats.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {cats.slice(0, 5).map(c => (
                        <span key={c.id} className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-full text-white/50">{c.name}</span>
                    ))}
                </div>
            )}
            <div className="flex gap-3">
                <Button variant="ghost" onClick={onSkip} className="flex-1 text-white/40">Skip</Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-2">
                    {saving ? 'Saving...' : <>Create & Continue <ArrowRight className="w-4 h-4" /></>}
                </Button>
            </div>
        </div>
    );
}

function StepForm({ onNext, onSkip }) {
    const { data: forms = [] } = useQuery({ queryKey: ['all-forms'], queryFn: () => base44.entities.FormTemplate.list() });
    const navigate = useNavigate();
    return (
        <div className="space-y-6 max-w-sm mx-auto text-center">
            <FileText className="w-12 h-12 text-orange-400 mx-auto" />
            <div>
                <h3 className="text-xl font-bold text-white">Create Your First Form</h3>
                <p className="text-white/40 text-sm mt-1">Forms capture field data with custom fields {forms.length > 0 && `(${forms.length} already exist)`}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-2 text-sm text-white/60">
                <p>✓ Text, numbers, dates, dropdowns</p>
                <p>✓ Photo capture and signatures</p>
                <p>✓ Required field validation</p>
                <p>✓ Submit and assign to team members</p>
            </div>
            <div className="flex gap-3">
                <Button variant="ghost" onClick={onSkip} className="flex-1 text-white/40">Skip</Button>
                <Button onClick={() => navigate(createPageUrl('EditForm'))} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-2">
                    Build a Form <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
            {forms.length > 0 && (
                <Button variant="ghost" onClick={onNext} className="text-emerald-400 text-sm">
                    I already have forms — Continue →
                </Button>
            )}
        </div>
    );
}

function StepChecklist({ onNext, onSkip }) {
    const { data: checklists = [] } = useQuery({ queryKey: ['all-checklists'], queryFn: () => base44.entities.ChecklistTemplate.list() });
    const navigate = useNavigate();
    return (
        <div className="space-y-6 max-w-sm mx-auto text-center">
            <CheckSquare className="w-12 h-12 text-orange-400 mx-auto" />
            <div>
                <h3 className="text-xl font-bold text-white">Create a Checklist</h3>
                <p className="text-white/40 text-sm mt-1">Checklists are step-by-step operational procedures {checklists.length > 0 && `(${checklists.length} already exist)`}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-2 text-sm text-white/60">
                <p>✓ Add required vs optional items</p>
                <p>✓ Notes fields per item</p>
                <p>✓ Completion tracking</p>
                <p>✓ 150+ pre-built templates available</p>
            </div>
            <div className="flex gap-3">
                <Button variant="ghost" onClick={onSkip} className="flex-1 text-white/40">Skip</Button>
                <Button onClick={() => navigate(createPageUrl('EditChecklist'))} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-2">
                    Build a Checklist <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
            {checklists.length > 0 && (
                <Button variant="ghost" onClick={onNext} className="text-emerald-400 text-sm">
                    I already have checklists — Continue →
                </Button>
            )}
        </div>
    );
}

function StepTeam({ onNext, onSkip }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const [inviting, setInviting] = useState(false);
    const [invited, setInvited] = useState([]);

    const handleInvite = async () => {
        if (!email.trim() || !email.includes('@')) return toast.error('Please enter a valid email');
        setInviting(true);
        await base44.users.inviteUser(email.trim(), role);
        setInvited(prev => [...prev, email.trim()]);
        setEmail('');
        toast.success('Invitation sent!');
        setInviting(false);
    };

    return (
        <div className="space-y-6 max-w-sm mx-auto">
            <div className="text-center">
                <Users className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white">Invite Your Team</h3>
                <p className="text-white/40 text-sm mt-1">Team members can fill forms and checklists on mobile</p>
            </div>
            <div className="space-y-3">
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@company.com" type="email"
                    onKeyDown={e => e.key === 'Enter' && handleInvite()}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                <select value={role} onChange={e => setRole(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-md px-3 py-2 text-sm">
                    <option value="user" className="bg-[#0f1624]">Team Member</option>
                    <option value="admin" className="bg-[#0f1624]">Admin</option>
                </select>
            </div>
            {invited.length > 0 && (
                <div className="space-y-1">
                    {invited.map(e => (
                        <div key={e} className="flex items-center gap-2 text-sm text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" /> {e}
                        </div>
                    ))}
                </div>
            )}
            <div className="flex gap-3">
                <Button onClick={handleInvite} disabled={inviting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    {inviting ? 'Sending...' : 'Send Invite'}
                </Button>
            </div>
            <div className="flex gap-3">
                <Button variant="ghost" onClick={onSkip} className="flex-1 text-white/40">Skip for now</Button>
                <Button onClick={onNext} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-2">
                    Continue <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

function StepLaunch() {
    return (
        <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">You're All Set! 🎉</h2>
                <p className="text-white/50 max-w-md mx-auto">Your workspace is ready. Here's what you can do next:</p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-left">
                {[
                    { label: 'Fill out a Form', path: 'Submissions', color: 'from-orange-500/20 to-orange-600/10' },
                    { label: 'Run a Checklist', path: 'Submissions', color: 'from-blue-500/20 to-blue-600/10' },
                    { label: 'Create a Task', path: 'CreateTask', color: 'from-purple-500/20 to-purple-600/10' },
                    { label: 'Upload a Document', path: 'UploadDocument', color: 'from-emerald-500/20 to-emerald-600/10' },
                    { label: 'View Reports', path: 'Reports', color: 'from-yellow-500/20 to-yellow-600/10' },
                    { label: 'Browse Help & FAQ', path: 'HelpFAQ', color: 'from-pink-500/20 to-pink-600/10' },
                ].map(item => (
                    <Link key={item.label} to={createPageUrl(item.path)}>
                        <div className={`bg-gradient-to-br ${item.color} border border-white/10 rounded-xl p-3 hover:border-white/20 transition-colors cursor-pointer group`}>
                            <span className="text-white text-sm font-medium group-hover:text-orange-300 transition-colors flex items-center gap-1">
                                {item.label} <ChevronRight className="w-3 h-3" />
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
            <Link to={createPageUrl('Home')}>
                <Button className="bg-gradient-to-r from-orange-500 to-blue-600 text-white px-8 gap-2">
                    Go to Dashboard <Rocket className="w-4 h-4" />
                </Button>
            </Link>
        </div>
    );
}

export default function SetupWizard() {
    const [step, setStep] = useState(1);
    const next = () => setStep(s => Math.min(s + 1, STEPS.length));
    const prev = () => setStep(s => Math.max(s - 1, 1));

    const stepContent = {
        1: <StepWelcome onNext={next} />,
        2: <StepOrganization onNext={next} onSkip={next} />,
        3: <StepCategory onNext={next} onSkip={next} />,
        4: <StepForm onNext={next} onSkip={next} />,
        5: <StepChecklist onNext={next} onSkip={next} />,
        6: <StepTeam onNext={next} onSkip={next} />,
        7: <StepLaunch />,
    };

    return (
        <div className="min-h-screen bg-[#070b12] flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-blue-700 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">I</span>
                        </div>
                        <span className="text-white font-bold text-sm">Setup Wizard</span>
                    </div>
                    <Link to={createPageUrl('Home')}>
                        <Button variant="ghost" size="icon" className="text-white/30 hover:text-white/60 h-8 w-8">
                            <X className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                {/* Step indicator */}
                <StepIndicator current={step} />

                {/* Step label */}
                <div className="text-center mb-6">
                    <p className="text-white/30 text-xs font-semibold uppercase tracking-widest">
                        Step {step} of {STEPS.length} — {STEPS[step - 1].title}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-[#0f1624] border border-white/8 rounded-2xl p-8">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                            {stepContent[step]}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Back nav */}
                {step > 1 && step < 7 && (
                    <div className="flex justify-start mt-4">
                        <Button variant="ghost" size="sm" onClick={prev} className="text-white/30 gap-1 hover:text-white/60">
                            <ArrowLeft className="w-3 h-3" /> Back
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}