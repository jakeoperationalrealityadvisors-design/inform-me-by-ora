import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Save, Crop, RotateCw, Contrast, Sun, Image as ImageIcon, Sliders, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import OCRProcessor from '@/components/scanner/OCRProcessor';

export default function DocumentEditor() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [imageUrl, setImageUrl] = useState('');
    const [imageId, setImageId] = useState('');
    const [originalImage, setOriginalImage] = useState(null);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [cropMode, setCropMode] = useState(false);
    const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 100, height: 100 });
    const [isSaving, setIsSaving] = useState(false);
    const [extractedText, setExtractedText] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const url = params.get('imageUrl');
        const id = params.get('imageId');
        if (url) {
            setImageUrl(decodeURIComponent(url));
            setImageId(id);
            loadImage(decodeURIComponent(url));
        }
    }, []);

    const loadImage = (url) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            setOriginalImage(img);
            drawImage(img);
        };
        img.src = url;
    };

    const drawImage = (img = originalImage) => {
        if (!img || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply transformations
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // Apply filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        ctx.drawImage(img, 0, 0);
        ctx.restore();
    };

    useEffect(() => {
        if (originalImage) {
            drawImage();
        }
    }, [brightness, contrast, rotation]);

    const handleRotate = () => {
        setRotation((rotation + 90) % 360);
    };

    const handleCrop = () => {
        setCropMode(!cropMode);
    };

    const applyCrop = () => {
        if (!originalImage || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Create temporary canvas for cropped image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = cropRect.width;
        tempCanvas.height = cropRect.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.drawImage(
            canvas,
            cropRect.x, cropRect.y, cropRect.width, cropRect.height,
            0, 0, cropRect.width, cropRect.height
        );
        
        // Update main canvas
        canvas.width = cropRect.width;
        canvas.height = cropRect.height;
        ctx.drawImage(tempCanvas, 0, 0);
        
        setCropMode(false);
        toast.success('Image cropped');
    };

    const handleSave = async () => {
        if (!canvasRef.current) return;

        setIsSaving(true);
        try {
            const canvas = canvasRef.current;
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
            const file = new File([blob], `edited_${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            
            await base44.entities.Document.create({
                title: `Edited Document ${new Date().toLocaleDateString()}`,
                file_url: file_url,
                file_name: file.name,
                file_type: 'image/jpeg',
                tags: ['edited', 'scanner'],
                status: 'active',
                description: extractedText ? `OCR Text: ${extractedText.substring(0, 500)}...` : undefined
            });
            
            toast.success('Document saved successfully');
            navigate(createPageUrl('Documents'));
        } catch (error) {
            toast.error('Failed to save document');
        }
        setIsSaving(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Scanner')}>
                                <Button variant="ghost" size="icon" className="rounded-full text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">Document Editor</h1>
                                <p className="text-sm text-blue-400">Adjust, crop & enhance</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Editor Controls */}
                    <Card className="bg-[#0f1419] border-blue-900/20 lg:col-span-1">
                        <CardContent className="pt-6 space-y-6">
                            <div>
                                <Label className="text-blue-100 mb-3 flex items-center gap-2">
                                    <Sun className="w-4 h-4" />
                                    Brightness
                                </Label>
                                <Slider
                                    value={[brightness]}
                                    onValueChange={([val]) => setBrightness(val)}
                                    min={0}
                                    max={200}
                                    step={1}
                                    className="mt-2"
                                />
                                <div className="text-center text-sm text-blue-400 mt-2">{brightness}%</div>
                            </div>

                            <div>
                                <Label className="text-blue-100 mb-3 flex items-center gap-2">
                                    <Contrast className="w-4 h-4" />
                                    Contrast
                                </Label>
                                <Slider
                                    value={[contrast]}
                                    onValueChange={([val]) => setContrast(val)}
                                    min={0}
                                    max={200}
                                    step={1}
                                    className="mt-2"
                                />
                                <div className="text-center text-sm text-blue-400 mt-2">{contrast}%</div>
                            </div>

                            <div className="space-y-2">
                                <Button
                                    onClick={handleRotate}
                                    variant="outline"
                                    className="w-full border-blue-900/30"
                                >
                                    <RotateCw className="w-4 h-4 mr-2" />
                                    Rotate 90°
                                </Button>
                                <Button
                                    onClick={handleCrop}
                                    variant={cropMode ? 'default' : 'outline'}
                                    className={cropMode ? 'w-full bg-[#FF8C00]' : 'w-full border-blue-900/30'}
                                >
                                    <Crop className="w-4 h-4 mr-2" />
                                    {cropMode ? 'Apply Crop' : 'Crop'}
                                </Button>
                                {cropMode && (
                                    <Button
                                        onClick={applyCrop}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        Apply Crop
                                    </Button>
                                )}
                            </div>

                            <div className="pt-4 border-t border-blue-900/20">
                                <Button
                                    onClick={() => {
                                        setBrightness(100);
                                        setContrast(100);
                                        setRotation(0);
                                    }}
                                    variant="outline"
                                    className="w-full border-red-900/30 text-red-400"
                                >
                                    Reset All
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Canvas Preview */}
                    <div className="lg:col-span-3 space-y-4">
                        <Card className="bg-[#0f1419] border-blue-900/20">
                            <CardContent className="p-6">
                                <div className="bg-[#0a0e17] rounded-lg p-4 flex items-center justify-center min-h-[500px]">
                                    <canvas
                                        ref={canvasRef}
                                        className="max-w-full h-auto rounded-lg shadow-2xl"
                                        style={{
                                            border: cropMode ? '2px dashed #FF8C00' : 'none'
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* OCR Section */}
                        {imageUrl && (
                            <OCRProcessor 
                                imageUrl={imageUrl} 
                                onTextExtracted={setExtractedText}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}