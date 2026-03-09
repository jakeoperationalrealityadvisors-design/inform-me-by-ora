import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function NewConversationDialog({ open, onOpenChange, currentUser, onConversationCreated }) {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [conversationType, setConversationType] = useState('direct');
    
    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: () => base44.entities.User.list(),
        enabled: open
    });
    
    const createConversationMutation = useMutation({
        mutationFn: async () => {
            const participants = [...selectedUsers, currentUser.email];
            const conversationId = `${conversationType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Create initial message to establish conversation
            const firstMessage = await base44.entities.Message.create({
                content: conversationType === 'group' 
                    ? `${currentUser.full_name} created the group`
                    : 'Conversation started',
                sender_email: currentUser.email,
                sender_name: currentUser.full_name || currentUser.email,
                conversation_type: conversationType,
                conversation_id: conversationId,
                conversation_name: conversationType === 'group' ? groupName : null,
                participants,
                read_by: [currentUser.email]
            });
            
            return {
                id: conversationId,
                type: conversationType,
                name: conversationType === 'group' ? groupName : null,
                participants,
                messages: [firstMessage],
                lastMessage: firstMessage,
                unreadCount: 0
            };
        },
        onSuccess: (conversation) => {
            toast.success('Conversation created!');
            onConversationCreated(conversation);
            onOpenChange(false);
            setSelectedUsers([]);
            setGroupName('');
        },
        onError: (error) => {
            toast.error('Failed to create conversation: ' + error.message);
        }
    });
    
    const handleUserToggle = (email) => {
        setSelectedUsers(prev => 
            prev.includes(email) 
                ? prev.filter(e => e !== email)
                : [...prev, email]
        );
    };
    
    const handleCreate = () => {
        if (selectedUsers.length === 0) {
            toast.error('Please select at least one user');
            return;
        }
        
        if (conversationType === 'group' && !groupName.trim()) {
            toast.error('Please enter a group name');
            return;
        }
        
        createConversationMutation.mutate();
    };
    
    const availableUsers = users.filter(u => u.email !== currentUser?.email);
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0f1419] border-blue-900/20 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">New Conversation</DialogTitle>
                </DialogHeader>
                
                <Tabs value={conversationType} onValueChange={setConversationType}>
                    <TabsList className="grid grid-cols-2 bg-[#0a0e17]">
                        <TabsTrigger value="direct" className="gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Direct Message
                        </TabsTrigger>
                        <TabsTrigger value="group" className="gap-2">
                            <Users className="w-4 h-4" />
                            Group Chat
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="direct" className="space-y-4">
                        <div>
                            <Label className="text-blue-300">Select User</Label>
                            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                                {availableUsers.map(user => (
                                    <div key={user.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={user.id}
                                            checked={selectedUsers.includes(user.email)}
                                            onCheckedChange={() => handleUserToggle(user.email)}
                                            disabled={conversationType === 'direct' && selectedUsers.length > 0 && !selectedUsers.includes(user.email)}
                                        />
                                        <label htmlFor={user.id} className="text-sm text-blue-300 cursor-pointer">
                                            {user.full_name || user.email}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="group" className="space-y-4">
                        <div>
                            <Label className="text-blue-300">Group Name</Label>
                            <Input
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Enter group name..."
                                className="mt-2 bg-[#0a0e17] border-blue-900/30 text-white"
                            />
                        </div>
                        
                        <div>
                            <Label className="text-blue-300">Add Members</Label>
                            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                                {availableUsers.map(user => (
                                    <div key={user.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={user.id}
                                            checked={selectedUsers.includes(user.email)}
                                            onCheckedChange={() => handleUserToggle(user.email)}
                                        />
                                        <label htmlFor={user.id} className="text-sm text-blue-300 cursor-pointer">
                                            {user.full_name || user.email}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
                
                <div className="flex gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 border-blue-600"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={createConversationMutation.isPending || selectedUsers.length === 0}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                        Create
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}