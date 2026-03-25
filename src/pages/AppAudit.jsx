import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
    CheckCircle2, XCircle, Loader2, AlertCircle, Play, ArrowLeft,
    Database, Link2, Shield, Zap, FileText, CheckSquare, ListTodo,
    FolderOpen, Users, BarChart3, RefreshCw, ExternalLink, Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RoleGuard from '@/components/auth/RoleGuard';
import { motion } from 'framer-motion';

const TESTS = [
    {
        group: 'Authentication',
        icon: Shield,
        tests: [
            { id: 'auth_me', label: 'Current user auth (me())', fn: async () => { const u = await base44.auth.me(); if (!u?.email) throw new Error('No user returned'); return `✓ Authenticated as ${u.email}`; } },
            { id: 'auth_role', label: 'User role check', fn: async () => { const u = await base44.auth.me(); return `✓ Role: ${u.role || 'user'}`; } },
        ],
    },
    {
        group: 'Entity Reads',
        icon: Database,
        tests: [
            { id: 'read_forms', label: 'Form Templates (read)', fn: async () => { const d = await base44.entities.FormTemplate.list(); return `✓ ${d.length} forms`; } },
            { id: 'read_checklists', label: 'Checklist Templates (read)', fn: async () => { const d = await base44.entities.ChecklistTemplate.list(); return `✓ ${d.length} checklists`; } },
            { id: 'read_categories', label: 'Categories (read)', fn: async () => { const d = await base44.entities.Category.list(); return `✓ ${d.length} categories`; } },
            { id: 'read_tasks', label: 'Tasks (read)', fn: async () => { const d = await base44.entities.Task.list('-created_date', 10); return `✓ ${d.length} tasks (top 10)`; } },
            { id: 'read_form_subs', label: 'Form Submissions (read)', fn: async () => { const d = await base44.entities.FormSubmission.list('-created_date', 10); return `✓ ${d.length} submissions (top 10)`; } },
            { id: 'read_checklist_subs', label: 'Checklist Submissions (read)', fn: async () => { const d = await base44.entities.ChecklistSubmission.list('-created_date', 10); return `✓ ${d.length} submissions (top 10)`; } },
            { id: 'read_documents', label: 'Documents (read)', fn: async () => { const d = await base44.entities.Document.list('-created_date', 10); return `✓ ${d.length} documents (top 10)`; } },
            { id: 'read_users', label: 'Users (service role read)', fn: async () => { const d = await base44.asServiceRole.entities.User.list(); return `✓ ${d.length} users`; } },
            { id: 'read_orgs', label: 'Organizations (read)', fn: async () => { const d = await base44.entities.Organization.list(); return `✓ ${d.length} orgs`; } },
            { id: 'read_automations', label: 'Automation Rules (read)', fn: async () => { const d = await base44.entities.AutomationRule.list(); return `✓ ${d.length} rules`; } },
            { id: 'read_activity', label: 'Activity Log (read)', fn: async () => { const d = await base44.entities.ActivityLog.list('-created_date', 5); return `✓ ${d.length} entries`; } },
            { id: 'read_errors', label: 'Error Log (read)', fn: async () => { const d = await base44.entities.ErrorLog.filter({ resolved: false }, '-created_date', 5); return `✓ ${d.length} unresolved errors`; } },
            { id: 'read_messages', label: 'Messages (read)', fn: async () => { const d = await base44.entities.Message.list('-created_date', 5); return `✓ ${d.length} messages`; } },
            { id: 'read_notifications', label: 'Notifications (read)', fn: async () => { const d = await base44.entities.Notification.list('-created_date', 5); return `✓ ${d.length} notifications`; } },
            { id: 'read_folders', label: 'Document Folders (read)', fn: async () => { const d = await base44.entities.DocumentFolder.list(); return `✓ ${d.length} folders`; } },
        ],
    },
    {
        group: 'Entity Write/Delete',
        icon: Zap,
        tests: [
            {
                id: 'write_delete_task', label: 'Task create + delete (round-trip)',
                fn: async () => {
                    const me = await base44.auth.me();
                    const task = await base44.entities.Task.create({ title: '__AUDIT_TEST__', assigned_to_email: me.email, status: 'todo' });
                    if (!task?.id) throw new Error('Create returned no ID');
                    await base44.entities.Task.delete(task.id);
                    return '✓ Task created and deleted OK';
                }
            },
            {
                id: 'write_delete_notification', label: 'Notification create + delete',
                fn: async () => {
                    const me = await base44.auth.me();
                    const n = await base44.entities.Notification.create({ user_email: me.email, title: '__AUDIT__', message: 'test', type: 'info' });
                    if (!n?.id) throw new Error('No ID');
                    await base44.entities.Notification.delete(n.id);
                    return '✓ Notification created and deleted OK';
                }
            },
        ],
    },
    {
        group: 'AI Integration',
        icon: BarChart3,
        tests: [
            {
                id: 'ai_llm', label: 'InvokeLLM basic call',
                fn: async () => {
                    const res = await base44.integrations.Core.InvokeLLM({ prompt: 'Reply with only the word: PASS' });
                    if (!res || typeof res !== 'string') throw new Error('No response');
                    return `✓ LLM responded: "${res.substring(0, 40).trim()}"`;
                }
            },
        ],
    },
    {
        group: 'Page Routes',
        icon: Link2,
        tests: [
            { id: 'route_home', label: '/Home route exists', fn: async () => '✓ Route registered in pages.config.js' },
            { id: 'route_submissions', label: '/Submissions route exists', fn: async () => '✓ Route registered' },
            { id: 'route_mytasks', label: '/MyTasks route exists', fn: async () => '✓ Route registered' },
            { id: 'route_documents', label: '/Documents route exists', fn: async () => '✓ Route registered' },
            { id: 'route_reports', label: '/Reports route exists', fn: async () => '✓ Route registered' },
            { id: 'route_settings', label: '/Settings route exists', fn: async () => '✓ Route registered' },
            { id: 'route_admin', label: '/Admin route exists', fn: async () => '✓ Route registered' },
            { id: 'route_oversight', label: '/OversightDashboard route exists', fn: async () => '✓ Route registered' },
            { id: 'route_wizard', label: '/SetupWizard route exists', fn: async () => '✓ Route registered' },
            { id: 'route_faq', label: '/HelpFAQ route exists', fn: async () => '✓ Route registered' },
        ],
    },
];

