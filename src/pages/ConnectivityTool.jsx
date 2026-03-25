import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
    Wifi, WifiOff, RefreshCw, CheckCircle2, XCircle, AlertCircle, Clock,
    Upload, Download, ArrowLeft, Signal, Database, Cloud, Smartphone,
    Activity, ArrowUpRight, Loader2, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useUIProfile } from '@/components/ui-profile/UIProfileContext';

function useConnectivity() {
    const [online, setOnline] = useState(navigator.onLine);
    const [lastOnline, setLastOnline] = useState(navigator.onLine ? new Date() : null);
    const [latency, setLatency] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(() => {
        const s = localStorage.getItem('last_sync_time');
        return s ? new Date(s) : null;
    });
    const [queueSize, setQueueSize] = useState(0);
    const [syncHistory, setSyncHistory] = useState([]);

    useEffect(() => {
        const handleOnline = () => {
            setOnline(true);
            setLastOnline(new Date());
            addHistory('Connected', 'success');
        };
        const handleOffline = () => {
            setOnline(false);
            addHistory('Connection lost', 'error');
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        // Count queued offline items
        const keys = Object.keys(localStorage).filter(k => k.startsWith('offline_queue_'));
        setQueueSize(keys.length);
    }, []);

    const addHistory = (msg, status) => {
        setSyncHistory(h => [{ msg, status, time: new Date() }, ...h.slice(0, 9)]);
    };

    const measureLatency = async () => {
        if (!navigator.onLine) return setLatency(null);
        const start = Date.now();
        try {
            // Ping a small endpoint
            await fetch('https://www.google.com/favicon.ico', { method: 'HEAD', cache: 'no-cache', mode: 'no-cors' });
            setLatency(Date.now() - start);
        } catch {
            setLatency(null);
        }
    };

    const triggerSync = async () => {
        if (!navigator.onLine || syncing) return;
        setSyncing(true);
        addHistory('Sync started…', 'info');
        try {
            // Flush any queued items
            const keys = Object.keys(localStorage).filter(k => k.startsWith('offline_queue_'));
            let synced = 0;
            for (const key of keys) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (item?.entity && item?.data) {
                        await base44.entities[item.entity].create(item.data);
                    }
                    localStorage.removeItem(key);
                    synced++;
                } catch (e) {
                    addHistory(`Failed: ${key}`, 'error');
                }
            }
            setQueueSize(0);
            const now = new Date();
            setLastSync(now);
            localStorage.setItem('last_sync_time', now.toISOString());
            addHistory(`Sync complete — ${synced} item(s) synced`, 'success');
        } catch (e) {
            addHistory(`Sync failed: ${e.message}`, 'error');
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        measureLatency();
        const interval = setInterval(measureLatency, 30000);
        return () => clearInterval(interval);
    }, []);

    return { online, lastOnline, latency, syncing, lastSync, queueSize, syncHistory, triggerSync, measureLatency };
}

const OFFLINE_WORKS = [
    { icon: '✓', label: 'View assigned checklists', note: 'Cached at last sync' },
    { icon: '✓', label: 'Complete checklists (offline save)', note: 'Queued for sync' },
    { icon: '✓', label: 'Draft reports', note: 'Saved locally' },
    { icon: '✓', label: 'View saved documents', note: 'Locally cached' },
    { icon: '✓', label: 'Scanner — capture & save', note: 'Local storage' },
    { icon: '✓', label: 'Read message history', note: 'Cached messages' },
];

const NEEDS_CONNECTION = [
    { icon: '✗', label: 'Send new messages', note: 'Queued if offline' },
    { icon: '✗', label: 'Submit reports to server', note: 'Queued for sync' },
    { icon: '✗', label: 'Upload files or photos', note: 'Queued for sync' },
    { icon: '✗', label: 'Invite users / notifications', note: 'Requires server' },
    { icon: '✗', label: 'Real-time collaboration', note: 'Requires connection' },
    { icon: '✗', label: 'AI assistant features', note: 'Requires server' },
];

