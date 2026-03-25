import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { QrCode, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function HopCodeJoin() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [step, setStep] = useState('enter'); // enter | verifying | success

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });

  const joinMutation = useMutation({
    mutationFn: async (inputCode) => {
      const upper = inputCode.toUpperCase().trim();
      const matches = await base44.entities.HopCode.filter({ code: upper, is_active: true });
      
      if (!matches || matches.length === 0) throw new Error('Invalid or expired hop code.');
      
      const hopCode = matches[0];
      if (hopCode.expires_at && new Date(hopCode.expires_at) < new Date()) throw new Error('This hop code has expired.');
      if (hopCode.max_uses && hopCode.usage_count >= hopCode.max_uses) throw new Error('This hop code has reached its maximum uses.');

      // Check if already a member
      const existing = await base44.entities.OrganizationMember.filter({ user_email: user.email, organization_id: hopCode.organization_id });
      
      if (!existing || existing.length === 0) {
        await base44.entities.OrganizationMember.create({
          organization_id: hopCode.organization_id,
          user_id: user.id,
          user_email: user.email,
          user_name: user.full_name,
          role: hopCode.default_role || 'member',
          status: 'active',
          joined_via_hop_code: true,
          hop_code_used: upper
        });
      }

      await base44.entities.HopCode.update(hopCode.id, { usage_count: (hopCode.usage_count || 0) + 1 });

      return hopCode;
    },
    onSuccess: () => {
      setStep('success');
      setTimeout(() => navigate('/UserDashboard'), 2000);
    },
    onError: (e) => {
      toast.error(e.message || 'Failed to verify hop code');
      setStep('enter');
    }
  });

  const handleSubmit = () => {
    if (!code.trim()) return;
    setStep('verifying');
    joinMutation.mutate(code);
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Join Your Team</h1>
          <p className="text-slate-400 text-sm mt-2">Enter the hop code provided by your administrator</p>
        </div>

        {step === 'success' ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">You're in!</p>
              <p className="text-slate-400 text-sm mt-1">Taking you to your dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="ABC123"
                maxLength={8}
                disabled={step === 'verifying'}
                className="bg-[#0d1320] border-blue-900/30 text-white text-center text-2xl font-mono tracking-widest h-16 focus:border-orange-500"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!code.trim() || step === 'verifying'}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-blue-600 text-white font-semibold text-base"
            >
              {step === 'verifying' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
              ) : (
                <>Join Organization <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
            <p className="text-center text-xs text-slate-500">
              Don't have a code? Contact your administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}