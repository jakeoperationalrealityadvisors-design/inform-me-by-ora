import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserProfile() {
    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => httpClient.auth.me(),
        retry: 2
    });

    if (!user) return null;

    const initials = user.full_name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0f1419] border border-blue-900/30">
            <Avatar className="w-8 h-8">
                <AvatarImage src={user.profile_photo_url} alt={user.full_name} />
                <AvatarFallback className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white text-xs">
                    {initials}
                </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-white hidden sm:block">
                {user.full_name || user.email}
            </span>
        </div>
    );
}