import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { HelpCircle, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function TooltipHelper({ id, title, description, position = 'bottom' }) {
    const [dismissed, setDismissed] = useState(false);
    const [open, setOpen] = useState(false);
    
    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });
    
    useEffect(() => {
        if (user?.completed_tutorials?.includes(id)) {
            setDismissed(true);
        }
    }, [user, id]);
    
    const handleDismiss = async () => {
        setDismissed(true);
        setOpen(false);
        
        if (user) {
            const completedTutorials = user.completed_tutorials || [];
            await base44.auth.updateMe({
                completed_tutorials: [...completedTutorials, id]
            });
        }
    };
    
    if (user?.technical_level === 'expert' || user?.preferred_tutorial_style === 'none') {
        return null;
    }
    
    if (dismissed) {
        return null;
    }
    
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" />
                </button>
            </PopoverTrigger>
            <PopoverContent 
                className="w-80 bg-gradient-to-br from-blue-950 to-slate-900 border-blue-900/50 text-white shadow-xl"
                side={position}
            >
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h4 className="font-semibold text-[#FF8C00]">{title}</h4>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-blue-300 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-sm text-blue-200 leading-relaxed">{description}</p>
                    <Button
                        onClick={handleDismiss}
                        size="sm"
                        className="w-full bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black"
                    >
                        Got it!
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}