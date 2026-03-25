import React from 'react';
import { useUIProfile, UI_MODES } from '@/components/ui-profile/UIProfileContext';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ExperienceLevelPicker() {
    const { mode, setMode, loading } = useUIProfile();

    const handleSelect = async (id) => {
        if (id === mode) return;
        await setMode(id);
        toast.success(`UI switched to ${UI_MODES[id].label}`);
    };

    if (loading) return (
        <div className="flex items-center gap-2 text-white/30 py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading preferences…</span>
        </div>
    );

    return (
        <div className="space-y-3">
            {Object.values(UI_MODES).map((m) => {
                const active = mode === m.id;
                return (
                    <motion.button
                        key={m.id}
                        onClick={() => handleSelect(m.id)}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left rounded-xl border transition-all p-4 flex items-center gap-4 ${
                            active
                                ? 'bg-gradient-to-r from-orange-500/20 to-blue-600/10 border-orange-500/40'
                                : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                        }`}
                    >
                        <span className="text-2xl flex-shrink-0">{m.icon}</span>
                        <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${active ? 'text-orange-400' : 'text-white/80'}`}>
                                {m.label}
                            </p>
                            <p className="text-white/40 text-xs mt-0.5">{m.description}</p>
                        </div>
                        {active && <CheckCircle2 className="w-5 h-5 text-orange-400 flex-shrink-0" />}
                    </motion.button>
                );
            })}

            <p className="text-white/20 text-xs px-1 pt-1">
                Changes apply immediately and persist across devices.
            </p>
        </div>
    );
}