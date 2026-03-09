import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Send, Sparkles, Book, Loader2, ExternalLink, FileText, CheckSquare, ListTodo, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';

export default function KnowledgeBase() {
    const [question, setQuestion] = useState('');
    const [conversation, setConversation] = useState([]);
    
    // Fetch app data for context
    const { data: forms = [] } = useQuery({
        queryKey: ['forms'],
        queryFn: () => base44.entities.FormTemplate.filter({ status: 'active' })
    });
    
    const { data: checklists = [] } = useQuery({
        queryKey: ['checklists'],
        queryFn: () => base44.entities.ChecklistTemplate.filter({ status: 'active' })
    });
    
    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks-kb'],
        queryFn: () => base44.entities.Task.list('-created_date', 20)
    });
    
    const { data: automations = [] } = useQuery({
        queryKey: ['automations-kb'],
        queryFn: () => base44.entities.AutomationRule.list('-created_date', 10)
    });
    
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => base44.entities.Category.list()
    });
    
    const askMutation = useMutation({
        mutationFn: async (userQuestion) => {
            // Build context from app data
            const context = {
                forms: forms.map(f => ({ title: f.title, description: f.description, fields: f.fields?.length || 0 })),
                checklists: checklists.map(c => ({ title: c.title, description: c.description, items: c.items?.length || 0 })),
                tasks: tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority })),
                automations: automations.map(a => ({ name: a.name, trigger: a.trigger_type, enabled: a.enabled })),
                categories: categories.map(c => ({ name: c.name, description: c.description })),
                features: [
                    { name: 'Forms', path: 'Home', description: 'Create and manage form templates' },
                    { name: 'Checklists', path: 'Home', description: 'Create and manage checklist templates' },
                    { name: 'Tasks', path: 'MyTasks', description: 'View and manage tasks' },
                    { name: 'Submissions', path: 'Submissions', description: 'View form and checklist submissions' },
                    { name: 'Documents', path: 'Documents', description: 'Upload and manage documents' },
                    { name: 'Reports', path: 'Reports', description: 'View analytics and reports' },
                    { name: 'Automations', path: 'ManageAutomations', description: 'Configure workflow automation rules' },
                    { name: 'Calendar', path: 'Calendar', description: 'View scheduled events and deadlines' },
                    { name: 'Messages', path: 'Messages', description: 'Team communication and messaging' },
                    { name: 'Settings', path: 'Settings', description: 'Configure app settings and preferences' }
                ]
            };
            
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are an intelligent assistant for the InForm Me application - a comprehensive forms, checklists, and project management platform.

User Question: "${userQuestion}"

App Context:
${JSON.stringify(context, null, 2)}

Provide a helpful, comprehensive answer that:
1. Directly answers the user's question
2. References specific data from the app when relevant (forms, tasks, etc.)
3. Suggests relevant features or pages they should visit
4. Uses clear, friendly language

