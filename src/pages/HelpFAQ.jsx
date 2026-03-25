import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, ChevronDown, ChevronUp, ArrowLeft, FileText, CheckSquare, ListTodo, FolderOpen, Users, Zap, Settings, Scan, BarChart3, MessageSquare, HelpCircle, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_DATA = [
    {
        category: 'Forms',
        icon: FileText,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        items: [
            { q: 'How do I create a new form?', a: 'Go to Admin → Forms tab → click "New Form". Add a title, select a category, then use the field builder to add text, number, date, dropdown, photo, signature, or checkbox fields. Click Save when done.' },
            { q: 'How do I make a field required?', a: 'In the form builder, toggle the "Required" switch on any field. Required fields must be filled in before the form can be submitted.' },
            { q: 'How do team members fill out a form?', a: 'Go to Submissions → select a form → click "Fill Form". On mobile, tap the form from the Forms tab. Completed submissions are saved and visible to managers.' },
            { q: 'Can I share a form publicly?', a: 'Yes! On the Submissions page, click the Share icon on any form to get a public link or QR code that anyone can use — no login required.' },
            { q: 'How do I view submitted forms?', a: 'Go to Submissions → click on any form → you\'ll see all submissions with dates, submitter names, and status. Click a submission to view full details.' },
            { q: 'Can I assign a form submission to someone?', a: 'Yes. When viewing a submission, use the Assignment Panel to assign it to a team member, set a due date and priority.' },
            { q: 'How do I edit or delete a form?', a: 'Go to Admin → Forms tab → click the pencil icon to edit or trash icon to delete. Deleting a form does not delete existing submissions.' },
        ],
    },
    {
        category: 'Checklists',
        icon: CheckSquare,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        items: [
            { q: 'How do I create a checklist?', a: 'Go to Admin → Checklists tab → click "New Checklist". Add items, mark which are required, and optionally enable notes per item. Save when done.' },
            { q: 'How do I run a checklist?', a: 'Go to Submissions → Checklists tab → click "Start Checklist". Check off items as you go. Notes fields appear if enabled. Click Submit to complete.' },
            { q: 'Are there pre-built checklists?', a: 'Yes! The app includes 150+ industry-specific checklists across agriculture, construction, transportation, food service, and more — all ready to use.' },
            { q: 'Can I add notes to individual checklist items?', a: 'Yes. When building a checklist, enable "Notes Enabled" on any item. When running the checklist, a text box appears under that item.' },
            { q: 'How is completion percentage tracked?', a: 'When a checklist is submitted, the system automatically calculates and saves the completion percentage based on how many items were checked off.' },
            { q: 'Can I share a checklist with external users?', a: 'Yes. Use the Share button on any checklist in the Submissions page to generate a public link or QR code.' },
        ],
    },
    {
        category: 'Tasks',
        icon: ListTodo,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        items: [
            { q: 'How do I create a task?', a: 'Go to My Tasks → click "New Task" or use the + button. Enter title, description, assign to a team member, set due date and priority, then Save.' },
            { q: 'How do I mark a task as complete?', a: 'On the My Tasks page, click the task card and change the status to "Completed", or use the checkbox if visible. Completed tasks are automatically timestamped.' },
            { q: 'Can tasks be linked to form submissions?', a: 'Yes. When viewing a form submission, use the Create Follow-up Task option to automatically link a task to that submission.' },
            { q: 'How do I filter tasks by due date or priority?', a: 'On the My Tasks page, use the filter and sort controls at the top. You can filter by Today, Overdue, Upcoming, and sort by due date or priority.' },
            { q: 'What are Daily Tasks?', a: 'Daily Tasks are repeating tasks that reset each day. Manage them via Settings → Daily Tasks or the Daily Tasks page. Great for opening/closing routines.' },
            { q: 'How do I get notified about tasks?', a: 'Task assignments automatically create in-app notifications. Enable email notifications in Settings → Notification Preferences for email alerts.' },
        ],
    },
    {
        category: 'Documents',
        icon: FolderOpen,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        items: [
            { q: 'How do I upload a document?', a: 'Go to Documents → click "Upload". Select your file, add a title and description, choose a folder, add tags, then click Upload. Supports PDF, images, Word, Excel, and more.' },
            { q: 'How do I organize documents into folders?', a: 'Go to Documents → Manage Folders to create, rename, or nest folders. You can also assign a folder to a specific category.' },
            { q: 'Can I scan physical documents?', a: 'Yes! Go to Scanner (camera icon in nav). Capture or upload a photo, then use "Extract Text (OCR)" to convert it to searchable text, then save to your document library.' },
            { q: 'How do I search for a document?', a: 'Use the search bar at the top of the Documents page. You can search by title, file name, or tags. Use Document Search for more advanced filtering.' },
            { q: 'Can I set permissions on documents?', a: 'Yes. Click the permissions icon on any document to set which users can view, edit, or delete it. You can also make documents public.' },
            { q: 'How do I view document version history?', a: 'Open any document and click "Version History" to see all previous versions and restore if needed.' },
        ],
    },
    {
        category: 'Team & Users',
        icon: Users,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        items: [
            { q: 'How do I invite a new team member?', a: 'Go to Settings → scroll to User Management, or go directly to User Management page. Click "Invite User", enter their email, select a role (User or Admin), and send.' },
            { q: 'What is the difference between Admin and User roles?', a: 'Admins can create/edit/delete forms, checklists, categories, and manage all users. Regular users can fill forms, complete checklists, and manage their own tasks.' },
            { q: 'Can I create custom roles?', a: 'Yes! Go to Settings → Role Management to create custom roles with granular permissions for forms, checklists, tasks, documents, submissions, and more.' },
            { q: 'What is a HopCode?', a: 'A HopCode is a temporary 6-digit code that gives contractors or external users quick access to your organization without a permanent account. Set it via Organization Settings.' },
            { q: 'How do I remove a user?', a: 'Go to User Management, find the user, and click Remove. Removed users lose access immediately. Their submitted data is retained.' },
        ],
    },
    {
        category: 'Automations',
        icon: Zap,
        color: 'text-pink-400',
        bg: 'bg-pink-500/10',
        items: [
            { q: 'What are automations?', a: 'Automations trigger actions automatically when events happen — like sending a notification when a form is submitted, or creating a task when a checklist is completed.' },
            { q: 'How do I create an automation?', a: 'Go to Settings → Automations or Manage Automations. Click "New Rule", choose a trigger (form submitted, task created, etc.), add conditions if needed, then define actions.' },
            { q: 'What actions can an automation perform?', a: 'Automations can: send notifications, send emails, create tasks, assign submissions, update statuses, add comments, trigger other automations, and run custom code.' },
            { q: 'Can I use pre-built automation templates?', a: 'Yes! When creating an automation, click "Use Template" to browse the built-in template library for common workflows.' },
            { q: 'How do I test an automation before enabling it?', a: 'Go to the automation → click "Test" to run it with sample data. The Automation Debugger shows exactly what happened step by step.' },
            { q: 'Can I pause an automation temporarily?', a: 'Yes. Click the toggle switch on any automation rule to enable or disable it without deleting it.' },
        ],
    },
    {
        category: 'Reports & Analytics',
        icon: BarChart3,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        items: [
            { q: 'How do I view submission reports?', a: 'Go to Reports. Use the filters on the left to select date range, category, and status. Charts show submission trends over time.' },
            { q: 'Can I export reports to CSV?', a: 'Yes! On the Reports page, click "Export CSV" to download a spreadsheet of all filtered submissions with all data fields.' },
            { q: 'What is the Analytics Dashboard?', a: 'The Analytics Dashboard (accessible from Settings) shows advanced charts for completion rates, task efficiency, document usage, and automation performance.' },
            { q: 'Can AI analyze my submissions?', a: 'Yes! On the Reports page, click "AI Insights" to have the AI summarize trends, identify issues, and suggest improvements based on your data.' },
            { q: 'How do I see activity history for my team?', a: 'Go to Settings → Activity Log to see a complete audit trail of every action taken by every user, including timestamps and change details.' },
        ],
    },
    {
        category: 'Scanner & OCR',
        icon: Scan,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        items: [
            { q: 'How do I scan a document?', a: 'Tap the Scanner in the navigation. Click "Capture Photo" to use your device camera, or "Upload Image" to select an existing file. The image is then processed.' },
            { q: 'How does OCR text extraction work?', a: 'After scanning, click "Extract Text (OCR)" and the AI will read all text from the image and display it inline. You can then copy it or save the document.' },
            { q: 'Where are scanned documents saved?', a: 'Click "Save to Documents" after scanning to save to your document library. You can also save to cloud storage if integrations are connected.' },
            { q: 'What file types can I scan/upload?', a: 'JPG, PNG, HEIC (iPhone), PDF. For best OCR results, use clear, well-lit images with dark text on a light background.' },
        ],
    },
    {
        category: 'Settings & Configuration',
        icon: Settings,
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        items: [
            { q: 'How do I change the app language?', a: 'Go to Settings → scroll to Language Preferences. Select your preferred language. The app will update all UI text immediately.' },
            { q: 'How do I switch between light and dark mode?', a: 'Click the sun/moon icon in the top navigation bar or go to Settings → Appearance to toggle the theme.' },
            { q: 'How do I set notification preferences?', a: 'Go to Settings → Notification Preferences. Toggle on/off email and in-app notifications for tasks, forms, checklists, and system events.' },
            { q: 'What is Senior Mode?', a: 'Senior Mode increases font size and button sizes for easier readability. Enable it in Settings → Accessibility.' },
            { q: 'How do I export all my data?', a: 'Go to Settings → Export Data to download a complete copy of all your forms, submissions, tasks, and documents as a ZIP file.' },
            { q: 'How do I set up integrations?', a: 'Go to Settings → Integrations to connect external services via REST, GraphQL, WebSocket, Webhooks, and more. The AI Workflow Builder can help configure integrations.' },
        ],
    },
];

