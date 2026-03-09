import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle2, Circle, Smartphone, Package, Coffee, Terminal, Globe, AlertCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const steps = [
    {
        id: 'base44',
        icon: Globe,
        color: 'text-orange-400',
        title: 'Step 1 — Publish via Base44 (Recommended)',
        description: 'The easiest way. No local setup needed.',
        items: [
            'Go to your Base44 Dashboard',
            'Click "Publish" → "Mobile App (Android / iOS)"',
            'Base44 handles Node, Capacitor, and build pipeline automatically',
            'Download your .apk or submit to Google Play from the dashboard',
        ],
        note: 'If you use Base44 publishing, you can skip Steps 2–5 below.',
        type: 'recommended'
    },
    {
        id: 'node',
        icon: Terminal,
        color: 'text-green-400',
        title: 'Step 2 — Install Node.js',
        description: 'Required for building the app locally.',
        items: [
            'Download Node.js v18+ from https://nodejs.org',
            'Run: node --version (should show v18 or higher)',
            'Run: npm --version (should show v9 or higher)',
        ],
        commands: ['node --version', 'npm --version'],
        type: 'manual'
    },
    {
        id: 'java',
        icon: Coffee,
        color: 'text-yellow-400',
        title: 'Step 3 — Install Java JDK 17',
        description: 'Required to compile Android apps.',
        items: [
            'Download Java JDK 17 from https://adoptium.net',
            'Set JAVA_HOME environment variable to your JDK path',
            'Run: java --version (should show version 17)',
        ],
        commands: ['java --version'],
        type: 'manual'
    },
    {
        id: 'android',
        icon: Smartphone,
        color: 'text-blue-400',
        title: 'Step 4 — Install Android Studio',
        description: 'Required for Android SDK and emulator.',
        items: [
            'Download Android Studio from https://developer.android.com/studio',
            'During install, enable: Android SDK, Android SDK Platform, Android Virtual Device',
            'Set ANDROID_HOME environment variable to your SDK path',
            'Accept all SDK licenses: sdkmanager --licenses',
        ],
        commands: ['sdkmanager --licenses'],
        type: 'manual'
    },
    {
        id: 'capacitor',
        icon: Package,
        color: 'text-purple-400',
        title: 'Step 5 — Install Capacitor & Build',
        description: 'Wraps your web app into a native Android app.',
        items: [
            'npm install @capacitor/core @capacitor/android @capacitor/cli',
            'npx cap init "InForm Me" com.informme.app --web-dir dist',
            'npx cap add android',
            'npm run build (builds your web app)',
            'npx cap sync (copies web assets to Android)',
            'npx cap open android (opens in Android Studio)',
            'In Android Studio: Build → Generate Signed APK',
        ],
        commands: [
            'npm install @capacitor/core @capacitor/android @capacitor/cli',
            'npx cap init "InForm Me" com.informme.app --web-dir dist',
            'npx cap add android',
            'npm run build && npx cap sync',
            'npx cap open android'
        ],
        type: 'manual'
    },
    {
        id: 'publish',
        icon: Globe,
        color: 'text-pink-400',
        title: 'Step 6 — Publish to Google Play',
        description: 'Submit your app to the Google Play Store.',
        items: [
            'Create a Google Play Developer Account at play.google.com/console ($25 one-time fee)',
            'In Android Studio: Build → Generate Signed Bundle/APK → Android App Bundle (.aab)',
            'Upload the .aab file in Play Console → Create App',
            'Fill in store listing, screenshots, privacy policy URL',
            'Submit for review (usually 1–3 business days)',
        ],
        type: 'manual'
    }
];

function CommandBlock({ cmd }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(cmd);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <div className="flex items-center justify-between bg-black/50 rounded-lg px-3 py-2 font-mono text-sm text-green-300 group">
            <span>{cmd}</span>
            <button onClick={copy} className="ml-3 text-gray-500 hover:text-white transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
        </div>
    );
}

