import React from 'react';
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function ConversationList({ conversations, selectedId, onSelect, currentUserEmail }) {
    const getConversationName = (conv) => {
        if (conv.name) return conv.name;
        
        if (conv.type === 'direct') {
            const otherUser = conv.participants.find(p => p !== currentUserEmail);
            return otherUser?.split('@')[0] || 'Unknown';
        }
        
        return `${conv.participants.length} participants`;
    };
    
    const getConversationAvatar = (conv) => {
        if (conv.type === 'direct') return <MessageCircle className="w-5 h-5" />;
        return <Users className="w-5 h-5" />;
    };
    
    if (conversations.length === 0) {
        return (
            <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-blue-400/30 mx-auto mb-3" />
                <p className="text-blue-400 text-sm">No conversations yet</p>
            </div>
        );
    }
    
    return (
        <div className="divide-y divide-blue-900/20">
            {conversations.map((conv) => (
                <button
                    key={conv.id}
                    onClick={() => onSelect(conv)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-[#0a0e17] transition-colors ${
                        selectedId === conv.id ? 'bg-[#0a0e17]' : ''
                    }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        conv.type === 'direct' ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'
                    }`}>
                        {getConversationAvatar(conv)}
                    </div>
                    
                    <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-white truncate">{getConversationName(conv)}</p>
                            <span className="text-xs text-blue-400 flex-shrink-0 ml-2">
                                {format(new Date(conv.lastMessage.created_date), 'MMM d')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-blue-300 truncate">
                                {conv.lastMessage.sender_email === currentUserEmail ? 'You: ' : ''}
                                {conv.lastMessage.content}
                            </p>
                            {conv.unreadCount > 0 && (
                                <Badge className="bg-[#FF8C00] text-white ml-2 flex-shrink-0">
                                    {conv.unreadCount}
                                </Badge>
                            )}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}