import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOUR_KEY = 'onboarding_tour_done_v1';

const steps = [
    {
        title: 'Welcome to InForm Me 👋',
        description: 'This quick tour will show you the key features in about 30 seconds. You can skip anytime.',
        icon: '🎉',
    },
    {
        title: 'Forms & Checklists',
        description: 'Tap a Form to fill it out and submit. Tap a Checklist to work through items one by one.',
        icon: '📋',
    },
    {
        title: 'Use the + Button',
        description: 'Admins can create new forms and checklists using the orange + button in the top right.',
        icon: '➕',
    },
    {
        title: 'Search & Filter',
        description: 'Use the search bar to find forms by name, or filter by category using the dropdown.',
        icon: '🔍',
    },
    {
        title: 'My Tasks',
        description: 'Any work assigned to you appears under "My Tasks" — accessible from the menu or bottom nav.',
        icon: '✅',
    },
    {
        title: 'Works Offline',
        description: 'Enable Offline Mode in Settings to access forms without internet. Perfect for the field.',
        icon: '📡',
    },
    {
        title: "You're all set!",
        description: 'Explore freely. You can re-run this tour anytime from Settings → Help.',
        icon: '🚀',
    },
];

export default function OnboardingTour({ forceShow = false, onDone }) {
    const [active, setActive] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (forceShow) {
            setActive(true);
            setStep(0);
            return;
        }
        const done = localStorage.getItem(TOUR_KEY);
        if (!done) {
            const t = setTimeout(() => setActive(true), 800);
            return () => clearTimeout(t);
        }
    }, [forceShow]);

    const finish = () => {
        localStorage.setItem(TOUR_KEY, 'true');
        setActive(false);
        onDone?.();
    };

    const next = () => {
        if (step < steps.length - 1) setStep(s => s + 1);
        else finish();
    };

    const prev = () => setStep(s => Math.max(0, s - 1));

    return (
        <AnimatePresence>
            {active && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50"
                        onClick={finish}
                    />
                    {/* Card */}
                    <motion.div
                        key="card"
                        initial={{ opacity: 0, y: 60, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-8 sm:bottom-10 sm:w-96 z-50 bg-[#0f1419] border border-blue-800/40 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Progress bar */}
                        <div className="h-1 bg-blue-900/30">
                            <div
                                className="h-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] transition-all duration-400"
                                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                            />
                        </div>

                        <div className="p-5">
                            {/* Close */}
                            <button onClick={finish} className="absolute top-3 right-3 text-blue-600 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>

                            {/* Step count */}
                            <p className="text-xs text-blue-600 mb-3 font-medium">
                                Step {step + 1} of {steps.length}
                            </p>

                            {/* Content */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="text-3xl mb-2">{steps[step].icon}</div>
                                    <h3 className="text-white font-bold text-lg mb-1">{steps[step].title}</h3>
                                    <p className="text-blue-300 text-sm leading-relaxed">{steps[step].description}</p>
                                </motion.div>
                            </AnimatePresence>

                            {/* Nav buttons */}
                            <div className="flex items-center justify-between mt-5">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={prev}
                                    disabled={step === 0}
                                    className="text-blue-500 hover:text-white disabled:opacity-0"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={next}
                                    className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white px-5"
                                >
                                    {step === steps.length - 1 ? 'Done' : 'Next'}
                                    {step < steps.length - 1 && <ArrowRight className="w-4 h-4 ml-1" />}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Small trigger button to re-launch the tour
export function TourTrigger({ className = '' }) {
    const [show, setShow] = useState(false);
    return (
        <>
            <button
                onClick={() => setShow(true)}
                className={`flex items-center gap-2 text-sm text-blue-400 hover:text-[#FF8C00] transition-colors ${className}`}
            >
                <Lightbulb className="w-4 h-4" />
                Take the Tour
            </button>
            {show && <OnboardingTour forceShow onDone={() => setShow(false)} />}
        </>
    );
}