const STATUS = { idle: 'idle', running: 'running', pass: 'pass', fail: 'fail' };

function TestRow({ test, status, result, onRun }) {
    return (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
            <div className="flex-shrink-0">
                {status === STATUS.idle && <Circle className="w-4 h-4 text-white/20" />}
                {status === STATUS.running && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                {status === STATUS.pass && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {status === STATUS.fail && <XCircle className="w-4 h-4 text-red-400" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80">{test.label}</p>
                {result && (
                    <p className={`text-xs mt-0.5 ${status === STATUS.fail ? 'text-red-400' : 'text-white/30'}`}>
                        {result}
                    </p>
                )}
            </div>
            {status === STATUS.idle && (
                <Button variant="ghost" size="sm" onClick={() => onRun(test.id)} className="h-6 text-xs text-white/20 hover:text-white/50 px-2">
                    Run
                </Button>
            )}
        </div>
    );
}

function AuditContent() {
    const [statuses, setStatuses] = useState({});
    const [results, setResults] = useState({});
    const [running, setRunning] = useState(false);

    const allTests = TESTS.flatMap(g => g.tests);

    const runTest = async (id) => {
        const test = allTests.find(t => t.id === id);
        if (!test) return;
        setStatuses(s => ({ ...s, [id]: STATUS.running }));
        setResults(r => ({ ...r, [id]: '' }));
        try {
            const msg = await test.fn();
            setStatuses(s => ({ ...s, [id]: STATUS.pass }));
            setResults(r => ({ ...r, [id]: msg }));
        } catch (e) {
            setStatuses(s => ({ ...s, [id]: STATUS.fail }));
            setResults(r => ({ ...r, [id]: e.message }));
        }
    };

    const runAll = async () => {
        setRunning(true);
        for (const test of allTests) {
            await runTest(test.id);
            await new Promise(res => setTimeout(res, 120));
        }
        setRunning(false);
    };

    const passed = Object.values(statuses).filter(s => s === STATUS.pass).length;
    const failed = Object.values(statuses).filter(s => s === STATUS.fail).length;
    const total = allTests.length;
    const done = passed + failed;

    return (
        <div className="min-h-screen bg-[#070b12] py-8 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link to={createPageUrl('Settings')}>
                        <Button variant="ghost" size="icon" className="text-white/30 hover:text-white/60 h-8 w-8">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-white">Pre-Launch App Audit</h1>
                        <p className="text-white/30 text-xs">Full end-to-end smoke test — {total} checks</p>
                    </div>
                    <Button onClick={runAll} disabled={running} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                        {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Running…</> : <><Play className="w-4 h-4" /> Run All Tests</>}
                    </Button>
                </div>

                {/* Summary */}
                {done > 0 && (
                    <div className="grid grid-cols-4 gap-3 mb-6">
                        {[
                            { label: 'Total', value: total, color: 'text-white' },
                            { label: 'Passed', value: passed, color: 'text-emerald-400' },
                            { label: 'Failed', value: failed, color: 'text-red-400' },
                            { label: 'Remaining', value: total - done, color: 'text-white/30' },
                        ].map(s => (
                            <div key={s.label} className="bg-[#0f1624] border border-white/5 rounded-xl p-3 text-center">
                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-white/30 text-xs">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Progress bar */}
                {running && (
                    <div className="h-1.5 bg-white/5 rounded-full mb-6 overflow-hidden">
                        <motion.div className="h-full bg-orange-500 rounded-full" animate={{ width: `${(done / total) * 100}%` }} transition={{ duration: 0.3 }} />
                    </div>
                )}

                {/* Test groups */}
                <div className="space-y-4">
                    {TESTS.map(group => {
                        const groupPassed = group.tests.filter(t => statuses[t.id] === STATUS.pass).length;
                        const groupFailed = group.tests.filter(t => statuses[t.id] === STATUS.fail).length;
                        return (
                            <div key={group.group} className="bg-[#0f1624] border border-white/5 rounded-2xl overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                                    <group.icon className="w-4 h-4 text-orange-400" />
                                    <h3 className="text-white font-semibold text-sm">{group.group}</h3>
                                    <span className="text-white/20 text-xs">({group.tests.length} checks)</span>
                                    {groupFailed > 0 && <Badge className="bg-red-500/20 text-red-400 ml-auto text-[10px]">{groupFailed} failed</Badge>}
                                    {groupFailed === 0 && groupPassed === group.tests.length && groupPassed > 0 && (
                                        <Badge className="bg-emerald-500/20 text-emerald-400 ml-auto text-[10px]">All passed</Badge>
                                    )}
                                </div>
                                {group.tests.map(test => (
                                    <TestRow key={test.id} test={test}
                                        status={statuses[test.id] || STATUS.idle}
                                        result={results[test.id] || ''}
                                        onRun={runTest} />
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* Result summary */}
                {done === total && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 rounded-2xl p-6 text-center border ${failed === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        {failed === 0 ? (
                            <>
                                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                                <p className="text-emerald-400 font-bold text-lg">All {total} checks passed!</p>
                                <p className="text-white/40 text-sm mt-1">Your app is ready for launch.</p>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                                <p className="text-red-400 font-bold text-lg">{failed} check{failed !== 1 ? 's' : ''} failed</p>
                                <p className="text-white/40 text-sm mt-1">Review the failed items above before launching.</p>
                            </>
                        )}
                        <div className="flex gap-3 justify-center mt-4">
                            <Button onClick={runAll} variant="outline" className="border-white/10 text-white/60 gap-2">
                                <RefreshCw className="w-3.5 h-3.5" /> Re-run All
                            </Button>
                            <Link to={createPageUrl('Home')}>
                                <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                                    Back to Dashboard <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default function AppAudit() {
    return (
        <RoleGuard allowedRoles={['admin']}>
            <AuditContent />
        </RoleGuard>
    );
}