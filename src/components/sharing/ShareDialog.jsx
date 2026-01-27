import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Link2, QrCode, Code, Check } from 'lucide-react';
import { toast } from 'sonner';
import QRCodeLib from 'qrcode';

export default function ShareDialog({ open, onOpenChange, item, type }) {
    const [copied, setCopied] = useState(false);
    const [qrCode, setQrCode] = useState('');
    
    const baseUrl = window.location.origin;
    const shareUrl = type === 'form' 
        ? `${baseUrl}/#/PublicForm?id=${item?.id}`
        : `${baseUrl}/#/PublicChecklist?id=${item?.id}`;
    
    const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`;
    
    useEffect(() => {
        if (open && shareUrl) {
            QRCodeLib.toDataURL(shareUrl, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#1E40AF',
                    light: '#FFFFFF'
                }
            }).then(setQrCode);
        }
    }, [open, shareUrl]);
    
    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(`${label} copied to clipboard`);
        setTimeout(() => setCopied(false), 2000);
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Share {type === 'form' ? 'Form' : 'Checklist'}</DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="link" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="link">
                            <Link2 className="w-4 h-4 mr-2" />
                            Link
                        </TabsTrigger>
                        <TabsTrigger value="qr">
                            <QrCode className="w-4 h-4 mr-2" />
                            QR Code
                        </TabsTrigger>
                        <TabsTrigger value="embed">
                            <Code className="w-4 h-4 mr-2" />
                            Embed
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="link" className="space-y-4">
                        <div>
                            <Label>Public Link</Label>
                            <p className="text-sm text-blue-300 mb-2">
                                Anyone with this link can fill out the {type}
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1"
                                />
                                <Button
                                    onClick={() => copyToClipboard(shareUrl, 'Link')}
                                    variant="outline"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">Sharing Options:</h4>
                            <ul className="space-y-1 text-sm text-blue-800">
                                <li>• Share via email or messaging</li>
                                <li>• Post on social media</li>
                                <li>• No login required to submit</li>
                                <li>• Responses tracked automatically</li>
                            </ul>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="qr" className="space-y-4">
                        <div className="text-center">
                            <Label>QR Code</Label>
                            <p className="text-sm text-blue-300 mb-4">
                                Scan with a mobile device to access the {type}
                            </p>
                            {qrCode && (
                                <div className="inline-block bg-[#0f1419] p-4 rounded-lg border-2 border-blue-900/30">
                                    <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                                </div>
                            )}
                            <div className="mt-4">
                                <Button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.download = `${type}-qrcode.png`;
                                        link.href = qrCode;
                                        link.click();
                                    }}
                                    variant="outline"
                                >
                                    Download QR Code
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="embed" className="space-y-4">
                        <div>
                            <Label>Embed Code</Label>
                            <p className="text-sm text-blue-300 mb-2">
                                Add this code to your website to embed the {type}
                            </p>
                            <div className="flex gap-2">
                                <Textarea
                                    value={embedCode}
                                    readOnly
                                    className="flex-1 font-mono text-sm"
                                    rows={3}
                                />
                                <Button
                                    onClick={() => copyToClipboard(embedCode, 'Embed code')}
                                    variant="outline"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                        
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h4 className="font-semibold text-purple-900 mb-2">Embed Features:</h4>
                            <ul className="space-y-1 text-sm text-purple-800">
                                <li>• Fully responsive iframe</li>
                                <li>• Matches your site design</li>
                                <li>• Secure and isolated</li>
                                <li>• Real-time submissions</li>
                            </ul>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

function Textarea({ className, ...props }) {
    return (
        <textarea
            className={`flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    );
}