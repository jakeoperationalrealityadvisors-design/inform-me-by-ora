import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Users, Tag, GitBranch } from 'lucide-react';
import { toast } from 'sonner';

export default function AITaskEnhancer({ taskTitle, taskDescription, onApplySuggestions }) {
    const [suggestions, setSuggestions] = useState(null);
    
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => base44.entities.Category.list()
    });
    
    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: () => base44.entities.User.list()
    });
    
    const { data: existingTasks = [] } = useQuery({
        queryKey: ['all-tasks'],
        queryFn: () => base44.entities.Task.list('-created_date', 50)
    });
    
    const analyzeMutation = useMutation({
        mutationFn: async () => {
            const userSummary = users.map(u => ({
                email: u.email,
                name: u.full_name || u.email,
                role: u.team_role || u.role
            }));
            
            const taskSummary = existingTasks.map(t => ({
                title: t.title,
                category: t.category_id,
                assigned: t.assigned_to_email
            }));
            
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are an AI project management assistant. Analyze this task and provide intelligent recommendations:

**Task Title:** ${taskTitle}
**Task Description:** ${taskDescription || 'No description'}

**Available Categories:**
${categories.map(c => `- ${c.name}: ${c.description || ''}`).join('\n')}

**Team Members:**
${userSummary.map(u => `- ${u.name} (${u.email}): ${u.role}`).join('\n')}

**Recent Tasks Context:**
${taskSummary.slice(0, 10).map(t => `- ${t.title}`).join('\n')}

Provide:
1. Best matching category
2. Top 3 recommended team members with reasoning
3. Suggested priority level
4. Potential task dependencies or blockers
5. Estimated effort (in hours)
6. Relevant tags`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        category_suggestion: {
                            type: "object",
                            properties: {
                                category_name: { type: "string" },
                                confidence: { type: "number" },
                                reasoning: { type: "string" }
                            }
                        },
                        team_recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    email: { type: "string" },
                                    name: { type: "string" },
                                    reasoning: { type: "string" },
                                    confidence: { type: "number" }
                                }
                            }
                        },
                        priority_suggestion: {
                            type: "object",
                            properties: {
                                priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                                reasoning: { type: "string" }
                            }
                        },
                        dependencies: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    task: { type: "string" },
                                    reason: { type: "string" }
                                }
                            }
                        },
                        estimated_hours: { type: "number" },
                        suggested_tags: {
                            type: "array",
                            items: { type: "string" }
                        }
                    }
                }
            });
            
            return response;
        },
        onSuccess: (data) => {
            setSuggestions(data);
            toast.success('AI analysis complete!');
        },
        onError: (error) => {
            toast.error('Analysis failed: ' + error.message);
        }
    });
    
    const handleApply = () => {
        const category = categories.find(c => 
            c.name.toLowerCase() === suggestions.category_suggestion.category_name.toLowerCase()
        );
        
        onApplySuggestions({
            category_id: category?.id,
            assigned_to_email: suggestions.team_recommendations[0]?.email,
            assigned_to_name: suggestions.team_recommendations[0]?.name,
            priority: suggestions.priority_suggestion.priority,
            tags: suggestions.suggested_tags
        });
        
        toast.success('Suggestions applied!');
    };
    
    return (
        <Card className="bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-purple-900/30">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        AI Task Assistant
                    </CardTitle>
                    <Button
                        onClick={() => analyzeMutation.mutate()}
                        disabled={analyzeMutation.isPending || !taskTitle}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                        {analyzeMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Get Suggestions
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {!suggestions && !analyzeMutation.isPending && (
                    <div className="text-center py-6">
                        <p className="text-blue-400 text-sm">
                            Get AI recommendations for categorization, assignment, and dependencies
                        </p>
                    </div>
                )}
                
                {analyzeMutation.isPending && (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-blue-950/20 rounded-lg animate-pulse" />
                        ))}
                    </div>
                )}
                
                {suggestions && (
                    <div className="space-y-4">
                        {/* Category Suggestion */}
                        <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Tag className="w-4 h-4 text-green-400" />
                                <h3 className="font-semibold text-white">Category</h3>
                                <Badge className="ml-auto bg-green-600">
                                    {(suggestions.category_suggestion.confidence * 100).toFixed(0)}% match
                                </Badge>
                            </div>
                            <p className="text-blue-300 font-medium mb-1">
                                {suggestions.category_suggestion.category_name}
                            </p>
                            <p className="text-sm text-blue-400">{suggestions.category_suggestion.reasoning}</p>
                        </div>
                        
                        {/* Team Recommendations */}
                        <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-blue-400" />
                                <h3 className="font-semibold text-white">Recommended Team Members</h3>
                            </div>
                            <div className="space-y-2">
                                {suggestions.team_recommendations.slice(0, 3).map((rec, idx) => (
                                    <div key={idx} className="flex items-start gap-2 p-2 bg-blue-950/20 rounded">
                                        <Badge className={idx === 0 ? 'bg-green-600' : 'bg-blue-600'}>
                                            #{idx + 1}
                                        </Badge>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{rec.name}</p>
                                            <p className="text-xs text-blue-400">{rec.reasoning}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Priority Suggestion */}
                        <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                            <h3 className="font-semibold text-white mb-2">Priority</h3>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className={
                                    suggestions.priority_suggestion.priority === 'urgent' ? 'bg-red-600' :
                                    suggestions.priority_suggestion.priority === 'high' ? 'bg-orange-600' :
                                    suggestions.priority_suggestion.priority === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                                }>
                                    {suggestions.priority_suggestion.priority}
                                </Badge>
                            </div>
                            <p className="text-sm text-blue-400">{suggestions.priority_suggestion.reasoning}</p>
                        </div>
                        
                        {/* Dependencies */}
                        {suggestions.dependencies?.length > 0 && (
                            <div className="bg-[#0a0e17] p-4 rounded-lg border border-orange-900/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <GitBranch className="w-4 h-4 text-orange-400" />
                                    <h3 className="font-semibold text-white">Potential Dependencies</h3>
                                </div>
                                <div className="space-y-2">
                                    {suggestions.dependencies.map((dep, idx) => (
                                        <div key={idx} className="text-sm">
                                            <p className="text-orange-300">→ {dep.task}</p>
                                            <p className="text-xs text-orange-400/70 ml-4">{dep.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Estimated Effort */}
                        <div className="flex items-center justify-between p-3 bg-[#0a0e17] rounded-lg border border-blue-900/20">
                            <span className="text-blue-300">Estimated Effort</span>
                            <Badge variant="outline" className="text-white">
                                {suggestions.estimated_hours} hours
                            </Badge>
                        </div>
                        
                        {/* Tags */}
                        {suggestions.suggested_tags?.length > 0 && (
                            <div className="bg-[#0a0e17] p-4 rounded-lg border border-blue-900/20">
                                <h3 className="font-semibold text-white mb-2">Suggested Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.suggested_tags.map((tag, idx) => (
                                        <Badge key={idx} variant="outline" className="text-blue-300">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <Button
                            onClick={handleApply}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                        >
                            Apply Suggestions
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}