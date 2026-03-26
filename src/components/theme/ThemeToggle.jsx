import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from './ThemeContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const labels = { auto: 'Auto (System)', light: 'Light Mode', dark: 'Dark Mode' };
const icons = { auto: Monitor, light: Sun, dark: Moon };

export default function ThemeToggle({ showLabel = false }) {
    const { theme, cycleTheme } = useTheme();
    const Icon = icons[theme];

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size={showLabel ? 'sm' : 'icon'}
                        onClick={cycleTheme}
                        className="rounded-full gap-2"
                    >
                        <Icon className="w-4 h-4 text-orange-500" />
                        {showLabel && <span className="text-xs">{labels[theme]}</span>}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Theme: {labels[theme]} — click to cycle</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
} from "@/components/ui/button";
import { useTheme } from './ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-orange-500" />
            ) : (
                <Moon className="w-5 h-5 text-slate-700" />
            )}
        </Button>
    );
}