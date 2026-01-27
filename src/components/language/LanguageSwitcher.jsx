import React from 'react';
import { useLanguage } from './LanguageContext';
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    
    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'fr' : 'en');
    };
    
    return (
        <Button 
            onClick={toggleLanguage}
            variant="ghost" 
            size="sm"
            className="rounded-full hover:bg-blue-950/50 text-blue-300 h-9 px-3 sm:h-10 sm:px-4 font-medium"
        >
            {language === 'en' ? '🇺🇸 EN' : '🇫🇷 FR'}
        </Button>
    );
}