export default function MobileReadiness() {
    const [checked, setChecked] = useState({});
    const [expanded, setExpanded] = useState({ base44: true });

    const toggle = (id) => setChecked(p => ({ ...p, [id]: !p[id] }));
    const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

    const totalItems = steps.flatMap(s => s.items).length;
    const checkedCount = Object.values(checked).filter(Boolean).length;
    const progress = Math.round((checkedCount / totalItems) * 100);

    return (
        <div className="min-h-screen bg-[#0a0e17]">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-20">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to={createPageUrl('Settings')}>
                        <Button variant="ghost" size="icon" className="rounded-full text-blue-400">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-[#FF8C00]" />
                            Mobile Readiness Guide
                        </h1>
                        <p className="text-sm text-blue-400">Android publishing checklist</p>
                    </div>
                    <Badge className="bg-[#FF8C00]/20 text-[#FF8C00] border-[#FF8C00]/30">
                        {progress}% done
                    </Badge>
                </div>
                {/* Progress bar */}
                <div className="h-1 bg-blue-900/30">
                    <div
                        className="h-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4 pb-20">
                {/* Recommendation banner */}
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-blue-200 font-semibold text-sm">Recommended: Use Base44 Publishing</p>
                        <p className="text-blue-400 text-sm mt-0.5">
                            Base44 can build and publish your Android app automatically — no local tools needed. 
                            Use the steps below only if you want to build manually.
                        </p>
                    </div>
                </div>

                {steps.map((step) => {
                    const Icon = step.icon;
                    const isOpen = expanded[step.id];
                    const stepChecked = step.items.filter((_, i) => checked[`${step.id}_${i}`]).length;

                    return (
                        <Card key={step.id} className={`bg-[#0f1419] border-blue-900/20 ${step.type === 'recommended' ? 'border-[#FF8C00]/30' : ''}`}>
                            <button
                                className="w-full text-left"
                                onClick={() => toggleExpand(step.id)}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-5 h-5 ${step.color}`} />
                                            <div>
                                                <CardTitle className="text-white text-base">{step.title}</CardTitle>
                                                <CardDescription className="text-blue-400 text-sm">{step.description}</CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {stepChecked > 0 && (
                                                <Badge className="bg-green-900/30 text-green-400 border-green-900/30 text-xs">
                                                    {stepChecked}/{step.items.length}
                                                </Badge>
                                            )}
                                            {isOpen ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4 text-blue-400" />}
                                        </div>
                                    </div>
                                </CardHeader>
                            </button>

                            {isOpen && (
                                <CardContent className="pt-0 space-y-3">
                                    {step.note && (
                                        <div className="bg-[#FF8C00]/10 border border-[#FF8C00]/20 rounded-lg px-3 py-2">
                                            <p className="text-[#FF8C00] text-sm">{step.note}</p>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        {step.items.map((item, i) => {
                                            const key = `${step.id}_${i}`;
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => toggle(key)}
                                                    className="w-full flex items-start gap-3 text-left group"
                                                >
                                                    {checked[key]
                                                        ? <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                        : <Circle className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5 group-hover:text-blue-400 transition-colors" />
                                                    }
                                                    <span className={`text-sm ${checked[key] ? 'line-through text-blue-600' : 'text-blue-200'}`}>
                                                        {item}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {step.commands && (
                                        <div className="space-y-2 pt-2">
                                            <p className="text-xs text-blue-500 font-medium uppercase tracking-wider">Terminal Commands</p>
                                            {step.commands.map((cmd, i) => (
                                                <CommandBlock key={i} cmd={cmd} />
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    );
                })}

                {/* Done state */}
                {progress === 100 && (
                    <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-6 text-center">
                        <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
                        <p className="text-white font-bold text-lg">All steps complete!</p>
                        <p className="text-green-400 text-sm">Your app is ready for Android publishing.</p>
                    </div>
                )}
            </div>
        </div>
    );
}