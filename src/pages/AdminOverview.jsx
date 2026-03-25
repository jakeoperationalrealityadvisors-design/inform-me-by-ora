import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Users, ClipboardList, AlertTriangle, CheckCircle2, MessageSquare, Zap, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <Card className="bg-[#0d1320] border-blue-900/20">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? '–'}</p>
            {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color === 'text-orange-400' ? 'bg-orange-500/10' : color === 'text-blue-400' ? 'bg-blue-500/10' : color === 'text-green-400' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminOverview() {
  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });
  const { data: members = [] } = useQuery({
    queryKey: ['all-org-members'],
    queryFn: () => base44.entities.OrganizationMember.list()
  });
  const { data: assignments = [] } = useQuery({
    queryKey: ['all-assignments'],
    queryFn: () => base44.entities.Assignment.list('-created_date', 100)
  });
  const { data: messages = [] } = useQuery({
    queryKey: ['recent-messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 20)
  });
  const { data: hopCodes = [] } = useQuery({
    queryKey: ['hop-codes'],
    queryFn: () => base44.entities.HopCode.list()
  });

  const now = new Date();
  const pending = assignments.filter(a => ['pushed', 'delivered', 'viewed', 'in_progress'].includes(a.status));
  const overdue = assignments.filter(a => a.due_date && new Date(a.due_date) < now && !['submitted', 'completed', 'reviewed'].includes(a.status));
  const completed = assignments.filter(a => ['submitted', 'completed', 'reviewed'].includes(a.status));
  const activeUsers = members.filter(m => m.status === 'active');
  const completionRate = assignments.length ? Math.round((completed.length / assignments.length) * 100) : 0;

  const recentAssignments = assignments.slice(0, 8);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back, {user?.full_name || user?.email}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Users" value={activeUsers.length} icon={Users} color="text-blue-400" />
        <StatCard label="Pending Tasks" value={pending.length} icon={ClipboardList} color="text-orange-400" />
        <StatCard label="Overdue" value={overdue.length} icon={AlertTriangle} color="text-red-400" />
        <StatCard label="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} color="text-green-400" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/PushCenter">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-blue-600 hover:opacity-90 text-white h-12">
              <Zap className="w-4 h-4 mr-2" /> Push Task
            </Button>
          </Link>
          <Link to="/UserManagement">
            <Button variant="outline" className="w-full border-blue-900/30 text-blue-300 h-12 hover:bg-blue-950/30">
              <Users className="w-4 h-4 mr-2" /> Add User
            </Button>
          </Link>
          <Link to="/CreateForm">
            <Button variant="outline" className="w-full border-blue-900/30 text-blue-300 h-12 hover:bg-blue-950/30">
              <ClipboardList className="w-4 h-4 mr-2" /> New Form
            </Button>
          </Link>
          <Link to="/Messages">
            <Button variant="outline" className="w-full border-blue-900/30 text-blue-300 h-12 hover:bg-blue-950/30">
              <MessageSquare className="w-4 h-4 mr-2" /> Message
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <Card className="bg-[#0d1320] border-blue-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base">Recent Assignments</CardTitle>
              <Link to="/PushCenter" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAssignments.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No assignments yet. Push your first task!</p>
            ) : recentAssignments.map(a => (
              <div key={a.id} className="flex items-center justify-between p-2.5 bg-[#070b14] rounded-lg">
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-slate-400">{a.assigned_to_email}</p>
                </div>
                <Badge className={
                  a.status === 'completed' || a.status === 'submitted' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  a.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  a.status === 'pushed' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                  'bg-slate-500/20 text-slate-400 border-slate-500/30'
                } variant="outline">
                  {a.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="bg-[#0d1320] border-blue-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base">Team Members</CardTitle>
              <Link to="/UserManagement" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {members.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-slate-500 text-sm">No team members yet.</p>
                <Link to="/SetupWizard">
                  <Button size="sm" className="mt-3 bg-orange-500 hover:bg-orange-600 text-white">
                    Run Setup Wizard
                  </Button>
                </Link>
              </div>
            ) : members.slice(0, 8).map(m => (
              <div key={m.id} className="flex items-center gap-3 p-2.5 bg-[#070b14] rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-600/50 flex items-center justify-center text-blue-300 text-sm font-semibold flex-shrink-0">
                  {(m.user_name || m.user_email)?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{m.user_name || m.user_email}</p>
                  <p className="text-xs text-slate-400 truncate">{m.user_email}</p>
                </div>
                <Badge variant="outline" className="capitalize text-xs border-blue-900/30 text-slate-400">{m.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Hop Codes Summary */}
      <Card className="bg-[#0d1320] border-blue-900/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base">Active Hop Codes</CardTitle>
            <Link to="/HopCodes" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {hopCodes.filter(h => h.is_active).length === 0 ? (
            <p className="text-slate-500 text-sm py-2">No active hop codes. <Link to="/HopCodes" className="text-orange-400 underline">Create one</Link></p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {hopCodes.filter(h => h.is_active).map(h => (
                <div key={h.id} className="bg-[#070b14] border border-blue-900/20 rounded-xl px-4 py-3 min-w-[140px]">
                  <div className="text-2xl font-mono font-bold text-orange-400">{h.code}</div>
                  <div className="text-xs text-slate-400 mt-1">{h.label || h.type} · {h.usage_count || 0} uses</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}