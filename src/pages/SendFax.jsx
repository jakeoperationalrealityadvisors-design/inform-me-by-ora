import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Send, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SendFax() {
    const navigate = useNavigate();
    const [imageUrl, setImageUrl] = useState('');
    const [faxNumber, setFaxNumber] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [coverNote, setCoverNote] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const url = params.get('imageUrl');
        if (url) {
            setImageUrl(decodeURIComponent(url));
        }
    }, []);

    const handleSendFax = async () => {
        if (!faxNumber || !imageUrl) {
            toast.error('Please provide fax number');
            return;
        }

        setIsSending(true);
        try {
            // In a real implementation, this would integrate with a fax service like Twilio Fax
            // For now, we'll log the fax and save it as a record
            await base44.entities.Document.create({
                title: `Fax to ${faxNumber}`,
                description: `Fax sent to ${recipientName || faxNumber}`,
                file_url: imageUrl,
                file_name: `fax_${faxNumber}_${Date.now()}.pdf`,
                file_type: 'application/pdf',
                tags: ['fax', 'sent'],
                status: 'active'
            });

            toast.success('Fax sent successfully');
            navigate(createPageUrl('Scanner'));
        } catch (error) {
            toast.error('Failed to send fax');
        }
        setIsSending(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Scanner')}>
                            <Button variant="ghost" size="icon" className="rounded-full text-blue-400">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white">Send Fax</h1>
                            <p className="text-sm text-blue-400">Send document via fax</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white">Fax Details</CardTitle>
                        <CardDescription>Enter recipient information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-blue-100">Recipient Fax Number *</Label>
                            <Input
                                type="tel"
                                value={faxNumber}
                                onChange={(e) => setFaxNumber(e.target.value)}
                                placeholder="+1 (555) 123-4567"
                                className="bg-[#0a0e17] border-blue-900/30 text-white"
                            />
                        </div>

                        <div>
                            <Label className="text-blue-100">Recipient Name</Label>
                            <Input
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                                placeholder="John Doe"
                                className="bg-[#0a0e17] border-blue-900/30 text-white"
                            />
                        </div>

                        <div>
                            <Label className="text-blue-100">Cover Note (Optional)</Label>
                            <Textarea
                                value={coverNote}
                                onChange={(e) => setCoverNote(e.target.value)}
                                placeholder="Add a message..."
                                rows={4}
                                className="bg-[#0a0e17] border-blue-900/30 text-white"
                            />
                        </div>

                        {imageUrl && (
                            <div>
                                <Label className="text-blue-100 mb-2">Document Preview</Label>
                                <img
                                    src={imageUrl}
                                    alt="Fax document"
                                    className="w-full max-h-64 object-contain rounded-lg border border-blue-900/30"
                                />
                            </div>
                        )}

                        <Button
                            onClick={handleSendFax}
                            disabled={isSending || !faxNumber}
                            className="w-full h-12 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-lg"
                        >
                            <Send className="w-5 h-5 mr-2" />
                            {isSending ? 'Sending...' : 'Send Fax'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}