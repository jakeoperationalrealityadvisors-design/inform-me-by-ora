import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from "@/components/ui/button";
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