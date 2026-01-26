import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Sparkles, X, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartSuggestions({ forms = [], checklists = [], userEmail }) {
    const [suggestions, setSuggestions] = useState([]);
    const [dismissed, setDismissed] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const { data: recentSubmissions } = useQuery({
        queryKey: ['recent-submissions', userEmail],
        queryFn: async () => {
            const formSubs = await httpClient.entities.FormSubmission.filter({ 
                created_by: userEmail 
            }, '-created_date', 10);
            const checkSubs = await httpClient.entities.ChecklistSubmission.filter({ 
                created_by: userEmail 
            }, '-created_date', 10);
            return { forms: formSubs, checklists: checkSubs };
        },
        enabled: !!userEmail,
        retry: 2
    });

    const { data: userTasks } = useQuery({
        queryKey: ['user-tasks', userEmail],
        queryFn: () => httpClient.entities.Task.filter({ 
            assigned_to_email: userEmail,
            status: { $ne: 'completed' }
        }),
        enabled: !!userEmail,
        retry: 2
    });

    useEffect(() => {
        if (forms.length && checklists.length && recentSubmissions) {
            generateSuggestions();
        }
    }, [forms, checklists, recentSubmissions, userTasks]);

    const generateSuggestions = async () => {
        setIsGenerating(true);
        const newSuggestions = [];

        // Suggest frequently used forms
        if (recentSubmissions?.forms.length > 0) {
            const formCounts = {};
            recentSubmissions.forms.forEach(sub => {
                formCounts[sub.form_template_id] = (formCounts[sub.form_template_id] || 0) + 1;
            });
            const topFormId = Object.entries(formCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
            const topForm = forms.find(f => f.id === topFormId);
            if (topForm && !dismissed.includes(`form-${topForm.id}`)) {
                newSuggestions.push({
                    id: `form-${topForm.id}`,
                    type: 'frequent',
                    title: 'Frequently Used',
                    description: `You often use "${topForm.title}"`,
                    action: 'Fill Now',
                    link: createPageUrl('FillForm') + `?id=${topForm.id}`,
                    icon: TrendingUp
                });
            }
        }

        // Suggest overdue tasks
        if (userTasks?.length > 0) {
            const overdue = userTasks.filter(task => 
                task.due_date && new Date(task.due_date) < new Date()
            );
            if (overdue.length > 0 && !dismissed.includes('overdue-tasks')) {
                newSuggestions.push({
                    id: 'overdue-tasks',
                    type: 'urgent',
                    title: 'Overdue Tasks',
                    description: `You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`,
                    action: 'View Tasks',
                    link: createPageUrl('MyTasks'),
                    icon: Clock
                });
            }
        }

        // Suggest completing partial submissions
        if (recentSubmissions?.forms.some(sub => sub.status === 'submitted')) {
            if (!dismissed.includes('review-submissions')) {
                newSuggestions.push({
                    id: 'review-submissions',
                    type: 'action',
                    title: 'Review Submissions',
                    description: 'Recent submissions need attention',
                    action: 'Review',
                    link: createPageUrl('Submissions'),
                    icon: CheckCircle
                });
            }
        }

        setSuggestions(newSuggestions);
        setIsGenerating(false);
    };

    const dismissSuggestion = (id) => {
        setDismissed([...dismissed, id]);
        setSuggestions(suggestions.filter(s => s.id !== id));
    };

    if (suggestions.length === 0) return null;

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#FF8C00]" />
                <h2 className="text-lg font-semibold text-white">AI Suggestions</h2>
            </div>
            <div className="space-y-3">
                <AnimatePresence>
                    {suggestions.map((suggestion) => {
                        const Icon = suggestion.icon;
                        return (
                            <motion.div
                                key={suggestion.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                            >
                                <Card className="bg-gradient-to-r from-[#0f1419] to-[#1a1f2e] border-[#FF8C00]/30 p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3 flex-1">
                                            <div className="w-10 h-10 rounded-lg bg-[#FF8C00]/20 flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-5 h-5 text-[#FF8C00]" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white mb-1">{suggestion.title}</h3>
                                                <p className="text-sm text-blue-300 mb-3">{suggestion.description}</p>
                                                <Link to={suggestion.link}>
                                                    <Button size="sm" className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]">
                                                        {suggestion.action}
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => dismissSuggestion(suggestion.id)}
                                            className="text-blue-400 hover:text-white"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}