If you mention a feature or page, include it in the "suggested_links" array with exact page names from the features list.
If you reference specific items (forms, checklists, tasks), include them in "referenced_items".`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        answer: { type: "string" },
                        suggested_links: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    label: { type: "string" },
                                    page: { type: "string" },
                                    reason: { type: "string" }
                                }
                            }
                        },
                        referenced_items: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    name: { type: "string" },
                                    relevance: { type: "string" }
                                }
                            }
                        },
                        quick_actions: {
                            type: "array",
                            items: { type: "string" }
                        }
                    }
                }
            });
            
            return response;
        },
        onSuccess: (data) => {
            setConversation([...conversation, 
                { role: 'user', content: question },
                { role: 'assistant', data }
            ]);
            setQuestion('');
        }
    });
    
    const exampleQuestions = [
        "How do I create a new form?",
        "Show me all my pending tasks",
        "What automations are currently active?",
        "How can I set up notifications?",
        "What reports are available?",
        "How do I assign a task to someone?"
    ];
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (question.trim()) {
            askMutation.mutate(question);
        }
    };
    
    const iconMap = {
        form: FileText,
        checklist: CheckSquare,
        task: ListTodo,
        automation: Zap
    };
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Settings')}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <Book className="w-6 h-6 text-purple-400" />
                                Knowledge Base
                            </h1>
                            <p className="text-sm text-blue-400">Ask me anything about the app</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {conversation.length === 0 ? (
                    <Card className="bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-purple-900/30">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                Welcome to the AI Knowledge Base
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-blue-300">
                                I can help you understand features, find data, and navigate the app. Ask me anything!
                            </p>
                            
                            <div className="space-y-2">
                                <p className="text-sm text-purple-300 font-semibold">Try asking:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {exampleQuestions.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setQuestion(q)}
                                            className="text-left p-3 rounded-lg bg-[#0a0e17] border border-blue-900/30 hover:border-purple-600/50 transition-colors text-sm text-blue-300"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <ScrollArea className="h-[calc(100vh-280px)]">
                        <div className="space-y-4 pr-4">
                            {conversation.map((msg, idx) => (
                                <div key={idx}>
                                    {msg.role === 'user' ? (
                                        <div className="flex justify-end">
                                            <div className="bg-blue-600 text-white rounded-lg p-3 max-w-[80%]">
                                                {msg.content}
                                            </div>
                                        </div>
                                    ) : (
                                        <Card className="bg-[#0f1419] border-purple-900/30">
                                            <CardContent className="pt-6 space-y-4">
                                                <ReactMarkdown className="prose prose-invert prose-sm max-w-none text-blue-100">
                                                    {msg.data.answer}
                                                </ReactMarkdown>
                                                
                                                {msg.data.suggested_links?.length > 0 && (
                                                    <div className="border-t border-blue-900/20 pt-4">
                                                        <p className="text-xs text-purple-300 font-semibold mb-2">SUGGESTED PAGES</p>
                                                        <div className="space-y-2">
                                                            {msg.data.suggested_links.map((link, i) => (
                                                                <Link key={i} to={createPageUrl(link.page)}>
                                                                    <div className="flex items-start gap-2 p-2 rounded bg-purple-950/20 hover:bg-purple-950/40 transition-colors border border-purple-900/30">
                                                                        <ExternalLink className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <p className="text-sm text-white font-medium">{link.label}</p>
                                                                            <p className="text-xs text-purple-300/80">{link.reason}</p>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {msg.data.referenced_items?.length > 0 && (
                                                    <div className="border-t border-blue-900/20 pt-4">
                                                        <p className="text-xs text-blue-300 font-semibold mb-2">RELATED ITEMS</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {msg.data.referenced_items.map((item, i) => {
                                                                const Icon = iconMap[item.type] || FileText;
                                                                return (
                                                                    <Badge key={i} variant="outline" className="bg-blue-950/20 text-blue-300 border-blue-900/30">
                                                                        <Icon className="w-3 h-3 mr-1" />
                                                                        {item.name}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {msg.data.quick_actions?.length > 0 && (
                                                    <div className="border-t border-blue-900/20 pt-4">
                                                        <p className="text-xs text-green-300 font-semibold mb-2">QUICK ACTIONS</p>
                                                        <ul className="space-y-1">
                                                            {msg.data.quick_actions.map((action, i) => (
                                                                <li key={i} className="text-sm text-green-300/80 pl-3">✓ {action}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            ))}
                            
                            {askMutation.isPending && (
                                <div className="flex justify-start">
                                    <Card className="bg-[#0f1419] border-purple-900/30">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-2 text-purple-400">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-sm">Searching and analyzing...</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                )}
                
                <form onSubmit={handleSubmit} className="sticky bottom-0 bg-[#0a0e17] pt-4">
                    <div className="flex gap-2">
                        <Input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask a question about the app..."
                            className="flex-1 bg-[#0f1419] border-blue-900/30 text-white placeholder:text-blue-400/50"
                            disabled={askMutation.isPending}
                        />
                        <Button
                            type="submit"
                            disabled={!question.trim() || askMutation.isPending}
                            className="bg-gradient-to-r from-purple-600 to-blue-600"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}