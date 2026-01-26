import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Copy, Download, Search, Loader2 } from 'lucide-react';
import { httpClient } from '@/api/httpClient';
import { toast } from 'sonner';

export default function OCRProcessor({ imageUrl, onTextExtracted }) {
    const [extractedText, setExtractedText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const extractText = async () => {
        setIsProcessing(true);
        try {
            // Check cache first
            const cacheKey = `ocr_${imageUrl}`;
            const cached = localStorage.getItem(cacheKey);
            
            if (cached) {
                setExtractedText(cached);
                if (onTextExtracted) onTextExtracted(cached);
                toast.success('Text loaded from cache');
                setIsProcessing(false);
                return;
            }

            const result = await httpClient.integrations.Core.InvokeLLM({
                prompt: 'Extract all text from this image. Return only the text content, preserving formatting and structure. If there are tables, preserve them in a readable format.',
                file_urls: [imageUrl]
            });
            
            const text = typeof result === 'string' ? result : result.text || '';
            
            // Cache result
            try {
                localStorage.setItem(cacheKey, text);
            } catch (e) {
                // Cache full, ignore
            }
            
            setExtractedText(text);
            if (onTextExtracted) onTextExtracted(text);
            toast.success('Text extracted successfully');
        } catch (error) {
            toast.error('Failed to extract text');
            console.error('OCR Error:', error);
        }
        setIsProcessing(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(extractedText);
        toast.success('Text copied to clipboard');
    };

    const downloadAsText = () => {
        const blob = new Blob([extractedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `extracted_text_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Text file downloaded');
    };

    const highlightText = (text) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-300">$1</mark>');
    };

    return (
        <Card className="bg-[#0f1419] border-blue-900/20">
            <CardHeader>
                <CardTitle className="text-white">Extract Text (OCR)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!extractedText ? (
                    <Button
                        onClick={extractText}
                        disabled={isProcessing}
                        className="w-full h-12 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Extracting Text...
                            </>
                        ) : (
                            <>
                                <FileText className="w-5 h-5 mr-2" />
                                Extract Text from Image
                            </>
                        )}
                    </Button>
                ) : (
                    <>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search in text..."
                                    className="w-full pl-10 pr-4 py-2 bg-[#0a0e17] border border-blue-900/30 rounded-lg text-white placeholder-blue-400/50"
                                />
                            </div>
                        </div>

                        <div className="bg-[#0a0e17] border border-blue-900/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                            <div 
                                className="text-white whitespace-pre-wrap font-mono text-sm"
                                dangerouslySetInnerHTML={{ __html: highlightText(extractedText) }}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={copyToClipboard}
                                variant="outline"
                                className="flex-1 border-blue-900/30"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                            </Button>
                            <Button
                                onClick={downloadAsText}
                                variant="outline"
                                className="flex-1 border-blue-900/30"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                            <Button
                                onClick={extractText}
                                variant="outline"
                                className="flex-1 border-blue-900/30"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Re-scan
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}