import React, { useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const localizer = momentLocalizer(moment);

export default function TaskCalendar({ formTasks = [], checklistTasks = [] }) {
    const navigate = useNavigate();
    
    const events = useMemo(() => {
        const formEvents = formTasks
            .filter(task => task.due_date)
            .map(task => ({
                id: task.id,
                title: `📄 ${task.form_title}`,
                start: new Date(task.due_date),
                end: new Date(task.due_date),
                resource: { type: 'form', task, priority: task.priority }
            }));
            
        const checklistEvents = checklistTasks
            .filter(task => task.due_date)
            .map(task => ({
                id: task.id,
                title: `✓ ${task.checklist_title}`,
                start: new Date(task.due_date),
                end: new Date(task.due_date),
                resource: { type: 'checklist', task, priority: task.priority }
            }));
            
        return [...formEvents, ...checklistEvents];
    }, [formTasks, checklistTasks]);
    
    const handleSelectEvent = (event) => {
        const { type, task } = event.resource;
        if (type === 'form') {
            navigate(createPageUrl(`ViewFormSubmission?id=${task.id}`));
        } else {
            navigate(createPageUrl(`ViewChecklistSubmission?id=${task.id}`));
        }
    };
    
    const eventStyleGetter = (event) => {
        const priority = event.resource.priority || 'medium';
        const priorityColors = {
            low: { backgroundColor: '#3b82f6', borderColor: '#2563eb' },
            medium: { backgroundColor: '#eab308', borderColor: '#ca8a04' },
            high: { backgroundColor: '#f97316', borderColor: '#ea580c' },
            urgent: { backgroundColor: '#ef4444', borderColor: '#dc2626' }
        };
        
        return {
            style: {
                ...priorityColors[priority],
                borderRadius: '6px',
                border: 'none',
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                padding: '2px 5px'
            }
        };
    };
    
    return (
        <div className="bg-[#0f1419] rounded-2xl p-4 border border-blue-900/30" style={{ height: '600px' }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'agenda']}
                defaultView="month"
                popup
            />
            <style>{`
                .rbc-calendar {
                    font-family: inherit;
                }
                .rbc-header {
                    padding: 10px 3px;
                    font-weight: 600;
                    color: #1e293b;
                }
                .rbc-today {
                    background-color: #dbeafe;
                }
                .rbc-off-range-bg {
                    background-color: #f8fafc;
                }
                .rbc-event {
                    padding: 2px 5px;
                }
                .rbc-toolbar button {
                    color: #1e293b;
                    border-color: #e2e8f0;
                }
                .rbc-toolbar button:active,
                .rbc-toolbar button.rbc-active {
                    background-color: #3b82f6;
                    color: white;
                    border-color: #3b82f6;
                }
            `}</style>
        </div>
    );
}