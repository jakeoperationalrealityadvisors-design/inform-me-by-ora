import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import EventDialog from '@/components/calendar/EventDialog';
import { useUserRole } from '@/components/auth/RoleGuard';
import { Badge } from "@/components/ui/badge";

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, canViewAll } = useUserRole();
    const [showEventDialog, setShowEventDialog] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showFilter, setShowFilter] = useState(false);
    const [eventTypeFilter, setEventTypeFilter] = useState('all');
    
    const getEventIcon = (type) => {
        const icons = {
            inspection: '🔍',
            meeting: '👥',
            follow_up: '📞',
            deadline: '⏰',
            review: '📋'
        };
        return icons[type] || '📅';
    };
    
    // Fetch form tasks
    const { data: formTasks = [] } = useQuery({
        queryKey: ['form-submissions-calendar'],
        queryFn: () => canViewAll 
            ? base44.entities.FormSubmission.list('-due_date')
            : base44.entities.FormSubmission.filter({ assigned_to_email: user?.email }, '-due_date'),
        enabled: !!user
    });
    
    // Fetch checklist tasks
    const { data: checklistTasks = [] } = useQuery({
        queryKey: ['checklist-submissions-calendar'],
        queryFn: () => canViewAll
            ? base44.entities.ChecklistSubmission.list('-due_date')
            : base44.entities.ChecklistSubmission.filter({ assigned_to_email: user?.email }, '-due_date'),
        enabled: !!user
    });
    
    // Fetch scheduled events
    const { data: scheduledEvents = [] } = useQuery({
        queryKey: ['scheduled-events'],
        queryFn: () => canViewAll
            ? base44.entities.ScheduledEvent.filter({ status: 'scheduled' }, '-start_date')
            : base44.entities.ScheduledEvent.filter({ 
                status: 'scheduled',
                assigned_to_email: user?.email 
            }, '-start_date'),
        enabled: !!user
    });
    
    const events = useMemo(() => {
        let allEvents = [];
        
        // Form tasks
        const formEvents = formTasks
            .filter(task => task.due_date)
            .map(task => ({
                id: `form-${task.id}`,
                title: `📄 ${task.form_title}`,
                start: new Date(task.due_date),
                end: new Date(task.due_date),
                allDay: true,
                resource: { 
                    type: 'form', 
                    task, 
                    priority: task.priority,
                    eventType: 'task'
                }
            }));
        
        // Checklist tasks
        const checklistEvents = checklistTasks
            .filter(task => task.due_date)
            .map(task => ({
                id: `checklist-${task.id}`,
                title: `✓ ${task.checklist_title}`,
                start: new Date(task.due_date),
                end: new Date(task.due_date),
                allDay: true,
                resource: { 
                    type: 'checklist', 
                    task, 
                    priority: task.priority,
                    eventType: 'task'
                }
            }));
        
        // Scheduled events
        const scheduledEventItems = scheduledEvents.map(event => ({
            id: `event-${event.id}`,
            title: `${getEventIcon(event.event_type)} ${event.title}`,
            start: new Date(event.start_date),
            end: event.end_date ? new Date(event.end_date) : new Date(event.start_date),
            allDay: event.all_day,
            resource: {
                type: 'scheduled',
                event,
                eventType: event.event_type
            }
        }));
        
        allEvents = [...formEvents, ...checklistEvents, ...scheduledEventItems];
        
        // Apply filter
        if (eventTypeFilter !== 'all') {
            allEvents = allEvents.filter(e => {
                if (eventTypeFilter === 'tasks') {
                    return e.resource.type === 'form' || e.resource.type === 'checklist';
                }
                return e.resource.eventType === eventTypeFilter;
            });
        }
        
        return allEvents;
    }, [formTasks, checklistTasks, scheduledEvents, eventTypeFilter, getEventIcon]);
    
    const handleSelectEvent = (event) => {
        const { type, task, event: scheduledEvent } = event.resource;
        if (type === 'form') {
            navigate(createPageUrl(`ViewFormSubmission?id=${task.id}`));
        } else if (type === 'checklist') {
            navigate(createPageUrl(`ViewChecklistSubmission?id=${task.id}`));
        } else if (type === 'scheduled') {
            setSelectedEvent(scheduledEvent);
            setShowEventDialog(true);
        }
    };
    
    const handleSelectSlot = ({ start }) => {
        setSelectedEvent({
            start_date: start.toISOString(),
            all_day: true
        });
        setShowEventDialog(true);
    };
    
    const eventStyleGetter = (event) => {
        const { type, priority, eventType } = event.resource;
        
        if (type === 'scheduled') {
            const eventTypeColors = {
                inspection: { backgroundColor: '#8b5cf6', borderColor: '#7c3aed' },
                meeting: { backgroundColor: '#06b6d4', borderColor: '#0891b2' },
                follow_up: { backgroundColor: '#10b981', borderColor: '#059669' },
                deadline: { backgroundColor: '#ef4444', borderColor: '#dc2626' },
                review: { backgroundColor: '#f59e0b', borderColor: '#d97706' }
            };
            return {
                style: {
                    ...eventTypeColors[eventType],
                    borderRadius: '6px',
                    border: 'none',
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    padding: '2px 5px',
                    color: 'white'
                }
            };
        }
        
        const priorityColors = {
            low: { backgroundColor: '#3b82f6', borderColor: '#2563eb' },
            medium: { backgroundColor: '#eab308', borderColor: '#ca8a04' },
            high: { backgroundColor: '#f97316', borderColor: '#ea580c' },
            urgent: { backgroundColor: '#ef4444', borderColor: '#dc2626' }
        };
        
        return {
            style: {
                ...priorityColors[priority || 'medium'],
                borderRadius: '6px',
                border: 'none',
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                padding: '2px 5px',
                color: 'white'
            }
        };
    };
    
    return (
        <div className="min-h-screen bg-slate-100">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Home')}>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Calendar</h1>
                                <p className="text-sm text-slate-600">Tasks, events & schedules</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilter(!showFilter)}
                                className="gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                Filter
                            </Button>
                            <Button
                                onClick={() => {
                                    setSelectedEvent(null);
                                    setShowEventDialog(true);
                                }}
                                className="bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New Event
                            </Button>
                        </div>
                    </div>
                    
                    {showFilter && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge
                                onClick={() => setEventTypeFilter('all')}
                                className={`cursor-pointer ${
                                    eventTypeFilter === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                All
                            </Badge>
                            <Badge
                                onClick={() => setEventTypeFilter('tasks')}
                                className={`cursor-pointer ${
                                    eventTypeFilter === 'tasks'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Tasks
                            </Badge>
                            <Badge
                                onClick={() => setEventTypeFilter('inspection')}
                                className={`cursor-pointer ${
                                    eventTypeFilter === 'inspection'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                🔍 Inspections
                            </Badge>
                            <Badge
                                onClick={() => setEventTypeFilter('meeting')}
                                className={`cursor-pointer ${
                                    eventTypeFilter === 'meeting'
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                👥 Meetings
                            </Badge>
                            <Badge
                                onClick={() => setEventTypeFilter('follow_up')}
                                className={`cursor-pointer ${
                                    eventTypeFilter === 'follow_up'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                📞 Follow-ups
                            </Badge>
                            <Badge
                                onClick={() => setEventTypeFilter('deadline')}
                                className={`cursor-pointer ${
                                    eventTypeFilter === 'deadline'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                ⏰ Deadlines
                            </Badge>
                            <Badge
                                onClick={() => setEventTypeFilter('review')}
                                className={`cursor-pointer ${
                                    eventTypeFilter === 'review'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                📋 Reviews
                            </Badge>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm" style={{ height: '700px' }}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectEvent={handleSelectEvent}
                        onSelectSlot={handleSelectSlot}
                        eventPropGetter={eventStyleGetter}
                        views={['month', 'week', 'day', 'agenda']}
                        defaultView="month"
                        selectable
                        popup
                    />
                </div>
            </div>
            
            {showEventDialog && (
                <EventDialog
                    event={selectedEvent}
                    onClose={() => {
                        setShowEventDialog(false);
                        setSelectedEvent(null);
                    }}
                    onSave={() => {
                        queryClient.invalidateQueries(['scheduled-events']);
                        setShowEventDialog(false);
                        setSelectedEvent(null);
                    }}
                />
            )}
            
            <style>{`
                .rbc-calendar {
                    font-family: inherit;
                }
                .rbc-header {
                    padding: 12px 3px;
                    font-weight: 600;
                    color: #1e293b;
                    background: #f8fafc;
                    border-color: #e2e8f0;
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
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-weight: 500;
                }
                .rbc-toolbar button:hover {
                    background-color: #f1f5f9;
                }
                .rbc-toolbar button:active,
                .rbc-toolbar button.rbc-active {
                    background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
                    color: white;
                    border-color: #1e90ff;
                }
                .rbc-month-view, .rbc-time-view {
                    border-color: #e2e8f0;
                }
                .rbc-day-bg + .rbc-day-bg {
                    border-left-color: #e2e8f0;
                }
                .rbc-month-row + .rbc-month-row {
                    border-top-color: #e2e8f0;
                }
            `}</style>
        </div>
    );
}