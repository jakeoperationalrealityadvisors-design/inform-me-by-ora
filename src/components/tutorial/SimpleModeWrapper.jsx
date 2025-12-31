import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useSimpleMode() {
    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });
    
    return {
        isSimpleMode: user?.technical_level === 'simple',
        isBeginnerMode: user?.technical_level === 'beginner',
        isExpertMode: user?.technical_level === 'expert',
        technicalLevel: user?.technical_level || 'intermediate'
    };
}

export function SimpleModeButton({ children, label, ...props }) {
    const { isSimpleMode } = useSimpleMode();
    
    if (isSimpleMode) {
        return (
            <button
                {...props}
                className={`${props.className || ''} ${isSimpleMode ? 'min-h-[48px] text-base font-semibold' : ''}`}
            >
                {children}
                {isSimpleMode && label && <span className="block text-xs font-normal mt-1 opacity-80">{label}</span>}
            </button>
        );
    }
    
    return <button {...props}>{children}</button>;
}