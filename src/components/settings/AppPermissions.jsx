import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Bell, MapPin, Mic, CheckCircle2, XCircle, AlertCircle, Shield } from 'lucide-react';

const PERMISSIONS = [
    {
        key: 'camera',
        label: 'Camera',
        desc: 'Used for scanning documents & taking photos',
        icon: Camera,
        color: 'text-blue-400',
        api: () => navigator.mediaDevices.getUserMedia({ video: true }).then(s => { s.getTracks().forEach(t => t.stop()); })
    },
    {
        key: 'microphone',
        label: 'Microphone',
        desc: 'Used for voice input features',
        icon: Mic,
        color: 'text-purple-400',
        api: () => navigator.mediaDevices.getUserMedia({ audio: true }).then(s => { s.getTracks().forEach(t => t.stop()); })
    },
    {
        key: 'notifications',
        label: 'Notifications',
        desc: 'Push alerts for tasks, messages & deadlines',
        icon: Bell,
        color: 'text-orange-400',
        api: () => Notification.requestPermission()
    },
    {
        key: 'geolocation',
        label: 'Location',
        desc: 'Tag submissions with GPS coordinates',
        icon: MapPin,
        color: 'text-green-400',
        api: () => new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej))
    },
];

const statusBadge = (status) => {
    if (status === 'granted') return <Badge className="bg-green-900/40 text-green-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Granted</Badge>;
    if (status === 'denied') return <Badge className="bg-red-900/40 text-red-300 flex items-center gap-1"><XCircle className="w-3 h-3" /> Denied</Badge>;
    return <Badge className="bg-yellow-900/40 text-yellow-300 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Not Set</Badge>;
};

export default function AppPermissions() {
    const [statuses, setStatuses] = useState({});
    const [requesting, setRequesting] = useState({});

    useEffect(() => {
        checkAll();
    }, []);

    const checkAll = async () => {
        const results = {};
        for (const perm of PERMISSIONS) {
            if (perm.key === 'notifications') {
                results[perm.key] = Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'prompt';
            } else if (perm.key === 'geolocation' || perm.key === 'camera' || perm.key === 'microphone') {
                try {
                    if (navigator.permissions) {
                        const name = perm.key === 'geolocation' ? 'geolocation' : perm.key === 'camera' ? 'camera' : 'microphone';
                        const result = await navigator.permissions.query({ name });
                        results[perm.key] = result.state;
                    } else {
                        results[perm.key] = 'prompt';
                    }
                } catch {
                    results[perm.key] = 'prompt';
                }
            }
        }
        setStatuses(results);
    };

    const requestPermission = async (perm) => {
        setRequesting(r => ({ ...r, [perm.key]: true }));
        try {
            await perm.api();
            setStatuses(s => ({ ...s, [perm.key]: 'granted' }));
        } catch {
            setStatuses(s => ({ ...s, [perm.key]: 'denied' }));
        }
        setRequesting(r => ({ ...r, [perm.key]: false }));
    };

    return (
        <Card className="bg-[#0f1419] border-blue-900/20">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#FF8C00]" />
                    App Permissions
                </CardTitle>
                <CardDescription className="text-blue-400">
                    Required device permissions for full app functionality
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {PERMISSIONS.map((perm) => {
                    const Icon = perm.icon;
                    const status = statuses[perm.key] || 'prompt';
                    return (
                        <div key={perm.key} className="flex items-center justify-between gap-3 p-3 bg-[#0a0e17] rounded-lg border border-blue-900/20">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Icon className={`w-5 h-5 shrink-0 ${perm.color}`} />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white">{perm.label}</p>
                                    <p className="text-xs text-blue-400 truncate">{perm.desc}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {statusBadge(status)}
                                {status !== 'granted' && status !== 'denied' && (
                                    <Button
                                        size="sm"
                                        onClick={() => requestPermission(perm)}
                                        disabled={requesting[perm.key]}
                                        className="h-7 px-2 text-xs bg-blue-700 hover:bg-blue-600"
                                    >
                                        Allow
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}