import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageSquare, Send, User } from 'lucide-react';
import { format } from 'date-fns';

export default function CommentSection({ submissionId, submissionType }) {
    const [newComment, setNewComment] = useState('');
    const queryClient = useQueryClient();
    
    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => httpClient.auth.me()
    });
    
    const { data: comments = [] } = useQuery({
        queryKey: ['comments', submissionId],
        queryFn: () => httpClient.entities.Comment.filter({ 
            submission_id: submissionId,
            submission_type: submissionType
        }, '-created_date')
    });
    
    const addCommentMutation = useMutation({
        mutationFn: (data) => httpClient.entities.Comment.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['comments', submissionId]);
            setNewComment('');
        }
    });
    
    const handleAddComment = () => {
        if (!newComment.trim()) return;
        
        addCommentMutation.mutate({
            submission_id: submissionId,
            submission_type: submissionType,
            comment_text: newComment,
            author_name: user?.full_name || user?.email,
            author_email: user?.email
        });
    };
    
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold">Comments ({comments.length})</h3>
            </div>
            
            {/* Comment List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                    <Card key={comment.id} className="bg-[#0f1419] border-blue-900/20 p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-950/50 flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-blue-300">
                                        {comment.author_name}
                                    </span>
                                    <span className="text-xs text-blue-400/60">
                                        {format(new Date(comment.created_date), 'MMM d, h:mm a')}
                                    </span>
                                </div>
                                <p className="text-sm text-blue-100">{comment.comment_text}</p>
                            </div>
                        </div>
                    </Card>
                ))}
                
                {comments.length === 0 && (
                    <div className="text-center py-8 text-blue-400/60 text-sm">
                        No comments yet. Start the conversation!
                    </div>
                )}
            </div>
            
            {/* Add Comment */}
            <div className="space-y-2">
                <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="bg-[#0f1419] border-blue-900/20 text-white placeholder:text-blue-400/40"
                    rows={3}
                />
                <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                </Button>
            </div>
        </div>
    );
}