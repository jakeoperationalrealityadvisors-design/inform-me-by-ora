import React from 'react';
import { useLanguage } from './LanguageContext';
import { languages } from './translations';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    
    const currentLanguage = languages.find(lang => lang.code === language);
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-slate-100 text-slate-600 h-9 w-9 sm:h-10 sm:w-10"
                >
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`cursor-pointer ${
                            language === lang.code ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                    >
                        <span className="mr-2 text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}