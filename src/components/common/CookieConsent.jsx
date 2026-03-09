import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            // Small delay so it doesn't flash immediately on load
            const t = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(t);
        }
    }, []);

    const accept = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setVisible(false);
    };

    const decline = () => {
        localStorage.setItem('cookie_consent', 'declined');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-20 left-0 right-0 z-[200] flex justify-center px-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm">
            <div className="w-full bg-[#0d1424] border border-blue-900/40 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FF8C00]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Cookie className="w-4 h-4 text-[#FF8C00]" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white mb-1">Cookie Notice</p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            We use essential cookies to keep you logged in and remember your preferences. No tracking or ads.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={accept}
                        size="sm"
                        className="flex-1 bg-[#FF8C00] hover:bg-[#CC7000] text-black font-semibold text-xs h-8"
                    >
                        Accept
                    </Button>
                    <Button
                        onClick={decline}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white text-xs h-8"
                    >
                        Decline
                    </Button>
                </div>
            </div>
        </div>
    );
}