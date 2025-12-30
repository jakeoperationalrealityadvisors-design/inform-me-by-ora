import React, { useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DynamicField({ field, value, onChange }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        onChange(file_url);
        setUploading(false);
    };
    
    const renderField = () => {
        switch (field.type) {
            case 'text':
                return (
                    <Input
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder || ''}
                        className="bg-black/30 border-blue-900/30 focus:bg-black/50 text-white placeholder:text-blue-400/50"
                    />
                );
                
            case 'textarea':
                return (
                    <Textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder || ''}
                        className="bg-black/30 border-blue-900/30 focus:bg-black/50 text-white placeholder:text-blue-400/50 min-h-[100px]"
                    />
                );
                
            case 'number':
                return (
                    <Input
                        type="number"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder || ''}
                        className="bg-black/30 border-blue-900/30 focus:bg-black/50 text-white placeholder:text-blue-400/50"
                    />
                );
                
            case 'date':
                return (
                    <Input
                        type="date"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="bg-black/30 border-blue-900/30 focus:bg-black/50 text-white"
                    />
                );
                
            case 'select':
                return (
                    <Select value={value || ''} onValueChange={onChange}>
                        <SelectTrigger className="bg-black/30 border-blue-900/30 text-white">
                            <SelectValue placeholder={field.placeholder || 'Select...'} />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f1419] border-blue-900/30 text-white">
                            {field.options?.map(opt => (
                                <SelectItem key={opt} value={opt} className="hover:bg-blue-950/50">{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
                
            case 'checkbox':
                return (
                    <div className="flex items-center gap-3">
                        <Checkbox
                            checked={value || false}
                            onCheckedChange={onChange}
                            className="w-5 h-5 border-blue-600"
                        />
                        <span className="text-blue-200">Yes</span>
                    </div>
                );
                
            case 'photo':
                return (
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        {value ? (
                            <div className="relative">
                                <img src={value} alt="Uploaded" className="w-full max-w-xs rounded-xl" />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full"
                                    onClick={() => onChange(null)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="w-full h-24 border-dashed border-2 border-blue-800/50 bg-black/20 hover:bg-black/30"
                            >
                                {uploading ? (
                                    <span className="text-blue-400">Uploading...</span>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Camera className="w-6 h-6 text-blue-500" />
                                        <span className="text-blue-300">Take or upload photo</span>
                                    </div>
                                )}
                            </Button>
                        )}
                    </div>
                );
                
            case 'signature':
                return (
                    <div className="border-2 border-dashed border-blue-800/50 rounded-xl p-4 text-center bg-black/20">
                        <Input
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Type your name as signature"
                            className="text-center italic bg-transparent border-0 text-lg text-white placeholder:text-blue-400/50"
                        />
                        <p className="text-xs text-blue-400/70 mt-2">Your typed name will serve as your signature</p>
                    </div>
                );
                
            default:
                return (
                    <Input
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="bg-black/30 border-blue-900/30 focus:bg-black/50 text-white placeholder:text-blue-400/50"
                    />
                );
        }
    };
    
    return (
        <div className="space-y-2">
            <Label className="text-blue-100 font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderField()}
        </div>
    );
}