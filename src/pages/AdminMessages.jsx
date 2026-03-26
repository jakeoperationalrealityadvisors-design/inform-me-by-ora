import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, MessageSquare, Users, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminMessages() {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selected, setSelected] = useState(null);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [broadcastText, setBroadcastText] = useState('');
    const [showBroadcast, setShowBroadcast] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        base44.auth.me().then(u => setCurrentUser(u));
        base44.entities.User.list().then(u => setUsers(u.filter(u => u.role !== 'admin')));
        loadMessages();
        const unsub = base44.entities.Message.subscribe(ev => {
            if (ev.type === 'create') setMessages(prev => [...prev, ev.data]);
        });
        return unsub;
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selected]);

    const loadMessages = () => {
        base44.entities.Message.list('-created_date', 200).then(m => setMessages(m));
    };

    const convo = selected
        ? messages.filter(m =>
            (m.sender_email === currentUser?.email && m.conversation_id === `admin-${selected.email}`) ||
            (m.conversation_id === `admin-${selected.email}`)
        ).sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
        : [];

    const unreadCount = (user) =>
        messages.filter(m => m.conversation_id === `admin-${user.email}` && !m.read_by?.includes(currentUser?.email) && m.sender_email !== currentUser?.email).length;

    const send = async () => {
        if (!text.trim() || !selected || !currentUser) return;
        setSending(true);
        await base44.entities.Message.create({
            content: text.trim(),
            sender_email: currentUser.email,
            sender_name: currentUser.full_name || 'Admin',
            conversation_type: 'direct',
            conversation_id: `admin-${selected.email}`,
            participants: [currentUser.email, selected.email],
            read_by: [currentUser.email],
        });
        setText('');
        setSending(false);
        loadMessages();
    };

    const broadcast = async () => {
        if (!broadcastText.trim() || !currentUser) return;
        setSending(true);
        await base44.entities.Message.create({
            content: broadcastText.trim(),
            sender_email: currentUser.email,
            sender_name: currentUser.full_name || 'Admin',
            conversation_type: 'organization',
            conversation_id: 'broadcast',
            participants: users.map(u => u.email),
            read_by: [currentUser.email],
        });
        setBroadcastText('');
        setShowBroadcast(false);
        setSending(false);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-4">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 flex flex-col bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <h2 className="text-white font-semibold">Messages</h2>
                    <button onClick={() => setShowBroadcast(true)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-orange-400 transition-colors" title="Broadcast">
                        <Radio className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {users.length === 0 ? (
                        <div className="p-6 text-center">
                            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-slate-500 text-xs">No users yet</p>
                        </div>
                    ) : (
                        users.map(u => {
                            const unread = unreadCount(u);
                            const lastMsg = messages.filter(m => m.conversation_id === `admin-${u.email}`).sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
                            return (
                                <button key={u.id} onClick={() => setSelected(u)}
                                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-700/50 ${selected?.id === u.id ? 'bg-slate-700' : ''}`}>
                                    <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                                        <span className="text-blue-400 font-bold text-sm">{(u.full_name || u.email || 'U')[0].toUpperCase()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{u.full_name || u.email}</p>
                                        {lastMsg && <p className="text-slate-500 text-xs truncate">{lastMsg.content}</p>}
                                    </div>
                                    {unread > 0 && (
                                        <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center flex-shrink-0">{unread}</span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                {selected ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                                <span className="text-blue-400 font-bold text-sm">{(selected.full_name || selected.email)[0].toUpperCase()}</span>
                            </div>
                            <div>
                                <p className="text-white font-medium">{selected.full_name || selected.email}</p>
                                <p className="text-slate-400 text-xs">{selected.email}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {convo.length === 0 && (
                                <div className="text-center py-12">
                                    <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                                    <p className="text-slate-500 text-sm">No messages yet. Start the conversation.</p>
                                </div>
                            )}
                            {convo.map(msg => {
                                const isMe = msg.sender_email === currentUser?.email;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-orange-500 text-white rounded-br-sm' : 'bg-slate-700 text-slate-100 rounded-bl-sm'}`}>
                                            <p>{msg.content}</p>
                                            <p className={`text-xs mt-1 ${isMe ? 'text-orange-200' : 'text-slate-400'}`}>
                                                {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-slate-700 flex gap-2">
                            <Input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} placeholder="Type a message..." className="flex-1 bg-slate-700 border-slate-600 text-white" />
                            <Button onClick={send} disabled={sending || !text.trim()} className="bg-orange-500 hover:bg-orange-600 text-white">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 font-medium">Select a user to message</p>
                            <p className="text-slate-500 text-sm mt-1">Or broadcast to all field workers</p>
                            <Button onClick={() => setShowBroadcast(true)} className="mt-4 bg-slate-700 hover:bg-slate-600 text-white gap-2">
                                <Radio className="w-4 h-4" /> Broadcast Message
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Broadcast modal */}
            {showBroadcast && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-sm">
                        <h3 className="text-white font-semibold text-lg mb-1 flex items-center gap-2"><Radio className="w-5 h-5 text-orange-400" /> Broadcast</h3>
                        <p className="text-slate-400 text-sm mb-4">Send a message to all {users.length} field workers.</p>
                        <textarea value={broadcastText} onChange={e => setBroadcastText(e.target.value)} placeholder="Message..." className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-1 focus:ring-orange-500 mb-4" />
                        <div className="flex gap-3">
                            <Button onClick={() => setShowBroadcast(false)} variant="outline" className="flex-1 border-slate-600 text-slate-300">Cancel</Button>
                            <Button onClick={broadcast} disabled={sending} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">Send to All</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}