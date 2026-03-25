import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ClipboardCheck, MessageSquare, CheckCircle2, Clock, AlertCircle, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function priorityColor(p) {
  if (p === 'urgent') return 'bg-red-500/20 text-red-400 border-red-500/30';
  if (p === 'high') return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
}

export default function UserDashboard() {
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['my-assignments', user?.email],
    queryFn: () => base44.entities.Assignment.filter({ assigned_to_email: user.email }, '-created_date', 50),
    enabled: !!user?.email
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['my-messages', user?.email],
    queryFn: () => base44.entities.Message.filter({ participants: user.email }, '-created_date', 5),
    enabled: !!user?.email
  });

  const markViewed = useMutation({
    mutationFn: (id) => base44.entities.Assignment.update(id, { status: 'viewed', viewed_at: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries(['my-assignments'])
  });

  const pending = assignments.filter(a => !['submitted', 'completed', 'reviewed'].includes(a.status));
  const done = assignments.filter(a => ['submitted', 'completed', 'reviewed'].includes(a.status));
  const today = new Date().toISOString().split('T')[0];
  const dueToday = pending.filter(a => a.due_date === today);
  const overdue = pending.filter(a => a.due_date && a.due_date < today);

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-5">
      {/* Greeting */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-white">Hi, {user?.full_name?.split(' ')[0] || 'there'} 👋</h1>
        <p className="text-slate-400 text-sm mt-0.5">Here's what needs your attention today.</p>
      </div>

      {/* Alerts */}
      {overdue.length > 0 && (
        <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-300 font-semibold text-sm">{overdue.length} overdue item{overdue.length > 1 ? 's' : ''}</p>
            <p className="text-red-400/70 text-xs">Please complete these as soon as possible.</p>
          </div>
        </div>
      )}

      {/* Due Today */}
      {dueToday.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Due Today ({dueToday.length})
          </h2>
          <div className="space-y-2">
            {dueToday.map(a => (
              <AssignmentCard key={a.id} assignment={a} onOpen={() => markViewed.mutate(a.id)} />
            ))}
          </div>
        </div>
      )}

      {/* All Pending */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" /> Assigned to You ({pending.length})
        </h2>
        {isLoading ? (
          <div className="text-slate-500 text-sm py-4 text-center">Loading...</div>
        ) : pending.length === 0 ? (
          <div className="bg-[#0d1320] border border-blue-900/20 rounded-xl p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="text-white font-semibold">All caught up!</p>
            <p className="text-slate-400 text-sm mt-1">No pending tasks right now.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map(a => (
              <AssignmentCard key={a.id} assignment={a} onOpen={() => markViewed.mutate(a.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Latest Message */}
      {messages.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" /> Latest Message
          </h2>
          <Link to="/Messages">
            <div className="bg-[#0d1320] border border-blue-900/20 rounded-xl p-4 hover:border-blue-500/40 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300 text-sm font-semibold flex-shrink-0">
                  {messages[0].sender_name?.[0] || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{messages[0].sender_name || 'Admin'}</p>
                  <p className="text-slate-400 text-sm truncate">{messages[0].content}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed ({done.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {done.slice(0, 3).map(a => (
              <div key={a.id} className="bg-[#0d1320] border border-blue-900/10 rounded-xl px-4 py-3 flex items-center justify-between">
                <p className="text-slate-400 text-sm">{a.title}</p>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">Done</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AssignmentCard({ assignment: a, onOpen }) {
  const getLink = () => {
    if (a.type === 'form' && a.related_form_id) return `/FillForm?formId=${a.related_form_id}`;
    if (a.type === 'checklist' && a.related_checklist_id) return `/FillChecklist?checklistId=${a.related_checklist_id}`;
    return '/MyTasks';
  };

  return (
    <Link to={getLink()} onClick={onOpen}>
      <div className={`bg-[#0d1320] border rounded-xl p-4 hover:border-orange-500/40 transition-all ${
        a.priority === 'urgent' ? 'border-red-500/40' : a.priority === 'high' ? 'border-orange-500/30' : 'border-blue-900/20'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-xs ${priorityColor(a.priority)}`}>
                {a.priority}
              </Badge>
              <Badge variant="outline" className="text-xs border-slate-700 text-slate-400 capitalize">
                {a.type}
              </Badge>
            </div>
            <p className="text-white font-semibold mt-1.5">{a.title}</p>
            {a.instructions && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{a.instructions}</p>}
            {a.due_date && (
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Due {a.due_date}
              </p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  );
}