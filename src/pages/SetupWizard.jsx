import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Wand2, Building2, Settings2, Users, ClipboardList, Zap, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, label: 'Organization', icon: Building2 },
  { id: 2, label: 'Features', icon: Settings2 },
  { id: 3, label: 'Team', icon: Users },
  { id: 4, label: 'Hop Codes', icon: Zap },
  { id: 5, label: 'Go Live', icon: CheckCircle2 },
];

export default function SetupWizard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [createdOrg, setCreatedOrg] = useState(null);

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });

  const [orgData, setOrgData] = useState({ name: '', owner_email: '', plan_type: 'trial', status: 'active' });
  const [features, setFeatures] = useState({
    scanner_enabled: true, messaging_enabled: true, reports_enabled: true,
    checklists_enabled: true, offline_enabled: true, analytics_enabled: false,
  });
  const [inviteEmails, setInviteEmails] = useState('');
  const [hopCodeLabel, setHopCodeLabel] = useState('General Access');

  const createOrgMutation = useMutation({
    mutationFn: async () => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const org = await base44.entities.Organization.create({
        ...orgData,
        owner_email: orgData.owner_email || user?.email,
        invite_code: code,
        settings: features,
        onboarding_complete: false,
      });
      // Add creator as admin member
      await base44.entities.OrganizationMember.create({
        organization_id: org.id,
        user_id: user?.id,
        user_email: user?.email,
        user_name: user?.full_name,
        role: 'admin',
        status: 'active',
      });
      return org;
    },
    onSuccess: (org) => { setCreatedOrg(org); setStep(2); },
    onError: () => toast.error('Failed to create organization')
  });

  const updateFeaturesMutation = useMutation({
    mutationFn: () => base44.entities.Organization.update(createdOrg.id, { settings: features }),
    onSuccess: () => setStep(3)
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const emails = inviteEmails.split(/[\n,]+/).map(e => e.trim()).filter(Boolean);
      for (const email of emails) {
        await base44.users.inviteUser(email, 'user');
      }
    },
    onSuccess: () => setStep(4),
    onError: () => { toast.error('Some invites failed'); setStep(4); }
  });

  const createHopCodeMutation = useMutation({
    mutationFn: async () => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await base44.entities.HopCode.create({
        organization_id: createdOrg.id,
        code,
        label: hopCodeLabel,
        type: 'general',
        is_active: true,
        usage_count: 0,
        created_by_email: user?.email,
        default_role: 'member',
      });
    },
    onSuccess: () => setStep(5)
  });

  const finalizeMutation = useMutation({
    mutationFn: () => base44.entities.Organization.update(createdOrg.id, { onboarding_complete: true }),
    onSuccess: () => { qc.invalidateQueries(); navigate('/AdminOverview'); toast.success('Organization is live! 🎉'); }
  });

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#070b14] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center mx-auto mb-3">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Organization Setup</h1>
          <p className="text-slate-400 text-sm mt-1">Let's get your team up and running</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((s) => (
              <div key={s.id} className={`flex flex-col items-center gap-1 ${s.id <= step ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s.id < step ? 'bg-green-500 text-white' : s.id === step ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {s.id < step ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <span className="text-xs text-slate-400 hidden sm:block">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full">
            <div className="h-full bg-gradient-to-r from-orange-500 to-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#0d1320] border border-blue-900/20 rounded-2xl p-6 space-y-6">
          {/* Step 1: Organization */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Building2 className="w-5 h-5 text-orange-400" /> Organization Basics</h2>
                <p className="text-slate-400 text-sm mt-1">Set up your company workspace</p>
              </div>
              <div>
                <Label className="text-slate-300">Organization / Company Name *</Label>
                <Input value={orgData.name} onChange={e => setOrgData(d => ({ ...d, name: e.target.value }))} placeholder="Acme Construction Inc." className="bg-[#070b14] border-blue-900/20 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">Primary Admin Email</Label>
                <Input value={orgData.owner_email} onChange={e => setOrgData(d => ({ ...d, owner_email: e.target.value }))} placeholder={user?.email || 'admin@company.com'} className="bg-[#070b14] border-blue-900/20 text-white mt-1" />
                <p className="text-xs text-slate-500 mt-1">Leave blank to use your current email</p>
              </div>
              <Button onClick={() => createOrgMutation.mutate()} disabled={!orgData.name || createOrgMutation.isPending} className="w-full h-11 bg-gradient-to-r from-orange-500 to-blue-600 text-white">
                {createOrgMutation.isPending ? 'Creating...' : <><span>Create Organization</span> <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </div>
          )}

          {/* Step 2: Features */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings2 className="w-5 h-5 text-orange-400" /> Enable Features</h2>
                <p className="text-slate-400 text-sm mt-1">Choose what your team can access</p>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'checklists_enabled', label: 'Checklists & Forms', desc: 'Team can complete assigned checklists and forms' },
                  { key: 'messaging_enabled', label: 'Messaging', desc: 'Admin to user messaging and threads' },
                  { key: 'scanner_enabled', label: 'QR / Barcode Scanner', desc: 'Field scanning capabilities' },
                  { key: 'reports_enabled', label: 'Reports & Submissions', desc: 'View and track submission history' },
                  { key: 'offline_enabled', label: 'Offline Mode', desc: 'Work without internet connection' },
                  { key: 'analytics_enabled', label: 'Analytics Dashboard', desc: 'Advanced metrics and charts' },
                ].map(f => (
                  <div key={f.key} className="flex items-center justify-between p-3 bg-[#070b14] rounded-xl border border-blue-900/20">
                    <div>
                      <p className="text-white text-sm font-medium">{f.label}</p>
                      <p className="text-xs text-slate-400">{f.desc}</p>
                    </div>
                    <Switch checked={features[f.key]} onCheckedChange={v => setFeatures(fe => ({ ...fe, [f.key]: v }))} />
                  </div>
                ))}
              </div>
              <Button onClick={() => updateFeaturesMutation.mutate()} disabled={updateFeaturesMutation.isPending} className="w-full h-11 bg-gradient-to-r from-orange-500 to-blue-600 text-white">
                Save & Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 3: Team */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-orange-400" /> Invite Team</h2>
                <p className="text-slate-400 text-sm mt-1">Invite users via email (optional — you can also share a hop code)</p>
              </div>
              <div>
                <Label className="text-slate-300">Email Addresses</Label>
                <textarea
                  value={inviteEmails}
                  onChange={e => setInviteEmails(e.target.value)}
                  placeholder="john@company.com&#10;jane@company.com&#10;(one per line or comma separated)"
                  className="w-full mt-1 bg-[#070b14] border border-blue-900/20 rounded-lg text-white text-sm p-3 h-28 resize-none focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(4)} className="flex-1 border-blue-900/30 text-slate-300">
                  Skip for now
                </Button>
                <Button onClick={() => inviteMutation.mutate()} disabled={inviteMutation.isPending} className="flex-1 bg-gradient-to-r from-orange-500 to-blue-600 text-white">
                  {inviteMutation.isPending ? 'Sending...' : 'Send Invites'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Hop Code */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Zap className="w-5 h-5 text-orange-400" /> Create Hop Code</h2>
                <p className="text-slate-400 text-sm mt-1">A hop code lets workers join instantly without email invite</p>
              </div>
              <div>
                <Label className="text-slate-300">Code Label</Label>
                <Input value={hopCodeLabel} onChange={e => setHopCodeLabel(e.target.value)} placeholder="General Access" className="bg-[#070b14] border-blue-900/20 text-white mt-1" />
              </div>
              <div className="bg-[#070b14] border border-blue-900/20 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400">A unique code will be auto-generated</p>
                <p className="text-slate-300 text-sm mt-1">Share it with: <strong>yourapp.com/HopCodeJoin</strong></p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(5)} className="flex-1 border-blue-900/30 text-slate-300">Skip</Button>
                <Button onClick={() => createHopCodeMutation.mutate()} disabled={createHopCodeMutation.isPending} className="flex-1 bg-gradient-to-r from-orange-500 to-blue-600 text-white">
                  Generate Code
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Go Live */}
          {step === 5 && (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">You're Ready!</h2>
                <p className="text-slate-400 text-sm mt-2">
                  <strong className="text-white">{createdOrg?.name}</strong> is set up and ready to deploy to your team.
                </p>
              </div>
              <div className="bg-[#070b14] border border-blue-900/20 rounded-xl p-4 text-left space-y-2 text-sm">
                <p className="text-slate-300">✅ Organization created</p>
                <p className="text-slate-300">✅ Features configured</p>
                <p className="text-slate-300">✅ Admin access active</p>
                <p className="text-slate-400 text-xs mt-2">Share your hop code or invite link with your team to get started.</p>
              </div>
              <Button onClick={() => finalizeMutation.mutate()} disabled={finalizeMutation.isPending} className="w-full h-12 bg-gradient-to-r from-orange-500 to-blue-600 text-white font-semibold text-base">
                {finalizeMutation.isPending ? 'Launching...' : 'Go to Admin Dashboard 🚀'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}