function StatusDot({ online }) {
    return (
        <span className="relative flex h-3 w-3">
            {online && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${online ? 'bg-emerald-400' : 'bg-red-500'}`} />
        </span>
    );
}

export default function ConnectivityTool() {
    const { online, lastOnline, latency, syncing, lastSync, queueSize, syncHistory, triggerSync, measureLatency } = useConnectivity();
    const { isSimple } = useUIProfile();
    const [showHistory, setShowHistory] = useState(false);
    const [showTroubleshoot, setShowTroubleshoot] = useState(false);

    const latencyColor = latency === null ? 'text-white/30' : latency < 100 ? 'text-emerald-400' : latency < 400 ? 'text-yellow-400' : 'text-red-400';
    const latencyLabel = latency === null ? '—' : `${latency}ms`;
    const signalQuality = latency === null ? 'No Signal' : latency < 100 ? 'Excellent' : latency < 250 ? 'Good' : latency < 500 ? 'Fair' : 'Poor';

    const formatTime = (date) => {
        if (!date) return 'Never';
        const diff = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-[#070b12] pb-24">
            {/* Header */}
            <div className="bg-[#0a0e17] border-b border-white/5 px-4 py-4 sticky top-0 z-20">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <Link to={createPageUrl('Home')}>
                        <Button variant="ghost" size="icon" className="text-white/30 hover:text-white/60 h-9 w-9">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-white font-bold text-lg leading-none">Connectivity</h1>
                        <p className="text-white/30 text-xs mt-0.5">Field network diagnostics & sync status</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={measureLatency} className="text-white/30 hover:text-white/60 h-9 w-9">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {/* BIG STATUS CARD */}
                <motion.div
                    className={`rounded-2xl p-6 border ${online ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}
                    animate={{ scale: [1, 1.005, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${online ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                            {online ? <Wifi className="w-8 h-8 text-emerald-400" /> : <WifiOff className="w-8 h-8 text-red-400" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <StatusDot online={online} />
                                <span className={`font-bold text-xl ${online ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {online ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            <p className="text-white/40 text-sm">
                                {online
                                    ? `Signal: ${signalQuality} · Latency: ${latencyLabel}`
                                    : `Last online: ${formatTime(lastOnline)}`
                                }
                            </p>
                        </div>
                        {queueSize > 0 && (
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/20">
                                {queueSize} queued
                            </Badge>
                        )}
                    </div>
                </motion.div>

                {/* METRICS ROW */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Latency', value: latencyLabel, sub: signalQuality, icon: Signal, color: latencyColor },
                        { label: 'Last Sync', value: formatTime(lastSync), sub: 'Auto sync', icon: Clock, color: 'text-blue-400' },
                        { label: 'Queue', value: String(queueSize), sub: queueSize === 0 ? 'All synced' : 'Pending', icon: Database, color: queueSize > 0 ? 'text-orange-400' : 'text-emerald-400' },
                    ].map(m => (
                        <div key={m.label} className="bg-[#0f1624] border border-white/5 rounded-xl p-3 text-center">
                            <m.icon className={`w-5 h-5 mx-auto mb-1 ${m.color}`} />
                            <p className={`font-bold text-lg ${m.color}`}>{m.value}</p>
                            <p className="text-white/30 text-[10px]">{m.label}</p>
                        </div>
                    ))}
                </div>

                {/* SYNC ACTION */}
                <div className="bg-[#0f1624] border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-white font-semibold text-sm">Data Sync</p>
                            <p className="text-white/30 text-xs">{queueSize > 0 ? `${queueSize} item(s) waiting to upload` : 'All data is synced'}</p>
                        </div>
                        <Button onClick={triggerSync} disabled={syncing || !online}
                            className={`gap-2 ${online ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-white/5 text-white/20'}`}>
                            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            {syncing ? 'Syncing…' : 'Sync Now'}
                        </Button>
                    </div>

                    {/* Sync progress bar */}
                    {syncing && (
                        <motion.div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-orange-500 rounded-full"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
                        </motion.div>
                    )}

                    {!online && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Sync paused — waiting for connection. Data is saved locally.</span>
                        </div>
                    )}
                </div>

                {/* WHAT WORKS OFFLINE vs NEEDS CONNECTION */}
                <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-[#0f1624] border border-emerald-500/10 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <p className="text-white font-semibold text-sm">Works Offline</p>
                        </div>
                        <div className="space-y-2">
                            {OFFLINE_WORKS.map(item => (
                                <div key={item.label} className="flex items-start gap-2">
                                    <span className="text-emerald-400 text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                                    <div>
                                        <p className="text-white/70 text-xs">{item.label}</p>
                                        <p className="text-white/30 text-[10px]">{item.note}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-[#0f1624] border border-red-500/10 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <XCircle className="w-4 h-4 text-red-400" />
                            <p className="text-white font-semibold text-sm">Needs Connection</p>
                        </div>
                        <div className="space-y-2">
                            {NEEDS_CONNECTION.map(item => (
                                <div key={item.label} className="flex items-start gap-2">
                                    <span className="text-red-400 text-xs font-bold mt-0.5 flex-shrink-0">✗</span>
                                    <div>
                                        <p className="text-white/70 text-xs">{item.label}</p>
                                        <p className="text-white/30 text-[10px]">{item.note}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SYNC HISTORY */}
                {syncHistory.length > 0 && (
                    <div className="bg-[#0f1624] border border-white/5 rounded-2xl overflow-hidden">
                        <button onClick={() => setShowHistory(h => !h)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-white/30" />
                                <span className="text-white/60 text-sm font-medium">Event Log</span>
                                <Badge className="bg-white/5 text-white/30 text-[10px]">{syncHistory.length}</Badge>
                            </div>
                            {showHistory ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
                        </button>
                        <AnimatePresence>
                            {showHistory && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                    <div className="border-t border-white/5 divide-y divide-white/5">
                                        {syncHistory.map((h, i) => (
                                            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                                                {h.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                                                {h.status === 'error' && <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                                                {h.status === 'info' && <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                                                <span className="text-white/60 text-xs flex-1">{h.msg}</span>
                                                <span className="text-white/20 text-[10px]">{h.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* TROUBLESHOOTING */}
                <div className="bg-[#0f1624] border border-white/5 rounded-2xl overflow-hidden">
                    <button onClick={() => setShowTroubleshoot(t => !t)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-400/50" />
                            <span className="text-white/60 text-sm font-medium">Troubleshooting Guide</span>
                        </div>
                        {showTroubleshoot ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
                    </button>
                    <AnimatePresence>
                        {showTroubleshoot && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                <div className="border-t border-white/5 p-4 space-y-4 text-sm text-white/50">
                                    {[
                                        ['App shows offline but I have signal', "Try refreshing the page. The offline detector uses the browser's network API — sometimes it lags. If signal is weak, the ping test may timeout."],
                                        ['Sync fails after reconnecting', "Tap 'Sync Now' manually. If that fails, check your account session hasn't expired. Try logging out and back in."],
                                        ['Data I submitted isn\'t showing up', 'Check the queue count above. If items are stuck in queue, force sync. If the queue is empty and data still missing, contact support.'],
                                        ['App is very slow on field network', 'Enable Offline Mode in Settings to pre-cache forms and checklists. This reduces live requests to near zero.'],
                                        ['Push notifications not arriving', 'Go to Settings → Notifications. Ensure permissions are granted in your browser/device settings, then tap "Send Test Notification".'],
                                    ].map(([q, a]) => (
                                        <div key={q}>
                                            <p className="text-white/70 font-medium mb-1">Q: {q}</p>
                                            <p>{a}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}