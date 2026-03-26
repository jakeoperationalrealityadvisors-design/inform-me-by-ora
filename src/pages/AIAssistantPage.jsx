import React, { useState, useRef, useEffect } from 'react';
import SubscriptionGate from '@/components/billing/SubscriptionGate';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Send, Loader2, Trash2, Bot, User, FileText, CheckSquare, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SYSTEM_PROMPT = `You are ORA, an intelligent AI assistant for InformMe — a field operations platform for managing forms, checklists, tasks, and documents.

You help users:
- Create and fill forms or checklists
- Summarize reports and documents
- Build automation workflows
- Answer questions about their field operations
- Troubleshoot issues in the platform

When a user asks you to CREATE a form or checklist, respond ONLY with a JSON block in this exact format (no other text):

For forms:
{"__action":"create_form","title":"...","description":"...","fields":[{"id":"f1","label":"...","type":"text","required":true}]}

For checklists:
{"__action":"create_checklist","title":"...","description":"...","items":[{"id":"i1","text":"...","required":true}]}

Field types allowed: text, number, select, date, textarea, checkbox.
Include 3-10 fields/items relevant to the request.
Otherwise, respond normally in plain language. Be concise, practical, and field-team-friendly.`;

function ActionBubble({ action }) {
    return (
        <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#1E40AF] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#0f1419] border border-green-700/40 rounded-2xl rounded-bl-sm px-4 py-3 space-y-2">
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                    {action.type === 'form' ? <FileText className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                    {action.type === 'form' ? 'Form' : 'Checklist'} created: <span className="text-white">{action.title}</span>
                </div>
                <a
                    href={`/${action.type === 'form' ? 'EditForm' : 'EditChecklist'}?id=${action.id}`}
                    className="inline-flex items-center gap-1.5 text-xs bg-green-700/30 hover:bg-green-700/50 text-green-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <ExternalLink className="w-3 h-3" /> Open & Edit
                </a>
            </div>
        </div>
    );
}

function ChatBubble({ msg }) {
    const isUser = msg.role === 'user';
    if (msg.__action) return <ActionBubble action={msg.__action} />;
    return (
        <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#1E40AF] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-white" />
                </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                isUser
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-[#0f1419] border border-blue-900/30 text-blue-100 rounded-bl-sm'
            }`}>
                {isUser ? (
                    <p className="leading-relaxed">{msg.content}</p>
                ) : (
                    <ReactMarkdown
                        className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        components={{
                            p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                            ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                            li: ({ children }) => <li className="my-0.5">{children}</li>,
                            code: ({ inline, children }) => inline
                                ? <code className="px-1 py-0.5 rounded bg-blue-900/40 text-blue-200 text-xs">{children}</code>
                                : <pre className="bg-black/40 rounded-lg p-3 overflow-x-auto my-2 text-xs text-blue-200"><code>{children}</code></pre>,
                            strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                        }}
                    >{msg.content}</ReactMarkdown>
                )}
            </div>
            {isUser && (
                <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-white" />
                </div>
            )}
        </div>
    );
}

function AIChat() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I\'m ORA, your AI assistant. Ask me anything about your forms, checklists, workflows, or field operations. How can I help?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;
        setInput('');

        const newMessages = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setLoading(true);

        const conversationHistory = newMessages
            .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.__action ? '[created ' + m.__action.type + ']' : m.content}`)
            .join('\n\n');

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `${SYSTEM_PROMPT}\n\n--- CONVERSATION ---\n${conversationHistory}\n\nAssistant:`,
        });

        // Try to parse as a create action
        let parsed = null;
        try {
            const jsonMatch = (response || '').match(/\{[\s\S]*\}/);
            if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
        } catch (e) { /* not JSON */ }

        if (parsed?.__action === 'create_form') {
            const items = (parsed.fields || []).map(f => ({ id: f.id, text: f.label, required: !!f.required }));
            const created = await base44.entities.FormTemplate.create({
                title: parsed.title,
                description: parsed.description || '',
                fields: parsed.fields || [],
                status: 'active'
            });
            setMessages(prev => [...prev, { role: 'assistant', content: '', __action: { type: 'form', title: parsed.title, id: created.id } }]);
        } else if (parsed?.__action === 'create_checklist') {
            const created = await base44.entities.ChecklistTemplate.create({
                title: parsed.title,
                description: parsed.description || '',
                items: parsed.items || [],
                status: 'active'
            });
            setMessages(prev => [...prev, { role: 'assistant', content: '', __action: { type: 'checklist', title: parsed.title, id: created.id } }]);
        } else {
            setMessages(prev => [...prev, { role: 'assistant', content: response || 'Sorry, I couldn\'t respond right now.' }]);
        }

        setLoading(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const QUICK_PROMPTS = [
        'How do I create a form?',
        'Summarize my last report',
        'Help me build a workflow',
        'What can you do?',
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-65px)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                {loading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#1E40AF] flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-[#0f1419] border border-blue-900/30 rounded-2xl rounded-bl-sm px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                            </div>
                        </div>
                    </div>
                )}
                {/* Quick prompts if only greeting */}
                {messages.length === 1 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {QUICK_PROMPTS.map((p) => (
                            <button key={p} onClick={() => { setInput(p); inputRef.current?.focus(); }}
                                className="text-xs px-3 py-1.5 rounded-full bg-blue-900/30 border border-blue-800/40 text-blue-300 hover:bg-blue-800/40 transition-colors">
                                {p}
                            </button>
                        ))}
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-blue-900/20 bg-[#0f1419] px-4 py-3">
                <div className="max-w-4xl mx-auto flex gap-2 items-end">
                    <button
                        onClick={() => setMessages([{ role: 'assistant', content: 'Hi! I\'m ORA, your AI assistant. How can I help?' }])}
                        className="p-2 text-blue-600 hover:text-red-400 transition-colors shrink-0"
                        title="Clear chat"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything… (Enter to send)"
                        rows={1}
                        className="flex-1 bg-[#0a0e17] border border-blue-900/30 text-white placeholder-blue-700 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-blue-600 max-h-32"
                        style={{ minHeight: '42px' }}
                        disabled={loading}
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className="bg-gradient-to-r from-[#FF8C00] to-[#CC7000] hover:opacity-90 shrink-0 h-10 w-10 p-0 rounded-xl"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
                <p className="text-center text-blue-800 text-xs mt-1.5">ORA may make mistakes. Verify important info.</p>
            </div>
        </div>
    );
}

export default function AIAssistantPage() {
    return (
        <SubscriptionGate feature="ai">
            <div className="min-h-screen bg-[#0a0e17] flex flex-col">
                <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-20 shadow-sm">
                    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link to="/Home">
                                <Button variant="ghost" size="icon" className="text-blue-400 shrink-0">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#FF8C00]" />
                                    ORA AI Assistant
                                </h1>
                                <p className="text-xs sm:text-sm text-blue-400">Your intelligent field operations copilot</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
                    <AIChat />
                </div>
            </div>
        </SubscriptionGate>
    );
}