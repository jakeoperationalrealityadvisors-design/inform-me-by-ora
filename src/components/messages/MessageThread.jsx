import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Paperclip, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function MessageThread({ conversation, currentUser, onBack }) {
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');
    const [showSnippets, setShowSnippets] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const TEXT_SNIPPETS = [
        { label: 'On my way', text: 'On my way!' },
        { label: 'Got it', text: 'Got it, thanks!' },
        { label: 'Will do', text: 'Will do, thanks!' },
        { label: 'Please confirm', text: 'Can you please confirm?' },
        { label: 'Completed', text: 'Task completed ✓' },
        { label: 'Need more info', text: 'Could you provide more details?' },
    ];
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    useEffect(() => {
        scrollToBottom();
        
        // Mark messages as read
        const unreadMessages = conversation.messages.filter(
            msg => !msg.read_by?.includes(currentUser.email)
        );
        
        unreadMessages.forEach(msg => {
            base44.entities.Message.update(msg.id, {
                read_by: [...(msg.read_by || []), currentUser.email]
            });
        });
    }, [conversation.messages, currentUser.email]);
    
    const sendMessageMutation = useMutation({
        mutationFn: async (content) => {
            return await base44.entities.Message.create({
                content,
                sender_email: currentUser.email,
                sender_name: currentUser.full_name || currentUser.email,
                conversation_type: conversation.type,
                conversation_id: conversation.id,
                conversation_name: conversation.name,
                participants: conversation.participants,
                read_by: [currentUser.email]
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['messages']);
            setMessage('');
        },
        onError: (error) => {
            toast.error('Failed to send message: ' + error.message);
        }
    });
    
    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        sendMessageMutation.mutate(message);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    const insertSnippet = (text) => {
        setMessage(text);
        setShowSnippets(false);
        inputRef.current?.focus();
    };
    
    const getConversationTitle = () => {
        if (conversation.name) return conversation.name;
        
        if (conversation.type === 'direct') {
            const otherUser = conversation.participants.find(p => p !== currentUser.email);
            return otherUser?.split('@')[0] || 'Unknown';
        }
        
        return `${conversation.participants.length} participants`;
    };
    
    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 p-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="md:hidden rounded-full hover:bg-blue-950/50 text-blue-400"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <h2 className="font-semibold text-white">{getConversationTitle()}</h2>
                        <p className="text-sm text-blue-400">
                            {conversation.type === 'direct' ? 'Direct Message' : 
                             conversation.type === 'group' ? 'Group Chat' : 'Team Chat'}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversation.messages
                    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
                    .map((msg) => {
                        const isOwn = msg.sender_email === currentUser.email;
                        
                        return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                    {!isOwn && (
                                        <p className="text-xs text-blue-400 mb-1">{msg.sender_name}</p>
                                    )}
                                    <div className={`rounded-lg p-3 ${
                                        isOwn 
                                            ? 'bg-purple-600 text-white' 
                                            : 'bg-[#0f1419] text-blue-100 border border-blue-900/20'
                                    }`}>
                                        <p className="text-sm break-words">{msg.content}</p>
                                        <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-blue-400'}`}>
                                            {format(new Date(msg.created_date), 'h:mm a')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="bg-[#0f1419] border-t border-blue-900/20 p-4 space-y-2">
                {/* Quick text snippets */}
                {showSnippets && (
                    <div className="flex flex-wrap gap-1.5 pb-2">
                        {TEXT_SNIPPETS.map((s) => (
                            <button
                                key={s.label}
                                onClick={() => insertSnippet(s.text)}
                                className="px-2.5 py-1 text-xs rounded-full bg-purple-900/40 text-purple-200 border border-purple-700/40 hover:bg-purple-700/50 transition-colors"
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                )}
                <form onSubmit={handleSend} className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setShowSnippets(v => !v)}
                        className="p-2 rounded-lg bg-[#0a0e17] border border-blue-900/30 text-blue-400 hover:text-blue-200 hover:bg-blue-950/50 transition-colors shrink-0"
                        title="Quick replies"
                    >
                        <ChevronDown className={`w-4 h-4 transition-transform ${showSnippets ? 'rotate-180' : ''}`} />
                    </button>
                    <Input
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message… (Enter to send)"
                        className="flex-1 bg-[#0a0e17] border-blue-900/30 text-white"
                        disabled={sendMessageMutation.isPending}
                    />
                    <Button
                        type="submit"
                        disabled={!message.trim() || sendMessageMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}