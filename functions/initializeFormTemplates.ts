import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const formTemplates = [
    {
        title: 'Employee Onboarding Form',
        description: 'Collect essential information from new employees during onboarding',
        category_id: null, // Will be set to first available category
        status: 'active',
        fields: [
            {
                id: 'full_name',
                label: 'Full Name',
                type: 'text',
                required: true,
                placeholder: 'Enter your full legal name'
            },
            {
                id: 'email',
                label: 'Email Address',
                type: 'text',
                required: true,
                placeholder: 'work.email@company.com'
            },
            {
                id: 'phone',
                label: 'Phone Number',
                type: 'text',
                required: true,
                placeholder: '+1 (555) 123-4567'
            },
            {
                id: 'department',
                label: 'Department',
                type: 'select',
                required: true,
                options: ['HR', 'IT', 'Finance', 'Operations', 'Sales', 'Marketing', 'Other'],
                placeholder: 'Select your department'
            },
            {
                id: 'position',
                label: 'Job Position',
                type: 'text',
                required: true,
                placeholder: 'e.g. Software Developer, Account Manager'
            },
            {
                id: 'start_date',
                label: 'Start Date',
                type: 'date',
                required: true
            },
            {
                id: 'emergency_contact',
                label: 'Emergency Contact Name',
                type: 'text',
                required: true,
                placeholder: 'Name of emergency contact'
            },
            {
                id: 'emergency_phone',
                label: 'Emergency Contact Phone',
                type: 'text',
                required: true,
                placeholder: 'Emergency contact phone number'
            },
            {
                id: 'special_requirements',
                label: 'Special Requirements or Accommodations',
                type: 'textarea',
                required: false,
                placeholder: 'Any special equipment, software, or accommodations needed'
            }
        ]
    },
    {
        title: 'IT Support Request',
        description: 'Submit technical issues or requests for IT assistance',
        category_id: null,
        status: 'active',
        fields: [
            {
                id: 'requester_name',
                label: 'Your Name',
                type: 'text',
                required: true,
                placeholder: 'Enter your full name'
            },
            {
                id: 'requester_email',
                label: 'Your Email',
                type: 'text',
                required: true,
                placeholder: 'your.email@company.com'
            },
            {
                id: 'priority',
                label: 'Priority Level',
                type: 'select',
                required: true,
                options: ['Low', 'Medium', 'High', 'Critical'],
                placeholder: 'How urgent is this issue?'
            },
            {
                id: 'issue_type',
                label: 'Issue Type',
                type: 'select',
                required: true,
                options: ['Hardware Problem', 'Software Issue', 'Network Problem', 'Access Request', 'New Equipment', 'Training Request', 'Other'],
                placeholder: 'What type of issue is this?'
            },
            {
                id: 'subject',
                label: 'Subject/Title',
                type: 'text',
                required: true,
                placeholder: 'Brief description of the issue'
            },
            {
                id: 'description',
                label: 'Detailed Description',
                type: 'textarea',
                required: true,
                placeholder: 'Please provide detailed information about the issue, including steps to reproduce, error messages, etc.'
            },
            {
                id: 'affected_system',
                label: 'Affected System/Application',
                type: 'text',
                required: false,
                placeholder: 'e.g. Email, CRM, Accounting Software, Company Laptop'
            },
            {
                id: 'location',
                label: 'Your Location/Office',
                type: 'text',
                required: false,
                placeholder: 'Office location or remote work details'
            }
        ]
    },
    {
        title: 'Expense Report',
        description: 'Submit business expenses for reimbursement',
        category_id: null,
        status: 'active',
        fields: [
            {
                id: 'employee_name',
                label: 'Employee Name',
                type: 'text',
                required: true,
                placeholder: 'Enter your full name'
            },
            {
                id: 'employee_email',
                label: 'Employee Email',
                type: 'text',
                required: true,
                placeholder: 'your.email@company.com'
            },
            {
                id: 'department',
                label: 'Department',
                type: 'select',
                required: true,
                options: ['HR', 'IT', 'Finance', 'Operations', 'Sales', 'Marketing', 'Other'],
                placeholder: 'Select your department'
            },
            {
                id: 'expense_period',
                label: 'Expense Period',
                type: 'text',
                required: true,
                placeholder: 'e.g. January 2024, Q1 2024'
            },
            {
                id: 'total_amount',
                label: 'Total Amount Requested',
                type: 'number',
                required: true,
                placeholder: 'Total amount in USD'
            },
            {
                id: 'expense_details',
                label: 'Expense Details',
                type: 'textarea',
                required: true,
                placeholder: 'List all expenses with dates, amounts, and purposes. Include receipts information.'
            },
            {
                id: 'payment_method',
                label: 'Preferred Payment Method',
                type: 'select',
                required: true,
                options: ['Direct Deposit', 'Check', 'Company Credit Card'],
                placeholder: 'How would you like to receive reimbursement?'
            },
            {
                id: 'approval_manager',
                label: 'Manager Approval Required',
                type: 'text',
                required: true,
                placeholder: 'Name of manager who needs to approve this expense'
            }
        ]
    },
    {
        title: 'Meeting Room Booking',
        description: 'Reserve meeting rooms and conference facilities',
        category_id: null,
        status: 'active',
        fields: [
            {
                id: 'requester_name',
                label: 'Requester Name',
                type: 'text',
                required: true,
                placeholder: 'Enter your full name'
            },
            {
                id: 'requester_email',
                label: 'Requester Email',
                type: 'text',
                required: true,
                placeholder: 'your.email@company.com'
            },
            {
                id: 'meeting_title',
                label: 'Meeting Title',
                type: 'text',
                required: true,
                placeholder: 'Purpose or title of the meeting'
            },
            {
                id: 'room_preference',
                label: 'Preferred Room',
                type: 'select',
                required: true,
                options: ['Conference Room A', 'Conference Room B', 'Board Room', 'Training Room', 'Phone Booth 1', 'Phone Booth 2'],
                placeholder: 'Select your preferred room'
            },
            {
                id: 'date',
                label: 'Date',
                type: 'date',
                required: true
            },
            {
                id: 'start_time',
                label: 'Start Time',
                type: 'text',
                required: true,
                placeholder: 'e.g. 9:00 AM'
            },
            {
                id: 'end_time',
                label: 'End Time',
                type: 'text',
                required: true,
                placeholder: 'e.g. 10:30 AM'
            },
            {
                id: 'attendees',
                label: 'Expected Attendees',
                type: 'number',
                required: true,
                placeholder: 'Number of people attending'
            },
            {
                id: 'special_requirements',
                label: 'Special Requirements',
                type: 'textarea',
                required: false,
                placeholder: 'AV equipment, refreshments, accessibility needs, etc.'
            }
        ]
    },
    {
        title: 'Performance Review',
        description: 'Annual or periodic employee performance evaluation',
        category_id: null,
        status: 'active',
        fields: [
            {
                id: 'employee_name',
                label: 'Employee Name',
                type: 'text',
                required: true,
                placeholder: 'Name of employee being reviewed'
            },
            {
                id: 'employee_email',
                label: 'Employee Email',
                type: 'text',
                required: true,
                placeholder: 'employee.email@company.com'
            },
            {
                id: 'review_period',
                label: 'Review Period',
                type: 'text',
                required: true,
                placeholder: 'e.g. January 2024 - December 2024'
            },
            {
                id: 'reviewer_name',
                label: 'Reviewer Name',
                type: 'text',
                required: true,
                placeholder: 'Name of person conducting the review'
            },
            {
                id: 'reviewer_email',
                label: 'Reviewer Email',
                type: 'text',
                required: true,
                placeholder: 'reviewer.email@company.com'
            },
            {
                id: 'overall_rating',
                label: 'Overall Performance Rating',
                type: 'select',
                required: true,
                options: ['Exceeds Expectations', 'Meets Expectations', 'Below Expectations', 'Needs Improvement'],
                placeholder: 'Select overall rating'
            },
            {
                id: 'achievements',
                label: 'Key Achievements',
                type: 'textarea',
                required: true,
                placeholder: 'List major accomplishments and contributions during the review period'
            },
            {
                id: 'areas_improvement',
                label: 'Areas for Improvement',
                type: 'textarea',
                required: true,
                placeholder: 'Areas where performance could be improved'
            },
            {
                id: 'goals',
                label: 'Goals for Next Period',
                type: 'textarea',
                required: true,
                placeholder: 'Specific, measurable goals for the next review period'
            },
            {
                id: 'comments',
                label: 'Additional Comments',
                type: 'textarea',
                required: false,
                placeholder: 'Any additional feedback or comments'
            }
        ]
    },
    {
        title: 'Customer Feedback Survey',
        description: 'Collect feedback from customers about products or services',
        category_id: null,
        status: 'active',
        fields: [
            {
                id: 'customer_name',
                label: 'Your Name',
                type: 'text',
                required: false,
                placeholder: 'Optional: Enter your name'
            },
            {
                id: 'customer_email',
                label: 'Email Address',
                type: 'text',
                required: false,
                placeholder: 'Optional: your.email@example.com'
            },
            {
                id: 'service_rating',
                label: 'How would you rate our service?',
                type: 'select',
                required: true,
                options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
                placeholder: 'Select your rating'
            },
            {
                id: 'product_satisfaction',
                label: 'How satisfied are you with our product?',
                type: 'select',
                required: true,
                options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
                placeholder: 'Select your satisfaction level'
            },
            {
                id: 'recommendation',
                label: 'Would you recommend us to others?',
                type: 'select',
                required: true,
                options: ['Definitely Yes', 'Probably Yes', 'Not Sure', 'Probably Not', 'Definitely Not'],
                placeholder: 'Select your recommendation likelihood'
            },
            {
                id: 'feedback_details',
                label: 'Please provide details about your experience',
                type: 'textarea',
                required: true,
                placeholder: 'What did you like? What could be improved? Any specific comments?'
            },
            {
                id: 'contact_permission',
                label: 'May we contact you for follow-up?',
                type: 'select',
                required: true,
                options: ['Yes', 'No'],
                placeholder: 'Select your preference'
            }
        ]
    }
];

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Admin only
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Get first available category for templates that don't have one
        const categories = await base44.asServiceRole.entities.Category.list();
        const defaultCategoryId = categories.length > 0 ? categories[0].id : null;

        const createdTemplates = [];

        for (const template of formTemplates) {
            try {
                // Check if template already exists
                const existing = await base44.asServiceRole.entities.FormTemplate.filter({
                    title: template.title
                });

                if (existing.length > 0) {
                    console.log(`Template "${template.title}" already exists, skipping`);
                    continue;
                }

                // Create the template
                const created = await base44.asServiceRole.entities.FormTemplate.create({
                    ...template,
                    category_id: template.category_id || defaultCategoryId
                });

                createdTemplates.push({
                    id: created.id,
                    title: created.title,
                    fieldCount: created.fields.length
                });

                console.log(`Created form template: ${created.title}`);

            } catch (error) {
                console.error(`Failed to create template "${template.title}":`, error);
            }
        }

        return Response.json({
            success: true,
            message: `Created ${createdTemplates.length} form templates`,
            templates: createdTemplates
        });

    } catch (error) {
        console.error('Error initializing form templates:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});