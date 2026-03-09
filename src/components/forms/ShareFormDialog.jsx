import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, QrCode, Mail } from 'lucide-react';
import { toast } from 'sonner';
import QRCodeLib from 'qrcode';

export default function ShareFormDialog({ open, onOpenChange, formId, formTitle, type = 'form' }) {
    const [copied, setCopied] = useState(false);
    const [qrCode, setQrCode] = useState('');
    
    const shareUrl = `${window.location.origin}/#/PublicSubmission?type=${type}&id=${formId}`;
    
    useEffect(() => {
        if (open && formId) {
            QRCodeLib.toDataURL(shareUrl, { width: 300 })
                .then(url => setQrCode(url))
                .catch(err => console.error(err));
        }
    }, [open, formId, shareUrl]);
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };
    
    const downloadQR = () => {
        const link = document.createElement('a');
        link.download = `${formTitle}-qr.png`;
        link.href = qrCode;
        link.click();
        toast.success('QR code downloaded');
    };
    
    const shareViaEmail = () => {
        const subject = encodeURIComponent(`Fill out: ${formTitle}`);
        const body = encodeURIComponent(`Please fill out this ${type}:\n\n${shareUrl}`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0f1419] border-blue-900/30 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">Share {type === 'form' ? 'Form' : 'Checklist'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label className="text-blue-300">Public Link</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                value={shareUrl}
                                readOnly
                                className="bg-[#0a0e17] border-blue-900/30 text-white flex-1"
                            />
                            <Button
                                onClick={copyToClipboard}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                    
                    {qrCode && (
                        <div className="text-center space-y-2">
                            <Label className="text-blue-300">QR Code</Label>
                            <div className="bg-white p-4 rounded-lg inline-block">
                                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                            </div>
                            <Button
                                onClick={downloadQR}
                                variant="outline"
                                className="w-full border-blue-900/30 text-blue-300"
                            >
                                <QrCode className="w-4 h-4 mr-2" />
                                Download QR Code
                            </Button>
                        </div>
                    )}
                    
                    <Button
                        onClick={shareViaEmail}
                        variant="outline"
                        className="w-full border-blue-900/30 text-blue-300"
                    >
                        <Mail className="w-4 h-4 mr-2" />
                        Share via Email
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}