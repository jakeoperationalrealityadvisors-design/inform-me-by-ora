import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { QrCode, Plus, Copy, Trash2, ToggleLeft, ToggleRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function HopCodes() {
  const qc = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [qrCode, setQrCode] = useState(null); // { code, dataUrl }
  const [form, setForm] = useState({ label: '', type: 'general', expires_at: '', max_uses: '' });

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });
  const { data: hopCodes = [] } = useQuery({ queryKey: ['hop-codes'], queryFn: () => base44.entities.HopCode.list() });
  const { data: members = [] } = useQuery({ queryKey: ['all-org-members'], queryFn: () => base44.entities.OrganizationMember.list() });

  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.HopCode.create({ ...data, code: generateCode(), organization_id: 'default', created_by_email: user?.email, is_active: true, usage_count: 0 }),
    onSuccess: () => { qc.invalidateQueries(['hop-codes']); setShowDialog(false); setForm({ label: '', type: 'general', expires_at: '', max_uses: '' }); toast.success('Hop code created!'); }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.HopCode.update(id, { is_active: !is_active }),
    onSuccess: () => qc.invalidateQueries(['hop-codes'])
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HopCode.delete(id),
    onSuccess: () => { qc.invalidateQueries(['hop-codes']); toast.success('Hop code deleted'); }
  });

  const copy = (code) => { navigator.clipboard.writeText(code); toast.success('Copied!'); };

  const showQR = async (code) => {
    const joinUrl = `${window.location.origin}/HopCodeJoin?code=${code}`;
    const dataUrl = await QRCode.toDataURL(joinUrl, { width: 280, margin: 2, color: { dark: '#ffffff', light: '#0d1320' } });
    setQrCode({ code, dataUrl, joinUrl });
  };

  // Count members who joined via each code
  const usageMap = {};
  members.forEach(m => { if (m.hop_code_used) usageMap[m.hop_code_used] = (usageMap[m.hop_code_used] || 0) + 1; });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><QrCode className="w-6 h-6 text-orange-400" /> Hop Codes</h1>
          <p className="text-slate-400 text-sm mt-1">Generate access codes for users to join your organization</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-gradient-to-r from-orange-500 to-blue-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Code
        </Button>
      </div>

      {/* How it works */}
      <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-4 text-sm text-blue-300">
        <strong className="text-blue-200">How Hop Codes work:</strong> Share a code with a user. They enter it when they first log in at <strong>/HopCodeJoin</strong>. They'll be linked to your organization automatically.
      </div>

      {/* Codes Grid */}
      {hopCodes.length === 0 ? (
        <div className="text-center py-16">
          <QrCode className="w-14 h-14 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-semibold">No Hop Codes Yet</p>
          <p className="text-slate-500 text-sm mt-1">Create your first code to start inviting users.</p>
          <Button onClick={() => setShowDialog(true)} className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Create First Code
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hopCodes.map(h => (
            <Card key={h.id} className={`bg-[#0d1320] transition-all ${h.is_active ? 'border-blue-900/30' : 'border-slate-800 opacity-60'}`}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    {h.label && <p className="text-slate-300 text-sm font-medium">{h.label}</p>}
                    <Badge variant="outline" className="text-xs capitalize border-slate-700 text-slate-400 mt-1">{h.type}</Badge>
                  </div>
                  <Badge variant="outline" className={h.is_active ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-slate-500 border-slate-700'}>
                    {h.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="text-4xl font-mono font-bold text-orange-400 text-center py-3 bg-[#070b14] rounded-xl border border-blue-900/20 mb-3">
                  {h.code}
                </div>

                <div className="text-xs text-slate-500 flex gap-4 mb-3">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {usageMap[h.code] || h.usage_count || 0} used</span>
                  {h.expires_at && <span>Expires {h.expires_at}</span>}
                  {h.max_uses && <span>Max {h.max_uses}</span>}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => copy(h.code)} className="flex-1 border-blue-900/30 text-blue-300 h-8 text-xs">
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => showQR(h.code)} className="border-orange-900/30 text-orange-400 h-8 w-8 p-0" title="Show QR Code">
                    <QrCode className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleMutation.mutate({ id: h.id, is_active: h.is_active })} className="border-blue-900/30 text-slate-400 h-8 w-8 p-0">
                    {h.is_active ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(h.id)} className="border-red-900/30 text-red-400 h-8 w-8 p-0">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      <Dialog open={!!qrCode} onOpenChange={() => setQrCode(null)}>
        <DialogContent className="bg-[#0d1320] border-blue-900/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-center">Scan to Join</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            {qrCode && (
              <>
                <div className="rounded-xl overflow-hidden border-2 border-orange-500/30">
                  <img src={qrCode.dataUrl} alt="QR Code" className="w-64 h-64" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-4xl font-mono font-bold text-orange-400">{qrCode.code}</p>
                  <p className="text-xs text-slate-400">Users scan this to fast-track into the app</p>
                </div>
                <Button
                  onClick={() => { copy(qrCode.joinUrl); }}
                  variant="outline"
                  className="w-full border-blue-900/30 text-blue-300 text-xs"
                >
                  <Copy className="w-3 h-3 mr-2" /> Copy Join Link
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#0d1320] border-blue-900/20">
          <DialogHeader>
            <DialogTitle className="text-white">Create Hop Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-300 text-sm">Label (optional)</Label>
              <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Site A, Night Shift..." className="bg-[#070b14] border-blue-900/20 text-white mt-1" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="bg-[#070b14] border-blue-900/20 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="site">Site Access</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-sm">Expires (optional)</Label>
                <Input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className="bg-[#070b14] border-blue-900/20 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Max Uses (optional)</Label>
                <Input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="Unlimited" className="bg-[#070b14] border-blue-900/20 text-white mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="border-blue-900/30 text-slate-300">Cancel</Button>
            <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} className="bg-gradient-to-r from-orange-500 to-blue-600 text-white">
              Generate Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}