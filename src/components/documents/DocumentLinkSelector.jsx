import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link as LinkIcon, FileText, CheckSquare, ListTodo, Search, X } from 'lucide-react';

export default function DocumentLinkSelector({ currentLinks = {}, onLinksUpdate, trigger }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [links, setLinks] = useState(currentLinks);

    const { data: forms = [] } = useQuery({
        queryKey: ['form-submissions-all'],
        queryFn: () => httpClient.entities.FormSubmission.list('-created_date'),
        enabled: open
    });

    const { data: checklists = [] } = useQuery({
        queryKey: ['checklist-submissions-all'],
        queryFn: () => httpClient.entities.ChecklistSubmission.list('-created_date'),
        enabled: open
    });

    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks-all'],
        queryFn: () => httpClient.entities.Task.list('-created_date'),
        enabled: open
    });

    const filteredForms = forms.filter(f => 
        !search || f.form_title?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredChecklists = checklists.filter(c => 
        !search || c.checklist_title?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredTasks = tasks.filter(t => 
        !search || t.title?.toLowerCase().includes(search.toLowerCase())
    );

    const handleLink = (type, id, title) => {
        const newLinks = { ...links };
        
        if (type === 'form') {
            newLinks.form_submission_id = id;
            newLinks.form_title = title;
        } else if (type === 'checklist') {
            newLinks.checklist_submission_id = id;
            newLinks.checklist_title = title;
        } else if (type === 'task') {
            newLinks.task_id = id;
            newLinks.task_title = title;
        }
        
        setLinks(newLinks);
    };

    const handleUnlink = (type) => {
        const newLinks = { ...links };
        
        if (type === 'form') {
            delete newLinks.form_submission_id;
            delete newLinks.form_title;
        } else if (type === 'checklist') {
            delete newLinks.checklist_submission_id;
            delete newLinks.checklist_title;
        } else if (type === 'task') {
            delete newLinks.task_id;
            delete newLinks.task_title;
        }
        
        setLinks(newLinks);
    };

    const handleSave = () => {
        onLinksUpdate(links);
        setOpen(false);
    };

    const linkCount = Object.keys(links).filter(k => k.endsWith('_id')).length;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Link to Items
                        {linkCount > 0 && (
                            <Badge className="ml-1 bg-blue-600 text-white">{linkCount}</Badge>
                        )}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Link Document to Items</DialogTitle>
                </DialogHeader>

                {/* Current Links */}
                {linkCount > 0 && (
                    <div className="space-y-2 pb-4 border-b">
                        <p className="text-sm text-slate-600">Currently Linked:</p>
                        {links.form_submission_id && (
                            <Badge className="bg-blue-100 text-blue-700 gap-2">
                                <FileText className="w-3 h-3" />
                                Form: {links.form_title}
                                <X 
                                    className="w-3 h-3 cursor-pointer hover:text-red-600" 
                                    onClick={() => handleUnlink('form')}
                                />
                            </Badge>
                        )}
                        {links.checklist_submission_id && (
                            <Badge className="bg-green-100 text-green-700 gap-2">
                                <CheckSquare className="w-3 h-3" />
                                Checklist: {links.checklist_title}
                                <X 
                                    className="w-3 h-3 cursor-pointer hover:text-red-600" 
                                    onClick={() => handleUnlink('checklist')}
                                />
                            </Badge>
                        )}
                        {links.task_id && (
                            <Badge className="bg-purple-100 text-purple-700 gap-2">
                                <ListTodo className="w-3 h-3" />
                                Task: {links.task_title}
                                <X 
                                    className="w-3 h-3 cursor-pointer hover:text-red-600" 
                                    onClick={() => handleUnlink('task')}
                                />
                            </Badge>
                        )}
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search items..."
                        className="pl-10"
                    />
                </div>

                {/* Tabs */}
                <Tabs defaultValue="forms" className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="forms">Forms</TabsTrigger>
                        <TabsTrigger value="checklists">Checklists</TabsTrigger>
                        <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    </TabsList>

                    <TabsContent value="forms" className="flex-1 overflow-y-auto space-y-2 mt-4">
                        {filteredForms.length > 0 ? (
                            filteredForms.map(form => (
                                <div
                                    key={form.id}
                                    onClick={() => handleLink('form', form.id, form.form_title)}
                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                        links.form_submission_id === form.id
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">{form.form_title}</p>
                                            <p className="text-sm text-slate-500">
                                                {form.submitted_by_name} • {new Date(form.created_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-500 py-8">No forms found</p>
                        )}
                    </TabsContent>

                    <TabsContent value="checklists" className="flex-1 overflow-y-auto space-y-2 mt-4">
                        {filteredChecklists.length > 0 ? (
                            filteredChecklists.map(checklist => (
                                <div
                                    key={checklist.id}
                                    onClick={() => handleLink('checklist', checklist.id, checklist.checklist_title)}
                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                        links.checklist_submission_id === checklist.id
                                            ? 'border-green-600 bg-green-50'
                                            : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">{checklist.checklist_title}</p>
                                            <p className="text-sm text-slate-500">
                                                {checklist.submitted_by_name} • {checklist.completion_percentage || 0}% complete
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-500 py-8">No checklists found</p>
                        )}
                    </TabsContent>

                    <TabsContent value="tasks" className="flex-1 overflow-y-auto space-y-2 mt-4">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => handleLink('task', task.id, task.title)}
                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                        links.task_id === task.id
                                            ? 'border-purple-600 bg-purple-50'
                                            : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <ListTodo className="w-5 h-5 text-purple-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">{task.title}</p>
                                            <p className="text-sm text-slate-500">
                                                {task.assigned_to_email} • {task.priority}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-500 py-8">No tasks found</p>
                        )}
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        Save Links
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}