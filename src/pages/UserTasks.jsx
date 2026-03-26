import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ClipboardList, MapPin, Calendar, CheckCircle, Circle, ChevronRight, X, Upload, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UserTasks() {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('today');
    const [selected, setSelected] = useState(null);
    const [checkedItems, setCheckedItems] = useState({});
    const [notes, setNotes] = useState('');
    const [completing, setCompleting] = useState(false);

    const load = (email) => {
        base44.entities.Task.filter({ assigned_to_email: email }, '-created_date', 50).then(t => {
            setTasks(t);
            setLoading(false);
        });
    };

    useEffect(() => {
        base44.auth.me().then(u => {
            setUser(u);
            if (u?.email) load(u.email);
        });
    }, []);

    const today = new Date().toISOString().split('T')[0];
    const filtered = {
        today: tasks.filter(t => t.due_date === today || t.status === 'in_progress'),
        upcoming: tasks.filter(t => t.due_date > today && t.status !== 'completed'),
        completed: tasks.filter(t => t.status === 'completed'),
    }[tab] || [];

    const toggleItem = (id) => {
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const openTask = (task) => {
        setSelected(task);
        const initChecked = {};
        task.checklist?.forEach(item => { initChecked[item.id] = false; });
        setCheckedItems(initChecked);
        setNotes('');
    };

    const completeTask = async () => {
        if (!selected) return;
        setCompleting(true);
        await base44.entities.Task.update(selected.id, {
            status: 'completed',
            notes: notes,
            completed_date: new Date().toISOString(),
        });
        setTasks(prev => prev.map(t => t.id === selected.id ? { ...t, status: 'completed' } : t));
        setSelected(null);
        setCompleting(false);
    };

    const startTask = async (task) => {
        if (task.status !== 'todo') return;
        await base44.entities.Task.update(task.id, { status: 'in_progress' });
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'in_progress' } : t));
        openTask({ ...task, status: 'in_progress' });
    };

    const statusColor = { todo: 'bg-slate-600/40 text-slate-300', in_progress: 'bg-blue-500/20 text-blue-300', completed: 'bg-green-500/20 text-green-300' };
    const priorityDot = { low: 'bg-slate-500', medium: 'bg-yellow-500', high: 'bg-orange-500', urgent: 'bg-red-500' };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-white">My Tasks</h1>
                <p className="text-slate-400 text-sm mt-1">{tasks.filter(t => t.status !== 'completed').length} remaining</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {['today', 'upcoming', 'completed'].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-4 border-slate-600 border-t-orange-500 rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center">
                    <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No tasks in this category</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(task => (
                        <div key={task.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority] || 'bg-slate-500'}`} />
                                        <p className="text-white font-semibold leading-tight">{task.title}</p>
                                    </div>
                                    {task.location && <p className="text-slate-400 text-xs flex items-center gap-1 mb-1"><MapPin className="w-3 h-3" />{task.location}</p>}
                                    {task.due_date && <p className="text-slate-400 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" />Due {task.due_date}</p>}
                                    {task.checklist?.length > 0 && <p className="text-slate-500 text-xs mt-1">{task.checklist.length} checklist items</p>}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor[task.status] || 'bg-slate-600/40 text-slate-300'}`}>
                                        {task.status?.replace('_', ' ')}
                                    </span>
                                    {task.status !== 'completed' && (
                                        <button onClick={() => task.status === 'todo' ? startTask(task) : openTask(task)}
                                            className="flex items-center gap-1 text-orange-400 text-xs hover:text-orange-300 transition-colors">
                                            {task.status === 'todo' ? 'Start' : 'Open'} <ChevronRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Task Detail Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70">
                    <div className="bg-slate-800 border border-slate-700 rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-700 sticky top-0 bg-slate-800">
                            <h3 className="text-white font-bold text-lg leading-tight pr-4">{selected.title}</h3>
                            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white flex-shrink-0"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-5">
                            {/* Info */}
                            <div className="flex flex-wrap gap-3">
                                {selected.location && (
                                    <a href={`https://maps.google.com/?q=${encodeURIComponent(selected.location)}`} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1.5 text-blue-400 text-sm hover:underline">
                                        <MapPin className="w-4 h-4" /> {selected.location}
                                    </a>
                                )}
                                {selected.due_date && <span className="flex items-center gap-1 text-slate-400 text-sm"><Calendar className="w-4 h-4" /> Due {selected.due_date}</span>}
                            </div>

                            {/* Instructions */}
                            {selected.description && (
                                <div>
                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Instructions</p>
                                    <p className="text-slate-300 text-sm leading-relaxed bg-slate-700/50 rounded-lg p-3">{selected.description}</p>
                                </div>
                            )}

                            {/* Checklist */}
                            {selected.checklist?.length > 0 && (
                                <div>
                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Checklist</p>
                                    <div className="space-y-2">
                                        {selected.checklist.map(item => (
                                            <button key={item.id} onClick={() => toggleItem(item.id)}
                                                className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left">
                                                {checkedItems[item.id]
                                                    ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                                    : <Circle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                                                }
                                                <span className={`text-sm ${checkedItems[item.id] ? 'line-through text-slate-500' : 'text-slate-200'}`}>{item.text}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Notes</p>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any notes or observations..." className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-orange-500" />
                            </div>

                            {/* Complete */}
                            {selected.status !== 'completed' && (
                                <Button onClick={completeTask} disabled={completing} className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 py-3 text-base">
                                    <CheckCircle className="w-5 h-5" />
                                    {completing ? 'Completing...' : 'Mark as Complete'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}