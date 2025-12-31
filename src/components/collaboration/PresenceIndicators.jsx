import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function PresenceIndicators({ users }) {
    if (!users || users.length === 0) return null;

    const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-orange-500',
        'bg-teal-500',
        'bg-red-500',
        'bg-yellow-500'
    ];

    return (
        <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <div className="flex -space-x-2">
                <AnimatePresence>
                    {users.slice(0, 5).map((user, idx) => {
                        const initials = user.user_name
                            ?.split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2) || '?';

                        return (
                            <motion.div
                                key={user.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Avatar className={`w-8 h-8 border-2 border-[#0a0e17] ${colors[idx % colors.length]} ring-2 ring-offset-2 ring-offset-[#0a0e17] ${user.is_editing ? 'ring-green-400' : 'ring-gray-500'}`}>
                                                <AvatarFallback className="text-white text-xs font-bold">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-sm">
                                                {user.user_name}
                                                {user.is_editing ? ' (editing)' : ' (viewing)'}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {users.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#0a0e17] flex items-center justify-center">
                        <span className="text-xs text-white font-bold">+{users.length - 5}</span>
                    </div>
                )}
            </div>
        </div>
    );
}