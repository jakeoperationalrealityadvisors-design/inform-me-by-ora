import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useUserRole } from '@/components/auth/RoleGuard';

export default function AssignmentPanel({ submission, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const { canManage } = useUserRole();
    const [assignee, setAssignee] = useState(submission.assigned_to_email || '');
    const [dueDate, setDueDate] = useState(submission.due_date || '');
    const [priority, setPriority] = useState(submission.priority || 'medium');
    
    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: () => base44.entities.User.list()
    });
    
    const handleSave = () => {
        const updates = {
            assigned_to_email: assignee,
            due_date: dueDate,
            priority: priority
        };
        
        onUpdate(updates);
        setIsEditing(false);
    };
    
    const priorityColors = {
        low: 'bg-blue-500/10 text-blue-400',
        medium: 'bg-yellow-500/10 text-yellow-400',
        high: 'bg-orange-500/10 text-orange-400',
        urgent: 'bg-red-500/10 text-red-400'
    };
    
    const isOverdue = submission.due_date && new Date(submission.due_date) < new Date();
    
    if (!isEditing) {
        return (
            <div className="bg-[#0f1419] border border-blue-900/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">Task Assignment</h3>
                    {canManage && (
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="border-blue-800 text-blue-300 hover:bg-blue-950/50"
                        >
                            Edit
                        </Button>
                    )}
                </div>
                
                <div className="space-y-2">
                    {submission.assigned_to_email && (
                        <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-100">Assigned to:</span>
                            <span className="text-white">{submission.assigned_to_email}</span>
                        </div>
                    )}
                    
                    {submission.due_date && (
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-100">Due:</span>
                            <span className={isOverdue ? 'text-red-400' : 'text-white'}>
                                {new Date(submission.due_date).toLocaleDateString()}
                            </span>
                            {isOverdue && <AlertCircle className="w-4 h-4 text-red-400" />}
                        </div>
                    )}
                    
                    {submission.priority && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-blue-100">Priority:</span>
                            <Badge className={priorityColors[submission.priority]}>
                                {submission.priority}
                            </Badge>
                        </div>
                    )}
                    
                    {!submission.assigned_to_email && !submission.due_date && (
                        <p className="text-sm text-blue-400/60">No assignment details</p>
                    )}
                </div>
            </div>
        );
    }
    
    if (!canManage) {
        return null; // Non-managers shouldn't see edit form
    }
    
    return (
        <div className="bg-[#0f1419] border border-blue-900/20 rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-white">Edit Assignment</h3>
            
            <div className="space-y-3">
                <div>
                    <Label className="text-blue-100">Assign To</Label>
                    <Select value={assignee} onValueChange={setAssignee}>
                        <SelectTrigger className="bg-[#0a0e17] border-blue-900/20 text-white">
                            <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={null}>Unassigned</SelectItem>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.email}>
                                    {user.full_name || user.email}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div>
                    <Label className="text-blue-100">Due Date</Label>
                    <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="bg-[#0a0e17] border-blue-900/20 text-white"
                    />
                </div>
                
                <div>
                    <Label className="text-blue-100">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="bg-[#0a0e17] border-blue-900/20 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="flex gap-2">
                <Button 
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                    Save
                </Button>
                <Button 
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex-1 border-blue-800 text-blue-300 hover:bg-blue-950/50"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}