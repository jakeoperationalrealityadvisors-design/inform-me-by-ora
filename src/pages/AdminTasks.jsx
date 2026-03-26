import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, ClipboardList, MapPin, User, Calendar, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STATUS_OPTIONS = ['todo', 'in_progress', 'completed', 'cancelled'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];
const statusColor = {
    todo: 'bg-slate-600/40 text-slate-300',
    in_progress: 'bg-blue-500/20 text-blue-300',
    completed: 'bg-green-500/20 text-green-300',
    cancelled: 'bg-red-500/20 text-red-300',
};
const priorityColor = {
    low: 'text-slate-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    urgent: 'text-red-400',
};

export default function AdminTasks() {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', assigned_to_email: '', assigned_to_name: '', location: '', due_date: '', priority: 'medium', status: 'todo' });
    const [saving, setSaving] = useState(false);
    const [checklistInput, setChecklistInput] = useState('');
    const [checklist, setChecklist] = useState([]);

    const load = () => {
        Promise.all([
            base44.entities.Task.list('-created_date', 100),
            base44.entities.User.list()
        ]).then(([t, u]) => {
            setTasks(t);
            setUsers(u.filter(u => u.role !== 'admin'));
            setLoading(false);
        });
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        if (!form.title.trim()) return;
        setSaving(true);
        await base44.entities.Task.create({ ...form, checklist: checklist.map((text, i) => ({ id: String(i), text, required: false })) });
        setForm({ title: '', description: '', assigned_to_email: '', assigned_to_name: '', location: '', due_date: '', priority: 'medium', status: 'todo' });
        setChecklist([]);
        setShowForm(false);
        setSaving(false);
        load();
    };

    const updateStatus = async (id, status) => {
        await base44.entities.Task.update(id, { status });
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    };

    const addCheckItem = () => {
        if (checklistInput.trim()) {
            setChecklist(prev => [...prev, checklistInput.trim()]);
            setChecklistInput('');
        }
    };

    const filtered = tasks.filter(t => filter === 'all' || t.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Tasks</h1>
                    <p className="text-slate-400 text-sm mt-1">{tasks.length} total tasks</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                    <Plus className="w-4 h-4" /> New Task
                </Button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {['all', ...STATUS_OPTIONS].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === s ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}>
                        {s.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Create Task Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg my-8">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-white font-bold text-lg">Create Task</h3>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-slate-400 text-xs mb-1 block">Task Title *</label>
                                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter task title" className="bg-slate-700 border-slate-600 text-white" />
                            </div>
                            <div>
                                <label className="text-slate-400 text-xs mb-1 block">Instructions</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe what needs to be done..." className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-orange-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-slate-400 text-xs mb-1 block">Assign To</label>
                                    <select value={form.assigned_to_email} onChange={e => {
                                        const u = users.find(u => u.email === e.target.value);
                                        setForm(f => ({ ...f, assigned_to_email: e.target.value, assigned_to_name: u?.full_name || '' }));
                                    }} className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500">
                                        <option value="">Unassigned</option>
                                        {users.map(u => <option key={u.id} value={u.email}>{u.full_name || u.email}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-slate-400 text-xs mb-1 block">Priority</label>
                                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500">
                                        {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-slate-400 text-xs mb-1 block">Location</label>
                                    <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Address or site name" className="bg-slate-700 border-slate-600 text-white" />
                                </div>
                                <div>
                                    <label className="text-slate-400 text-xs mb-1 block">Due Date</label>
                                    <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" />
                                </div>
                            </div>
                            {/* Checklist builder */}
                            <div>
                                <label className="text-slate-400 text-xs mb-1 block">Checklist Items</label>
                                <div className="flex gap-2 mb-2">
                                    <Input value={checklistInput} onChange={e => setChecklistInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCheckItem()} placeholder="Add item..." className="bg-slate-700 border-slate-600 text-white" />
                                    <Button onClick={addCheckItem} size="icon" className="bg-slate-600 hover:bg-slate-500"><Plus className="w-4 h-4" /></Button>
                                </div>
                                {checklist.length > 0 && (
                                    <div className="space-y-1">
                                        {checklist.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between bg-slate-700 rounded-lg px-3 py-2">
                                                <span className="text-slate-300 text-sm">{item}</span>
                                                <button onClick={() => setChecklist(prev => prev.filter((_, j) => j !== i))} className="text-slate-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1 border-slate-600 text-slate-300">Cancel</Button>
                            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                                {saving ? 'Creating...' : 'Create Task'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Task List */}
            {loading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-4 border-slate-600 border-t-orange-500 rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                    <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No tasks found</p>
                    <Button onClick={() => setShowForm(true)} className="mt-4 bg-orange-500 hover:bg-orange-600 text-white gap-2">
                        <Plus className="w-4 h-4" /> Create First Task
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(task => (
                        <div key={task.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <p className="text-white font-semibold">{task.title}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor[task.priority]}`}>{task.priority}</span>
                                    </div>
                                    {task.description && <p className="text-slate-400 text-sm mb-2 line-clamp-2">{task.description}</p>}
                                    <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500">
                                        {task.assigned_to_name && <span className="flex items-center gap-1"><User className="w-3 h-3" />{task.assigned_to_name}</span>}
                                        {task.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{task.location}</span>}
                                        {task.due_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.due_date}</span>}
                                    </div>
                                    {task.checklist?.length > 0 && (
                                        <p className="text-xs text-slate-500 mt-1">{task.checklist.length} checklist items</p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${statusColor[task.status]}`}>{task.status?.replace('_', ' ')}</span>
                                    <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}
                                        className="text-xs bg-slate-700 border border-slate-600 text-slate-300 rounded px-2 py-1 focus:outline-none">
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}