import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Send, FileText, Users, Check, Calendar, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function PushForm() {
  const navigate = useNavigate();
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [message, setMessage] = useState('');
  const [pushing, setPushing] = useState(false);
  const [done, setDone] = useState(false);

  const { data: forms = [] } = useQuery({
    queryKey: ['form-templates-push'],
    queryFn: () => base44.entities.FormTemplate.filter({ status: 'active' })
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-push'],
    queryFn: () => base44.entities.User.list()
  });

  const toggleUser = (email) => {
    setSelectedUsers(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.email));
    }
  };

  const handlePush = async () => {
    if (!selectedForm) return toast.error('Please select a form');
    if (selectedUsers.length === 0) return toast.error('Please select at least one user');

    setPushing(true);
    try {
      const tasks = selectedUsers.map(email => {
        const user = users.find(u => u.email === email);
        return {
          title: `Complete Form: ${selectedForm.title}`,
          description: message || `You have been assigned a form to complete: "${selectedForm.title}"`,
          assigned_to_email: email,
          assigned_to_name: user?.full_name || email,
          priority,
          due_date: dueDate || undefined,
          status: 'todo',
          related_form_id: selectedForm.id,
          tags: ['form-assigned']
        };
      });

      await base44.entities.Task.bulkCreate(tasks);

      // Send notifications
      await Promise.allSettled(
        selectedUsers.map(email =>
          base44.entities.Notification.create({
            user_email: email,
            title: 'New Form Assigned',
            message: `You have been assigned to complete: "${selectedForm.title}"`,
            type: 'form_assigned',
            action_url: '/FillForm?id=' + selectedForm.id,
            read: false
          })
        )
      );

      setDone(true);
      toast.success(`Form pushed to ${selectedUsers.length} user(s)`);
    } catch (e) {
      toast.error('Failed to push form: ' + e.message);
    }
    setPushing(false);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">Form Pushed!</h2>
            <p className="text-muted-foreground">
              <strong>{selectedForm.title}</strong> has been assigned to{' '}
              <strong>{selectedUsers.length}</strong> user(s). They will see it in their tasks.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" onClick={() => { setDone(false); setSelectedForm(null); setSelectedUsers([]); }}>
                Push Another
              </Button>
              <Button onClick={() => navigate('/MyTasks')}>View Tasks</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/Settings">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Send className="w-6 h-6 text-orange-500" /> Push Form to Users
          </h1>
          <p className="text-muted-foreground text-sm">Select a form and assign it to users as a task</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Step 1: Select Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" /> Step 1: Select Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-72 overflow-y-auto">
            {forms.length === 0 && (
              <p className="text-sm text-muted-foreground">No active forms found.</p>
            )}
            {forms.map(form => (
              <div
                key={form.id}
                onClick={() => setSelectedForm(form)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedForm?.id === form.id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                    : 'border-border hover:border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{form.title}</span>
                  {selectedForm?.id === form.id && <Check className="w-4 h-4 text-orange-500" />}
                </div>
                {form.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{form.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{form.fields?.length || 0} fields</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Step 2: Select Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" /> Step 2: Select Users
              <Badge variant="secondary" className="ml-auto">{selectedUsers.length} selected</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div
              className="flex items-center gap-2 pb-2 border-b cursor-pointer"
              onClick={toggleAllUsers}
            >
              <Checkbox checked={selectedUsers.length === users.length && users.length > 0} />
              <span className="text-sm font-medium">Select All ({users.length})</span>
            </div>
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {users.map(user => (
                <div
                  key={user.email}
                  onClick={() => toggleUser(user.email)}
                  className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-muted"
                >
                  <Checkbox checked={selectedUsers.includes(user.email)} />
                  <div>
                    <p className="text-sm font-medium">{user.full_name || user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto text-xs">{user.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step 3: Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Step 3: Options (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Priority</Label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Custom Message</Label>
            <Input
              placeholder="Optional note for assignees..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary & Send */}
      <Card className="border-orange-200 dark:border-orange-900">
        <CardContent className="pt-4 pb-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            {selectedForm && selectedUsers.length > 0 ? (
              <span>
                Ready to push <strong className="text-foreground">{selectedForm.title}</strong> to{' '}
                <strong className="text-foreground">{selectedUsers.length}</strong> user(s)
              </span>
            ) : (
              <span>Select a form and at least one user to continue</span>
            )}
          </div>
          <Button
            onClick={handlePush}
            disabled={!selectedForm || selectedUsers.length === 0 || pushing}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
          >
            <Send className="w-4 h-4" />
            {pushing ? 'Pushing...' : `Push Form to ${selectedUsers.length} User(s)`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}