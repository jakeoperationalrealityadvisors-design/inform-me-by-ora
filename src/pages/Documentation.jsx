import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Search, Book, FileText, CheckSquare, Users, Zap, Settings, Smartphone, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const guides = [
    {
        category: 'Getting Started',
        icon: Book,
        color: 'text-blue-400',
        articles: [
            {
                title: 'Welcome to InForm Me',
                content: `InForm Me is a powerful form and checklist management platform designed for teams and organizations. Create custom forms, manage checklists, track tasks, and automate workflows - all in one place.

**Key Features:**
• Custom forms with multiple field types
• Digital checklists for inspections and audits
• Document management and storage
• Task assignment and tracking
• Workflow automation
• Mobile app with offline support
• AI-powered assistance`
            },
            {
                title: 'Setting Up Your Organization',
                content: `**Creating Your Organization:**
1. Complete the onboarding flow after signing up
2. Choose to create a new network or join existing one
3. Set your organization name and preferences
4. Invite team members via Settings → Organization Settings

**Invite Codes:**
• Share your invite code with team members
• Generate hop codes for temporary contractor access
• Manage members and permissions from organization settings`
            },
            {
                title: 'Understanding User Roles',
                content: `**Role Types:**

**Admin** - Full system access
• Manage all forms, checklists, and templates
• Configure automations and integrations
• Manage users and permissions
• Access analytics and reports

**Manager** - Team oversight
• Create and edit forms/checklists
• View all submissions
• Assign tasks
• Basic analytics access

**Team Member** - Daily operations
• Fill out forms and checklists
• View assigned tasks
• Access documents
• View own submissions

**Custom Roles** - Admins can create custom roles with specific permissions`
            }
        ]
    },
    {
        category: 'Forms & Checklists',
        icon: FileText,
        color: 'text-[#FF8C00]',
        articles: [
            {
                title: 'Creating Forms',
                content: `**Step-by-Step:**
1. Go to Home and tap the + button
2. Select "Create Form"
3. Add a title and description
4. Choose a category
5. Add fields (text, number, date, select, photo, signature, etc.)
6. Configure required fields
7. Save your form

**Field Types Available:**
• Text - Short text input
• Textarea - Long text input
• Number - Numeric values
• Date - Date picker
• Select - Dropdown options
• Checkbox - Multiple selections
• Signature - Digital signatures
• Photo - Camera/image upload

**Tips:**
• Use clear, descriptive field labels
• Mark critical fields as required
• Add placeholder text for guidance
• Group related fields together`
            },
            {
                title: 'Filling Out Forms',
                content: `**Mobile & Offline:**
• Forms work offline when downloaded
• Data syncs automatically when online
• Camera integration for photos
• GPS location capture (if enabled)

**Submission Process:**
1. Select the form from Home
2. Fill in all required fields
3. Add photos or signatures as needed
4. Review your entries
5. Submit

**After Submission:**
• View your submission in My Tasks or Submissions
• Edit if allowed by permissions
• Export as PDF
• Share with team members`
            },
            {
                title: 'Creating Checklists',
                content: `**Checklist Creation:**
1. Tap + → Create Checklist
2. Add title and description
3. Choose category
4. Add checklist items
5. Mark items as required
6. Enable notes on items (optional)
7. Save

**Best Practices:**
• Keep items clear and actionable
• Order items logically
• Use categories to organize
• Enable notes for documentation
• Set required items for critical steps

**Completing Checklists:**
• Check off items as you complete them
• Add notes to document issues
• Track completion percentage
• Submit when done`
            },
            {
                title: 'Sharing Forms',
                content: `**Share Options:**

**Internal Sharing:**
• Share with team members
• Assign to specific users
• Set view/edit permissions

**Public Sharing:**
• Generate public link
• Share via QR code
• Embed on website
• No login required for submitters

**Tracking:**
• View submission analytics
• Monitor response rates
• Export responses`
            }
        ]
    },
    {
        category: 'Tasks & Workflow',
        icon: CheckSquare,
        color: 'text-green-400',
        articles: [
            {
                title: 'Managing Tasks',
                content: `**Task Features:**
• Assign tasks to team members
• Set due dates and priorities
• Track status (Todo, In Progress, Complete)
• Add descriptions and notes
• Link to forms/checklists
• Attach documents

**Task Views:**
• List view - All tasks
• Calendar view - Timeline
• My Tasks - Assigned to you
• Filters by status, priority, assignee

**Task Notifications:**
• Get notified when assigned
• Reminders before due dates
• Updates when status changes`
            },
            {
                title: 'Workflow Automation',
                content: `**What is Automation?**
Automatically trigger actions based on events:
• Form submitted → Create task
• Checklist completed → Send notification
• Task overdue → Alert manager
• Status changed → Update fields

**Creating Automations:**
1. Go to Settings → Automation
2. Choose trigger event
3. Set conditions (optional)
4. Add actions to perform
5. Test and enable

**Common Use Cases:**
• Auto-assign forms to managers
• Send emails on completion
• Create follow-up tasks
• Update external systems
• Generate reports

**Tips:**
• Start simple, add complexity later
• Test thoroughly before enabling
• Monitor automation analytics
• Use templates for common patterns`
            }
        ]
    },
    {
        category: 'Documents',
        icon: FileText,
        color: 'text-purple-400',
        articles: [
            {
                title: 'Document Management',
                content: `**Uploading Documents:**
• Drag and drop files
• Use file picker
• Scan directly with camera
• OCR text extraction

**Organization:**
• Create folders
• Add tags for categorization
• Set permissions
• Version control

**Document Features:**
• Preview documents in-app
• Download locally
• Share with team
• Link to forms/tasks
• AI-powered search

**Scanner:**
• Access from Scanner page
• Capture photos
• Auto crop and enhance
• Extract text with OCR
• Save to documents or send fax`
            },
            {
                title: 'Document Search',
                content: `**Search Options:**
• Text search across all documents
• Filter by folder
• Filter by tags
• Filter by date
• Filter by uploader
• Filter by file type

**AI Search:**
• Natural language queries
• Content-based search
• Smart suggestions
• Related documents`
            }
        ]
    },
    {
        category: 'Mobile & Offline',
        icon: Smartphone,
        color: 'text-blue-500',
        articles: [
            {
                title: 'Mobile App Features',
                content: `**Progressive Web App (PWA):**
• Install on home screen
• Works like native app
• Automatic updates
• Push notifications

**Installation:**
1. Open app in mobile browser
2. Look for "Install" prompt
3. Add to home screen
4. Launch from home screen

**Mobile Features:**
• Camera integration
• GPS location
• Offline mode
• Pull to refresh
• Swipe gestures
• Optimized touch targets`
            },
            {
                title: 'Working Offline',
                content: `**Enable Offline Mode:**
1. Go to Settings
2. Enable "Offline Mode"
3. Data downloads automatically
4. Work without internet

**What Works Offline:**
• View forms and checklists
• Fill out forms
• Complete checklists
• Take photos
• View documents (cached)

**Automatic Sync:**
• Syncs when connection returns
• Shows sync status indicator
• Handles conflicts automatically
• Background sync support

**Storage:**
• View cache size in Settings
• Clear cache if needed
• Re-download on demand`
            }
        ]
    },
    {
        category: 'AI Features',
        icon: Zap,
        color: 'text-[#FF8C00]',
        articles: [
            {
                title: 'AI Assistant',
                content: `**What Can AI Do?**
• Create forms from descriptions
• Analyze submissions
• Generate reports
• Extract data from documents
• Suggest improvements
• Answer questions

**Using AI Assistant:**
1. Go to Settings → AI Assistant
2. Describe what you need
3. AI generates content
4. Review and customize
5. Save to your account

**Examples:**
• "Create a safety inspection form"
• "Analyze last week's submissions"
• "Extract data from this invoice"
• "Suggest workflow improvements"`
            },
            {
                title: 'Smart Suggestions',
                content: `**AI-Powered Recommendations:**
• Frequently used forms
• Relevant checklists
• Overdue tasks
• Document suggestions
• Automation opportunities

**Knowledge Base:**
• Ask questions about your data
• Get insights from submissions
• Search across all content
• Natural language queries`
            }
        ]
    },
    {
        category: 'Settings & Security',
        icon: Shield,
        color: 'text-red-400',
        articles: [
            {
                title: 'Account Settings',
                content: `**Profile Settings:**
• Update name and email
• Upload profile photo
• Set technical level
• Choose language
• Configure notifications

**Technical Levels:**
• Extra Large & Simple - Bigger UI
• Simple & Easy - Minimal features
• Some Guidance - With tips
• I Know Apps - Standard
• Full Features - All advanced options`
            },
            {
                title: 'Security Features',
                content: `**Security Measures:**
• Email verification required
• Role-based access control
• XSS/CSRF protection
• Rate limiting
• Encrypted connections
• Audit logging

**Best Practices:**
• Verify your email
• Use strong passwords
• Review permissions regularly
• Monitor activity logs
• Report suspicious activity

**Data Privacy:**
• GDPR compliant
• Data export available
• Privacy policy
• Terms of service`
            },
            {
                title: 'Notification Settings',
                content: `**Configure Notifications:**
1. Go to Settings
2. Scroll to Notification Preferences
3. Enable/disable by type:
   • Task assignments
   • Due date reminders
   • Form submissions
   • Checklist completions
   • Document uploads
   • System updates

**Delivery Methods:**
• In-app notifications
• Email notifications
• Push notifications (mobile)

**Tips:**
• Enable task reminders
• Disable non-critical alerts
• Set quiet hours
• Use digest mode for less frequent updates`
            }
        ]
    }
];