function FAQItem({ item }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/5 last:border-0">
            <button onClick={() => setOpen(o => !o)}
                className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                <span className="text-sm text-white/80 font-medium">{item.q}</span>
                {open ? <ChevronUp className="w-4 h-4 text-white/30 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden">
                        <p className="px-4 pb-4 text-sm text-white/50 leading-relaxed">{item.a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function HelpFAQ() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);

    const filtered = FAQ_DATA.map(section => ({
        ...section,
        items: section.items.filter(item =>
            !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(section => {
        if (activeCategory && section.category !== activeCategory) return false;
        return section.items.length > 0;
    });

    const totalFAQ = FAQ_DATA.reduce((sum, s) => sum + s.items.length, 0);

    return (
        <div className="min-h-screen bg-[#070b12]">
            {/* Header */}
            <div className="bg-[#0a0e17] border-b border-white/5 px-6 py-5">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="icon" className="text-white/30 hover:text-white/60 h-8 w-8">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <HelpCircle className="w-6 h-6 text-orange-400" />
                        <div>
                            <h1 className="text-white font-bold text-lg leading-none">Help & FAQ</h1>
                            <p className="text-white/30 text-xs mt-0.5">{totalFAQ} answers across {FAQ_DATA.length} topics</p>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search for answers…"
                            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10" />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-6">
                {/* Category chips */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button onClick={() => setActiveCategory(null)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!activeCategory ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/50 hover:text-white/70 border border-white/10'}`}>
                        All Topics
                    </button>
                    {FAQ_DATA.map(s => (
                        <button key={s.category} onClick={() => setActiveCategory(s.category === activeCategory ? null : s.category)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === s.category ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/50 hover:text-white/70 border border-white/10'}`}>
                            {s.category}
                        </button>
                    ))}
                </div>

                {/* FAQ sections */}
                <div className="space-y-6">
                    {filtered.map(section => (
                        <div key={section.category}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-7 h-7 rounded-lg ${section.bg} flex items-center justify-center`}>
                                    <section.icon className={`w-4 h-4 ${section.color}`} />
                                </div>
                                <h2 className="text-white font-semibold text-sm">{section.category}</h2>
                                <span className="text-white/20 text-xs">({section.items.length})</span>
                            </div>
                            <div className="bg-[#0f1624] border border-white/5 rounded-2xl overflow-hidden">
                                {section.items.map((item, i) => <FAQItem key={i} item={item} />)}
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-white/30">
                            <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p>No answers found for "{search}"</p>
                            <Link to={createPageUrl('Support')}>
                                <Button variant="ghost" className="text-orange-400 mt-3 gap-1">
                                    Contact Support <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer CTA */}
                <div className="mt-10 bg-gradient-to-r from-orange-500/10 to-blue-600/10 border border-white/10 rounded-2xl p-6 text-center">
                    <p className="text-white font-semibold mb-1">Can't find what you need?</p>
                    <p className="text-white/40 text-sm mb-4">Our AI assistant can answer questions about the app in real time.</p>
                    <div className="flex gap-3 justify-center">
                        <Link to={createPageUrl('AIAssistantPage')}>
                            <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                                Ask AI Assistant <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                        </Link>
                        <Link to={createPageUrl('Support')}>
                            <Button variant="outline" className="border-white/10 text-white/60 hover:text-white gap-2">
                                Contact Support
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}