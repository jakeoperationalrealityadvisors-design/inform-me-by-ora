import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Camera, MessageSquare, ClipboardList, CheckCircle, ArrowRight, Zap } from 'lucide-react';

export default function UserHome() {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        base44.auth.me().then(async u => {
            setUser(u);
            if (u?.email) {
                const [t, m] = await Promise.all([
                    base44.entities.Task.filter({ assigned_to_email: u.email }, '-created_date', 10),
                    base44.entities.Message.filter({ conversation_id: `admin-${u.email}` }, '-created_date', 5).catch(() => []),
                ]);
                setTasks(t);
                setMessages(m);
            }
            setLoading(false);
        });
    }, []);

    const activeTask = tasks.find(t => t.status === 'in_progress') || tasks.find(t => t.status === 'todo');
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const unreadMessages = messages.filter(m => !m.read_by?.includes(user?.email) && m.sender_email !== user?.email).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-slate-600 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Greeting */}
            <div className="bg-gradient-to-br from-orange-500/15 to-blue-600/10 border border-orange-500/20 rounded-2xl p-5">
                <p className="text-orange-400 text-sm font-medium">{greeting},</p>
                <h1 className="text-white text-2xl font-bold mt-0.5">{user?.full_name || 'there'} 👋</h1>
                <p className="text-slate-400 text-sm mt-1">
                    {tasks.length === 0
                        ? "You're all caught up — no tasks assigned."
                        : `${tasks.filter(t => t.status !== 'completed').length} task${tasks.filter(t => t.status !== 'completed').length !== 1 ? 's' : ''} remaining today`}
                </p>
            </div>

            {/* Active Task */}
            {activeTask ? (
                <Link to="/UserTasks" className="block">
                    <div className="bg-slate-800 border border-orange-500/30 rounded-2xl p-5 hover:border-orange-500/60 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-orange-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Current Task
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTask.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-600/40 text-slate-300'}`}>
                                {activeTask.status?.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-white text-lg font-bold mb-1">{activeTask.title}</p>
                        {activeTask.location && <p className="text-slate-400 text-sm">📍 {activeTask.location}</p>}
                        {activeTask.checklist?.length > 0 && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                                    <span>Progress</span>
                                    <span>{activeTask.checklist.length} items</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-700 rounded-full">
                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '0%' }} />
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-1 text-orange-400 text-sm mt-3">
                            View task <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </Link>
            ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-white font-semibold">No tasks assigned</p>
                    <p className="text-slate-400 text-sm mt-1">Check back later or contact your admin</p>
                </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-orange-400 text-2xl font-bold">{tasks.length}</p>
                    <p className="text-slate-400 text-xs mt-0.5">Assigned</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-green-400 text-2xl font-bold">{completedCount}</p>
                    <p className="text-slate-400 text-xs mt-0.5">Done</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-blue-400 text-2xl font-bold">{unreadMessages}</p>
                    <p className="text-slate-400 text-xs mt-0.5">Messages</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Quick Actions</p>
                <div className="grid grid-cols-2 gap-3">
                    <Link to="/UserScan" className="bg-slate-800 border border-slate-700 hover:border-orange-500/40 rounded-xl p-4 flex items-center gap-3 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Camera className="w-5 h-5 text-orange-400" />
                        </div>
                        <span className="text-white font-medium text-sm">Scan</span>
                    </Link>
                    <Link to="/UserMessages" className="bg-slate-800 border border-slate-700 hover:border-blue-500/40 rounded-xl p-4 flex items-center gap-3 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center relative">
                            <MessageSquare className="w-5 h-5 text-blue-400" />
                            {unreadMessages > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-white text-xs flex items-center justify-center">{unreadMessages}</span>
                            )}
                        </div>
                        <span className="text-white font-medium text-sm">Message Admin</span>
                    </Link>
                    <Link to="/UserTasks" className="bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-xl p-4 flex items-center gap-3 transition-colors col-span-2 group">
                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-slate-300" />
                        </div>
                        <div>
                            <p className="text-white font-medium text-sm">All Tasks</p>
                            <p className="text-slate-400 text-xs">{tasks.filter(t => t.status !== 'completed').length} remaining</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 ml-auto" />
                    </Link>
                </div>
            </div>
        </div>
    );
}