import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EmailVerificationBanner({ user }) {
    const [dismissed, setDismissed] = useState(false);

    const resendMutation = useMutation({
        mutationFn: () => base44.functions.invoke('sendVerificationEmail'),
        onSuccess: () => {
            toast.success('Verification email sent! Check your inbox.');
        },
        onError: (error) => {
            toast.error('Failed to send email: ' + error.message);
        }
    });

    if (!user || user.email_verified || dismissed) {
        return null;
    }

    return (
        <div className="bg-yellow-950/50 border-b border-yellow-900/50 px-4 py-3">
            <div className="max-w-5xl mx-auto flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div className="flex-1 text-sm text-yellow-200">
                    <strong>Please verify your email address.</strong> Check your inbox for the verification link.
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => resendMutation.mutate()}
                    disabled={resendMutation.isPending}
                    className="text-yellow-300 hover:text-yellow-100 hover:bg-yellow-900/30"
                >
                    <Mail className="w-4 h-4 mr-1" />
                    {resendMutation.isPending ? 'Sending...' : 'Resend'}
                </Button>
                <button
                    onClick={() => setDismissed(true)}
                    className="text-yellow-400 hover:text-yellow-100"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}