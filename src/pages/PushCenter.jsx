import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap, Users, ClipboardList, Send, Filter, CheckCircle2, Clock, AlertTriangle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const statusColors = {
  pushed: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  delivered: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  viewed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  submitted: 'bg-green-500/20 text-green-400 border-green-500/30',
  completed: 'bg-green-600/20 text-green-300 border-green-600/30',
  reviewed: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  returned: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function PushCenter() {
  const qc = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({
    assigned_to_email: '',
    type: 'form',
    title: '',
    instructions: '',
    priority: 'normal',
    due_date: '',
    related_form_id: '',
    related_checklist_id: '',
  });

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });
  const { data: members = [] } = useQuery({ queryKey: ['all-org-members'], queryFn: () => base44.entities.OrganizationMember.list() });
  const { data: formTemplates = [] } = useQuery({ queryKey: ['form-templates'], queryFn: () => base44.entities.FormTemplate.filter({ status: 'active' }) });
  const { data: checklistTemplates = [] } = useQuery({ queryKey: ['checklist-templates'], queryFn: () => base44.entities.ChecklistTemplate.filter({ status: 'active' }) });
  const { data: assignments = [] } = useQuery({ queryKey: ['all-assignments'], queryFn: () => base44.entities.Assignment.list('-created_date', 100) });

  const pushMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Assignment.create({
        ...data,
        organization_id: user?.organization_id || 'default',
        assigned_by_email: user?.email,
        status: 'pushed',
      });
    },
    onSuccess: () => {
      qc.invalidateQueries(['all-assignments']);
      setShowDialog(false);
      setForm({ assigned_to_email: '', type: 'form', title: '', instructions: '', priority: 'normal', due_date: '', related_form_id: '', related_checklist_id: '' });
      toast.success('Assignment pushed successfully!');
    },
    onError: () => toast.error('Failed to push assignment')
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Assignment.update(id, { status }),
    onSuccess: () => { qc.invalidateQueries(['all-assignments']); toast.success('Status updated'); }
  });

  const filtered = statusFilter === 'all' ? assignments : assignments.filter(a => a.status === statusFilter);
  const pending = assignments.filter(a => ['pushed', 'delivered', 'viewed', 'in_progress'].includes(a.status));
  const overdue = assignments.filter(a => a.due_date && new Date(a.due_date) < new Date() && !['submitted', 'completed', 'reviewed'].includes(a.status));

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Zap className="w-6 h-6 text-orange-400" /> Push Center</h1>
          <p className="text-slate-400 text-sm mt-1">Assign and push work to your team</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-gradient-to-r from-orange-500 to-blue-600 text-white">
          <Send className="w-4 h-4 mr-2" /> Push Assignment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#0d1320] border-blue-900/20">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{pending.length}</p>
            <p className="text-xs text-slate-400 mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0d1320] border-blue-900/20">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-red-400">{overdue.length}</p>
            <p className="text-xs text-slate-400 mt-1">Overdue</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0d1320] border-blue-900/20">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-green-400">{assignments.filter(a => a.status === 'completed' || a.status === 'submitted').length}</p>
            <p className="text-xs text-slate-400 mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pushed', 'in_progress', 'submitted', 'completed', 'returned'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              statusFilter === s ? 'bg-orange-500 text-white' : 'bg-[#0d1320] text-slate-400 border border-blue-900/20 hover:text-white'
            }`}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No assignments yet. Push your first task!</p>
          </div>
        ) : filtered.map(a => (
          <Card key={a.id} className="bg-[#0d1320] border-blue-900/20 hover:border-blue-700/30 transition-all">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`text-xs ${statusColors[a.status] || 'text-slate-400'}`}>
                      {a.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-slate-700 text-slate-400 capitalize">{a.type}</Badge>
                    {a.priority === 'urgent' && <Badge className="text-xs bg-red-500/20 text-red-400 border border-red-500/30">URGENT</Badge>}
                  </div>
                  <p className="text-white font-semibold mt-1.5">{a.title}</p>
                  <p className="text-slate-400 text-sm mt-0.5">→ {a.assigned_to_email}</p>
                  {a.instructions && <p className="text-slate-500 text-xs mt-1 line-clamp-1">{a.instructions}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    {a.due_date && <span className={`flex items-center gap-1 ${new Date(a.due_date) < new Date() ? 'text-red-400' : ''}`}><Clock className="w-3 h-3" /> {a.due_date}</span>}
                    <span>{new Date(a.created_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Select value={a.status} onValueChange={(v) => updateStatus.mutate({ id: a.id, status: v })}>
                    <SelectTrigger className="bg-[#070b14] border-blue-900/20 text-slate-300 text-xs h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['pushed','delivered','viewed','in_progress','submitted','reviewed','returned','completed'].map(s => (
                        <SelectItem key={s} value={s} className="capitalize text-xs">{s.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Push Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#0d1320] border-blue-900/20 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2"><Send className="w-5 h-5 text-orange-400" /> Push Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-300 text-sm">Assign To</Label>
              <Select value={form.assigned_to_email} onValueChange={v => setForm(f => ({ ...f, assigned_to_email: v }))}>
                <SelectTrigger className="bg-[#070b14] border-blue-900/20 text-white mt-1">
                  <SelectValue placeholder="Select team member..." />
                </SelectTrigger>
                <SelectContent>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.user_email}>{m.user_name || m.user_email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-sm">Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="bg-[#070b14] border-blue-900/20 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="form">Form</SelectItem>
                    <SelectItem value="checklist">Checklist</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger className="bg-[#070b14] border-blue-900/20 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.type === 'form' && formTemplates.length > 0 && (
              <div>
                <Label className="text-slate-300 text-sm">Form Template</Label>
                <Select value={form.related_form_id} onValueChange={v => setForm(f => ({ ...f, related_form_id: v, title: formTemplates.find(t => t.id === v)?.title || f.title }))}>
                  <SelectTrigger className="bg-[#070b14] border-blue-900/20 text-white mt-1">
                    <SelectValue placeholder="Select form..." />
                  </SelectTrigger>
                  <SelectContent>
                    {formTemplates.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {form.type === 'checklist' && checklistTemplates.length > 0 && (
              <div>
                <Label className="text-slate-300 text-sm">Checklist Template</Label>
                <Select value={form.related_checklist_id} onValueChange={v => setForm(f => ({ ...f, related_checklist_id: v, title: checklistTemplates.find(t => t.id === v)?.title || f.title }))}>
                  <SelectTrigger className="bg-[#070b14] border-blue-900/20 text-white mt-1">
                    <SelectValue placeholder="Select checklist..." />
                  </SelectTrigger>
                  <SelectContent>
                    {checklistTemplates.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-slate-300 text-sm">Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Assignment title..." className="bg-[#070b14] border-blue-900/20 text-white mt-1" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Instructions (optional)</Label>
              <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} placeholder="Any specific instructions..." className="w-full mt-1 bg-[#070b14] border border-blue-900/20 rounded-md text-white text-sm p-3 h-20 resize-none focus:outline-none focus:ring-1 focus:ring-orange-500" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Due Date (optional)</Label>
              <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="bg-[#070b14] border-blue-900/20 text-white mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="border-blue-900/30 text-slate-300">Cancel</Button>
            <Button onClick={() => pushMutation.mutate(form)} disabled={!form.assigned_to_email || !form.title || pushMutation.isPending} className="bg-gradient-to-r from-orange-500 to-blue-600 text-white">
              <Send className="w-4 h-4 mr-2" /> Push Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}