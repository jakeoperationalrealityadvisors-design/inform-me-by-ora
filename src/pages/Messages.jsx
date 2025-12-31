import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, MessageCircle, Users, Search, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConversationList from '@/components/messages/ConversationList';
import MessageThread from '@/components/messages/MessageThread';
import NewConversationDialog from '@/components/messages/NewConversationDialog';

export default function Messages() {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewConversation, setShowNewConversation] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    
    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });
    
    const { data: messages = [] } = useQuery({
        queryKey: ['messages', user?.email],
        queryFn: () => base44.entities.Message.filter({ 
            participants: { $in: [user.email] }
        }, '-created_date', 500),
        enabled: !!user,
        refetchInterval: 5000 // Refresh every 5 seconds
    });
    
    // Group messages by conversation
    const conversations = React.useMemo(() => {
        const convMap = new Map();
        
        messages.forEach(msg => {
            if (!convMap.has(msg.conversation_id)) {
                convMap.set(msg.conversation_id, {
                    id: msg.conversation_id,
                    type: msg.conversation_type,
                    name: msg.conversation_name,
                    participants: msg.participants,
                    lastMessage: msg,
                    unreadCount: 0,
                    messages: []
                });
            }
            
            const conv = convMap.get(msg.conversation_id);
            conv.messages.push(msg);
            
            // Update last message if this one is newer
            if (new Date(msg.created_date) > new Date(conv.lastMessage.created_date)) {
                conv.lastMessage = msg;
            }
            
            // Count unread messages
            if (!msg.read_by?.includes(user.email)) {
                conv.unreadCount++;
            }
        });
        
        return Array.from(convMap.values()).sort((a, b) => 
            new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date)
        );
    }, [messages, user]);
    
    const filteredConversations = conversations.filter(conv => {
        if (activeTab === 'direct' && conv.type !== 'direct') return false;
        if (activeTab === 'groups' && conv.type !== 'group') return false;
        if (activeTab === 'organization' && conv.type !== 'organization') return false;
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return conv.name?.toLowerCase().includes(query) ||
                   conv.lastMessage.content.toLowerCase().includes(query) ||
                   conv.participants.some(p => p.toLowerCase().includes(query));
        }
        
        return true;
    });
    
    return (
        <div className="min-h-screen bg-[#0a0e17] flex">
            {/* Sidebar */}
            <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-[#0f1419] border-r border-blue-900/20`}>
                <div className="p-4 border-b border-blue-900/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Link to={createPageUrl('Home')} className="md:hidden">
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-[#FF8C00]" />
                                Messages
                            </h1>
                        </div>
                        <Button
                            onClick={() => setShowNewConversation(true)}
                            size="icon"
                            className="rounded-full bg-purple-600 hover:bg-purple-700"
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search conversations..."
                            className="pl-10 bg-[#0a0e17] border-blue-900/30 text-white"
                        />
                    </div>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="grid grid-cols-4 bg-[#0a0e17] mx-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="direct">DMs</TabsTrigger>
                        <TabsTrigger value="groups">Groups</TabsTrigger>
                        <TabsTrigger value="organization">Team</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value={activeTab} className="flex-1 overflow-y-auto">
                        <ConversationList
                            conversations={filteredConversations}
                            selectedId={selectedConversation?.id}
                            onSelect={setSelectedConversation}
                            currentUserEmail={user?.email}
                        />
                    </TabsContent>
                </Tabs>
            </div>
            
            {/* Message Thread */}
            <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
                {selectedConversation ? (
                    <MessageThread
                        conversation={selectedConversation}
                        currentUser={user}
                        onBack={() => setSelectedConversation(null)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageCircle className="w-16 h-16 text-blue-400/30 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                            <p className="text-blue-400">Choose from your messages or start a new chat</p>
                        </div>
                    </div>
                )}
            </div>
            
            <NewConversationDialog
                open={showNewConversation}
                onOpenChange={setShowNewConversation}
                currentUser={user}
                onConversationCreated={setSelectedConversation}
            />
        </div>
    );
}