const faqs = [
    {
        q: 'How do I invite team members?',
        a: 'Go to Settings → Organization Settings and use the invite code or generate a hop code for contractors. Share these codes with team members to join your organization.'
    },
    {
        q: 'Can I work offline?',
        a: 'Yes! Enable offline mode in Settings. Forms, checklists, and cached documents will be available without internet. Data syncs automatically when you reconnect.'
    },
    {
        q: 'How do I export my data?',
        a: 'Go to Settings → Export Data to download a complete copy of your organization\'s data in JSON format. Individual submissions can be exported as PDFs.'
    },
    {
        q: 'What are hop codes?',
        a: 'Hop codes are temporary access codes (6 digits) that allow contractors or temporary workers to access your organization without full membership. They expire after a set period.'
    },
    {
        q: 'How do automations work?',
        a: 'Automations trigger actions based on events. For example, when a form is submitted, you can automatically create a task, send an email, or update a field. Configure them in Settings → Automation.'
    },
    {
        q: 'Can I customize user roles?',
        a: 'Yes, admins can create custom roles with specific permissions in Settings → Role Management. Control what users can view, create, edit, and delete.'
    },
    {
        q: 'How do I upgrade my plan?',
        a: 'Go to Settings → Plans & Billing to view available plans and upgrade. You can also manage your subscription and billing from the Customer Portal.'
    },
    {
        q: 'Is my data secure?',
        a: 'Yes. We use encryption, role-based access control, email verification, and follow security best practices. All connections are over HTTPS and we\'re GDPR compliant.'
    },
    {
        q: 'How do I scan documents?',
        a: 'Go to the Scanner page, choose Scan or Photo mode, capture images, and save them to Documents or send via fax. OCR text extraction is available for searchable documents.'
    },
    {
        q: 'Can I share forms publicly?',
        a: 'Yes! Use the share button on any form to generate a public link or QR code. Anyone with the link can submit without logging in.'
    }
];

