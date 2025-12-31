import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, FileText, CheckSquare, User, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import SearchBar from '@/components/common/SearchBar';
import EmptyState from '@/components/common/EmptyState';
import { useUserRole } from '@/components/auth/RoleGuard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function Submissions() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('forms');
    const [statusFilter, setStatusFilter] = useState('all');
    const { user, canViewAll } = useUserRole();
    
    const { data: formSubmissions = [], isLoading: formsLoading } = useQuery({
        queryKey: ['form-submissions', canViewAll, user?.email],
        queryFn: async () => {
            const all = await base44.entities.FormSubmission.list('-created_date');
            if (!canViewAll) return all.filter(f => f.created_by === user?.email);
            return all;
        }
    });
    
    const { data: checklistSubmissions = [], isLoading: checklistsLoading } = useQuery({
        queryKey: ['checklist-submissions', canViewAll, user?.email],
        queryFn: async () => {
            const all = await base44.entities.ChecklistSubmission.list('-created_date');
            if (!canViewAll) return all.filter(c => c.created_by === user?.email);
            return all;
        }
    });
    
    const filteredForms = formSubmissions.filter(sub =>
        (!search || sub.form_title?.toLowerCase().includes(search.toLowerCase()) || sub.submitted_by_name?.toLowerCase().includes(search.toLowerCase())) &&
        (statusFilter === 'all' || sub.status === statusFilter)
    );
    
    const filteredChecklists = checklistSubmissions.filter(sub =>
        (!search || sub.checklist_title?.toLowerCase().includes(search.toLowerCase()) || sub.submitted_by_name?.toLowerCase().includes(search.toLowerCase())) &&
        (statusFilter === 'all' || sub.status === statusFilter)
    );
    
    const statusColors = {
        submitted: 'bg-blue-500/20 text-blue-400',
        reviewed: 'bg-amber-500/20 text-amber-400',
        approved: 'bg-emerald-500/20 text-emerald-400',
        rejected: 'bg-red-500/20 text-red-400',
        in_progress: 'bg-amber-500/20 text-amber-400',
        completed: 'bg-emerald-500/20 text-emerald-400'
    };
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="icon" className="rounded-full text-blue-400">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold text-white">Submissions</h1>
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                        <SearchBar value={search} onChange={setSearch} placeholder="Search..." />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-32 bg-[#0a0e17] border-blue-900/20 text-white">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2 p-1 bg-[#0a0e17] rounded-lg">
                        <button onClick={() => setActiveTab('forms')} className={`flex-1 py-2 rounded text-xs font-medium ${activeTab === 'forms' ? 'bg-blue-600 text-white' : 'text-blue-400'}`}>
                            Forms ({formSubmissions.length})
                        </button>
                        <button onClick={() => setActiveTab('checklists')} className={`flex-1 py-2 rounded text-xs font-medium ${activeTab === 'checklists' ? 'bg-blue-600 text-white' : 'text-blue-400'}`}>
                            Checklists ({checklistSubmissions.length})
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-2">
                {(formsLoading || checklistsLoading) ? (
                    <div className="text-center py-12 text-blue-400">Loading...</div>
                ) : activeTab === 'forms' ? (
                    filteredForms.length > 0 ? (
                        filteredForms.map((sub) => (
                            <SubmissionCard key={sub.id} submission={sub} type="form" statusColors={statusColors} />
                        ))
                    ) : (
                        <EmptyState icon={FileText} title="No submissions" />
                    )
                ) : (
                    filteredChecklists.length > 0 ? (
                        filteredChecklists.map((sub) => (
                            <SubmissionCard key={sub.id} submission={sub} type="checklist" statusColors={statusColors} />
                        ))
                    ) : (
                        <EmptyState icon={CheckSquare} title="No submissions" />
                    )
                )}
            </div>
        </div>
    );
}

function SubmissionCard({ submission, type, statusColors }) {
    const [isOpen, setIsOpen] = useState(false);
    const title = type === 'form' ? submission.form_title : submission.checklist_title;
    const viewUrl = type === 'form' ? `ViewFormSubmission?id=${submission.id}` : `ViewChecklistSubmission?id=${submission.id}`;
    
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="bg-[#0f1419] border border-blue-900/20 rounded-lg hover:border-blue-700/50 transition-all">
                <div className="flex items-center gap-3 p-3">
                    <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left">
                        {isOpen ? <ChevronDown className="w-4 h-4 text-blue-400" /> : <ChevronRight className="w-4 h-4 text-blue-400" />}
                        <span className="font-medium text-white">{title}</span>
                    </CollapsibleTrigger>
                    <Badge className={`${statusColors[submission.status]} text-xs`}>{submission.status}</Badge>
                    <Link to={createPageUrl(viewUrl)}>
                        <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">View</button>
                    </Link>
                </div>
                <CollapsibleContent>
                    <div className="px-3 pb-3 pt-2 border-t border-blue-900/20 mt-2">
                        <div className="flex flex-wrap gap-3 text-xs text-blue-400/60">
                            {submission.submitted_by_name && (
                                <span className="flex items-center gap-1"><User className="w-3 h-3" />{submission.submitted_by_name}</span>
                            )}
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(submission.created_date), 'MMM d, h:mm a')}</span>
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}