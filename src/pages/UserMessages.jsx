import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function UserMessages() {
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);

    const loadMessages = (email) => {
        base44.entities.Message.filter({ conversation_id: `admin-${email}` }, 'created_date', 100).then(m => {
            setMessages(m);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        base44.auth.me().then(u => {
            setUser(u);
            if (u?.email) loadMessages(u.email);
        });
    }, []);

    useEffect(() => {
        if (!user?.email) return;
        const unsub = base44.entities.Message.subscribe(ev => {
            if (ev.type === 'create' && ev.data.conversation_id === `admin-${user.email}`) {
                setMessages(prev => [...prev, ev.data]);
            }
        });
        return unsub;
    }, [user]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async () => {
        if (!text.trim() || !user) return;
        setSending(true);
        await base44.entities.Message.create({
            content: text.trim(),
            sender_email: user.email,
            sender_name: user.full_name || 'User',
            conversation_type: 'direct',
            conversation_id: `admin-${user.email}`,
            participants: [user.email],
            read_by: [user.email],
        });
        setText('');
        setSending(false);
        loadMessages(user.email);
    };

    // Also show broadcast messages
    const allMessages = messages.concat(
        messages.filter(m => m.conversation_id === 'broadcast')
    ).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

    const displayMessages = messages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

    return (
        <div className="flex flex-col h-[calc(100vh-9rem)] sm:h-[calc(100vh-6rem)]">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-700 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                    <span className="text-orange-400 font-bold text-sm">A</span>
                </div>
                <div>
                    <p className="text-white font-semibold">Admin</p>
                    <p className="text-slate-400 text-xs">Your team manager</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-2">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-6 h-6 border-4 border-slate-600 border-t-orange-500 rounded-full animate-spin" />
                    </div>
                ) : displayMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <MessageSquare className="w-12 h-12 text-slate-600 mb-3" />
                        <p className="text-slate-400 font-medium">No messages yet</p>
                        <p className="text-slate-500 text-sm mt-1">Send a message to your admin below</p>
                    </div>
                ) : (
                    displayMessages.map(msg => {
                        const isMe = msg.sender_email === user?.email;
                        const isBroadcast = msg.conversation_id === 'broadcast';
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && (
                                    <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mr-2 mt-auto">
                                        <span className="text-orange-400 font-bold text-xs">A</span>
                                    </div>
                                )}
                                <div className={`max-w-[80%] ${isMe ? '' : ''}`}>
                                    {isBroadcast && !isMe && (
                                        <p className="text-orange-400 text-xs mb-1 ml-1">📢 Broadcast</p>
                                    )}
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                                        isMe
                                            ? 'bg-orange-500 text-white rounded-br-sm'
                                            : 'bg-slate-700 text-slate-100 rounded-bl-sm'
                                    }`}>
                                        <p>{msg.content}</p>
                                        <p className={`text-xs mt-1 ${isMe ? 'text-orange-200' : 'text-slate-400'}`}>
                                            {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 pt-3 border-t border-slate-700">
                <Input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder="Type a message to admin..."
                    className="flex-1 bg-slate-800 border-slate-700 text-white"
                />
                <Button onClick={send} disabled={sending || !text.trim()} className="bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0">
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}