export default function Documentation() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState(guides[0].category);

    const filteredGuides = guides.map(cat => ({
        ...cat,
        articles: cat.articles.filter(article =>
            article.title.toLowerCase().includes(search.toLowerCase()) ||
            article.content.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(cat => cat.articles.length > 0);

    const filteredFaqs = faqs.filter(faq =>
        faq.q.toLowerCase().includes(search.toLowerCase()) ||
        faq.a.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0a0e17] py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <Link to={createPageUrl('Settings')}>
                    <Button variant="ghost" className="mb-6 text-blue-400">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Settings
                    </Button>
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Documentation</h1>
                    <p className="text-blue-400">Everything you need to know about InForm Me</p>
                </div>

                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search documentation..."
                        className="pl-10 bg-[#0f1419] border-blue-900/30 text-white h-12"
                    />
                </div>

                <Tabs defaultValue="guides" className="space-y-6">
                    <TabsList className="bg-[#0f1419] border border-blue-900/30">
                        <TabsTrigger value="guides">Guides</TabsTrigger>
                        <TabsTrigger value="faq">FAQ</TabsTrigger>
                        <TabsTrigger value="support">Support</TabsTrigger>
                    </TabsList>

                    {/* Guides */}
                    <TabsContent value="guides" className="space-y-6">
                        {/* Category Navigation */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {guides.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeCategory === cat.category;
                                return (
                                    <button
                                        key={cat.category}
                                        onClick={() => setActiveCategory(cat.category)}
                                        className={`p-4 rounded-lg border transition-all text-left ${
                                            isActive
                                                ? 'bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] border-transparent'
                                                : 'bg-[#0f1419] border-blue-900/30 hover:border-blue-700/50'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 mb-2 ${isActive ? 'text-white' : cat.color}`} />
                                        <div className={`font-semibold ${isActive ? 'text-white' : 'text-blue-100'}`}>
                                            {cat.category}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Articles */}
                        {filteredGuides.map((category) => {
                            if (category.category !== activeCategory && !search) return null;

                            return (
                                <Card key={category.category} className="bg-[#0f1419] border-blue-900/30">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            {React.createElement(category.icon, { className: `w-5 h-5 ${category.color}` })}
                                            {category.category}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type="single" collapsible className="space-y-3">
                                            {category.articles.map((article, idx) => (
                                                <AccordionItem
                                                    key={idx}
                                                    value={`${category.category}-${idx}`}
                                                    className="bg-[#0a0e17] rounded-lg border border-blue-900/30"
                                                >
                                                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                                        <span className="text-white font-medium">{article.title}</span>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="px-4 pb-4">
                                                        <div className="text-blue-300 whitespace-pre-line leading-relaxed">
                                                            {article.content}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </TabsContent>

                    {/* FAQ */}
                    <TabsContent value="faq">
                        <Card className="bg-[#0f1419] border-blue-900/30">
                            <CardHeader>
                                <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="space-y-3">
                                    {filteredFaqs.map((faq, idx) => (
                                        <AccordionItem
                                            key={idx}
                                            value={`faq-${idx}`}
                                            className="bg-[#0a0e17] rounded-lg border border-blue-900/30"
                                        >
                                            <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                                <span className="text-white font-medium text-left">{faq.q}</span>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <p className="text-blue-300 leading-relaxed">{faq.a}</p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Support */}
                    <TabsContent value="support">
                        <div className="space-y-6">
                            <Card className="bg-[#0f1419] border-blue-900/30">
                                <CardHeader>
                                    <CardTitle className="text-white">Need Help?</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-blue-300">
                                        Can't find what you're looking for? We're here to help!
                                    </p>
                                    <Link to={createPageUrl('Support')}>
                                        <Button className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]">
                                            <HelpCircle className="w-4 h-4 mr-2" />
                                            Contact Support
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="bg-[#0f1419] border-blue-900/30">
                                <CardHeader>
                                    <CardTitle className="text-white">AI Assistant</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-blue-300">
                                        Get instant answers to your questions with our AI assistant.
                                    </p>
                                    <Link to={createPageUrl('AIAssistantPage')}>
                                        <Button variant="outline" className="w-full border-blue-900/30">
                                            <Zap className="w-4 h-4 mr-2" />
                                            Open AI Assistant
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="bg-[#0f1419] border-blue-900/30">
                                <CardHeader>
                                    <CardTitle className="text-white">Video Tutorials</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-blue-300 mb-4">
                                        Coming soon! Video tutorials and walkthroughs.
                                    </p>
                                    <div className="text-sm text-blue-400">
                                        📹 Getting Started<br />
                                        📹 Creating Forms<br />
                                        📹 Setting Up Automation<br />
                                        📹 Mobile App Guide
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}