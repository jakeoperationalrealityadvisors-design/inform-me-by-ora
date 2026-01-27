import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstall, setShowInstall] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if already dismissed
        const isDismissed = localStorage.getItem('pwa-install-dismissed');
        if (isDismissed) {
            setDismissed(true);
            return;
        }

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowInstall(false);
        }

        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowInstall(false);
        setDismissed(true);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {showInstall && !dismissed && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:bottom-4 sm:w-96"
                >
                    <div className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] p-4 rounded-xl shadow-2xl">
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                                <img 
                                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/inform-me-by-ora-prod/public/6954526c42ec916a050b905d/d38d72306_file_00000000ab1471f5a410df212e51129f1.png"
                                    alt="InForm Me"
                                    className="w-10 h-10 rounded"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white mb-1">Install InForm Me</h3>
                                <p className="text-white/90 text-sm mb-3">
                                    Get instant access and work offline. Install our app for the best experience.
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleInstall}
                                        size="sm"
                                        className="bg-white text-[#1E40AF] hover:bg-white/90 flex-1"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Install
                                    </Button>
                                    <Button
                                        onClick={handleDismiss}
                                        size="sm"
                                        variant="ghost"
                                        className="text-white hover:bg-white/20"
                                    >
                                        Later
                                    </Button>
                                </div>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="text-white/80 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}