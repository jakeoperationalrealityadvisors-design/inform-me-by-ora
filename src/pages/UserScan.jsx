import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Upload, X, Send, CheckCircle, FileText, Receipt, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TYPES = [
    { id: 'receipt', label: 'Receipt', icon: Receipt },
    { id: 'document', label: 'Document', icon: FileText },
    { id: 'issue', label: 'Issue', icon: AlertTriangle },
    { id: 'other', label: 'Other', icon: MoreHorizontal },
];

export default function UserScan() {
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [type, setType] = useState('document');
    const [notes, setNotes] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const fileRef = useRef(null);
    const cameraRef = useRef(null);

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        const reader = new FileReader();
        reader.onload = ev => setPreview(ev.target.result);
        reader.readAsDataURL(f);
        setSent(false);
    };

    const send = async () => {
        if (!file) return;
        setSending(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const user = await base44.auth.me();
        await base44.entities.Document.create({
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${new Date().toLocaleDateString()}`,
            description: notes,
            file_url,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            uploaded_by_name: user?.full_name || user?.email || 'Field User',
            tags: [type, 'field-upload'],
        });
        setSent(true);
        setSending(false);
        setPreview(null);
        setFile(null);
        setNotes('');
    };

    if (sent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-white text-xl font-bold">Sent to Admin!</h2>
                <p className="text-slate-400 text-sm text-center max-w-xs">Your {type} has been uploaded and is visible to your admin.</p>
                <Button onClick={() => setSent(false)} className="bg-orange-500 hover:bg-orange-600 text-white mt-2">Send Another</Button>
            </div>
        );
    }

    return (
        <div className="space-y-5 max-w-md mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-white">Scan & Send</h1>
                <p className="text-slate-400 text-sm mt-1">Upload a photo or file to send to admin</p>
            </div>

            {/* Type selector */}
            <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Type</p>
                <div className="grid grid-cols-4 gap-2">
                    {TYPES.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setType(id)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${type === id ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Upload area */}
            {!preview ? (
                <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Capture</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => cameraRef.current?.click()}
                            className="flex flex-col items-center gap-3 p-6 bg-slate-800 border-2 border-dashed border-slate-600 hover:border-orange-500/50 rounded-xl transition-colors group">
                            <Camera className="w-8 h-8 text-slate-500 group-hover:text-orange-400 transition-colors" />
                            <span className="text-slate-400 text-sm group-hover:text-white transition-colors">Take Photo</span>
                            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
                        </button>
                        <button onClick={() => fileRef.current?.click()}
                            className="flex flex-col items-center gap-3 p-6 bg-slate-800 border-2 border-dashed border-slate-600 hover:border-blue-500/50 rounded-xl transition-colors group">
                            <Upload className="w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors" />
                            <span className="text-slate-400 text-sm group-hover:text-white transition-colors">Choose File</span>
                            <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Preview</p>
                        <button onClick={() => { setPreview(null); setFile(null); }} className="text-slate-500 hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                        {file?.type?.startsWith('image/') ? (
                            <img src={preview} alt="preview" className="w-full max-h-64 object-contain bg-slate-900" />
                        ) : (
                            <div className="flex items-center gap-3 p-4">
                                <FileText className="w-10 h-10 text-blue-400" />
                                <div>
                                    <p className="text-white text-sm font-medium">{file?.name}</p>
                                    <p className="text-slate-400 text-xs">{(file?.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Notes */}
            {preview && (
                <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Notes (optional)</p>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add context or description..." className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-orange-500" />
                </div>
            )}

            {/* Send button */}
            {preview && (
                <Button onClick={send} disabled={sending} className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2 py-3 text-base">
                    <Send className="w-5 h-5" />
                    {sending ? 'Sending...' : 'Send to Admin'}
                </Button>
            )}
        </div>
    );
}