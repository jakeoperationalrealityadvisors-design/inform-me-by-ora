import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EventDialog({ event, onClose, onSave }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_type: 'follow_up',
        start_date: '',
        end_date: '',
        all_day: true,
        location: '',
        assigned_to_email: '',
        status: 'scheduled'
    });
    
    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: () => httpClient.entities.User.list()
    });
    
    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title || '',
                description: event.description || '',
                event_type: event.event_type || 'follow_up',
                start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
                end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
                all_day: event.all_day ?? true,
                location: event.location || '',
                assigned_to_email: event.assigned_to_email || '',
                status: event.status || 'scheduled'
            });
        }
    }, [event]);
    
    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (event?.id) {
                return httpClient.entities.ScheduledEvent.update(event.id, data);
            } else {
                return httpClient.entities.ScheduledEvent.create(data);
            }
        },
        onSuccess: async (savedEvent) => {
            // Send notification if assigned
            if (formData.assigned_to_email && !event?.id) {
                try {
                    await httpClient.entities.Notification.create({
                        user_email: formData.assigned_to_email,
                        title: 'New Event Scheduled',
                        message: `You've been assigned: ${formData.title}`,
                        type: 'task_assigned',
                        link_page: 'Calendar',
                        read: false
                    });
                    
                    await httpClient.integrations.Core.SendEmail({
                        to: formData.assigned_to_email,
                        subject: `New Event Scheduled: ${formData.title}`,
                        body: `
                            <h2>You've been assigned to an event</h2>
                            <p><strong>Event:</strong> ${formData.title}</p>
                            <p><strong>Type:</strong> ${formData.event_type}</p>
                            <p><strong>Date:</strong> ${new Date(formData.start_date).toLocaleString()}</p>
                            ${formData.location ? `<p><strong>Location:</strong> ${formData.location}</p>` : ''}
                            ${formData.description ? `<p><strong>Description:</strong> ${formData.description}</p>` : ''}
                        `
                    });
                } catch (error) {
                    console.error('Failed to send notification:', error);
                }
            }
            
            toast.success(event?.id ? 'Event updated' : 'Event created');
            onSave();
        },
        onError: (error) => {
            toast.error('Failed to save event');
            console.error(error);
        }
    });
    
    const deleteMutation = useMutation({
        mutationFn: () => httpClient.entities.ScheduledEvent.update(event.id, { status: 'cancelled' }),
        onSuccess: () => {
            toast.success('Event cancelled');
            onSave();
        }
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };
    
    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{event?.id ? 'Edit Event' : 'Create Event'}</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Title *</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            placeholder="Event title"
                        />
                    </div>
                    
                    <div>
                        <Label>Type</Label>
                        <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="inspection">🔍 Inspection</SelectItem>
                                <SelectItem value="meeting">👥 Meeting</SelectItem>
                                <SelectItem value="follow_up">📞 Follow-up</SelectItem>
                                <SelectItem value="deadline">⏰ Deadline</SelectItem>
                                <SelectItem value="review">📋 Review</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Event details"
                            rows={3}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={formData.all_day}
                            onCheckedChange={(checked) => setFormData({ ...formData, all_day: checked })}
                        />
                        <Label>All day event</Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Start {formData.all_day ? 'Date' : 'Date & Time'} *</Label>
                            <Input
                                type={formData.all_day ? 'date' : 'datetime-local'}
                                value={formData.all_day ? formData.start_date.slice(0, 10) : formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label>End {formData.all_day ? 'Date' : 'Date & Time'}</Label>
                            <Input
                                type={formData.all_day ? 'date' : 'datetime-local'}
                                value={formData.all_day ? formData.end_date.slice(0, 10) : formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <Label>Location</Label>
                        <Input
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Event location"
                        />
                    </div>
                    
                    <div>
                        <Label>Assign To</Label>
                        <Select value={formData.assigned_to_email} onValueChange={(value) => setFormData({ ...formData, assigned_to_email: value })}>
                            <SelectTrigger>
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
                    
                    <DialogFooter className="gap-2">
                        {event?.id && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => deleteMutation.mutate()}
                                disabled={deleteMutation.isPending}
                            >
                                Cancel Event
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                        <Button
                            type="submit"
                            disabled={saveMutation.isPending}
                            className="bg-gradient-to-r from-[#1e90ff] to-[#0066cc]"
                        >
                            {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {event?.id ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}