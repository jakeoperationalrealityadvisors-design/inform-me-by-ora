import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Camera, Upload, FileText, Image, Scan, Copy, Send, Cloud, HardDrive, Edit3, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useSimpleMode } from '@/components/tutorial/SimpleModeWrapper';

export default function Scanner() {
    const navigate = useNavigate();
    const { isSeniorMode, isSimpleMode } = useSimpleMode();
    const [activeMode, setActiveMode] = useState('scan');
    const [capturedImages, setCapturedImages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsProcessing(true);
        const newImages = [];

        for (const file of files) {
            try {
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                newImages.push({
                    id: Date.now() + Math.random(),
                    url: file_url,
                    name: file.name,
                    type: file.type,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                toast.error(`Failed to upload ${file.name}`);
            }
        }

        setCapturedImages([...capturedImages, ...newImages]);
        setIsProcessing(false);
        toast.success(`${newImages.length} document(s) captured`);
    };

    const handleCameraCapture = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            const newImage = {
                id: Date.now(),
                url: file_url,
                name: `Photo_${new Date().toLocaleDateString()}`,
                type: file.type,
                timestamp: new Date().toISOString()
            };
            setCapturedImages([...capturedImages, newImage]);
            toast.success('Photo captured');
        } catch (error) {
            toast.error('Failed to capture photo');
        }
        setIsProcessing(false);
    };

    const editDocument = (image) => {
        navigate(createPageUrl('DocumentEditor') + `?imageUrl=${encodeURIComponent(image.url)}&imageId=${image.id}`);
    };

    const saveToStorage = async (image, storageType) => {
        try {
            await base44.entities.Document.create({
                title: image.name,
                file_url: image.url,
                file_name: image.name,
                file_type: image.type,
                tags: [activeMode, storageType],
                status: 'active'
            });
            toast.success(`Saved to ${storageType === 'cloud' ? 'Cloud' : 'Internal'} Storage`);
        } catch (error) {
            toast.error('Failed to save document');
        }
    };

    const sendFax = (image) => {
        navigate(createPageUrl('SendFax') + `?imageUrl=${encodeURIComponent(image.url)}`);
    };

    const modes = [
        { id: 'scan', label: 'Scanner', icon: Scan, desc: 'Scan documents' },
        { id: 'copy', label: 'Copier', icon: Copy, desc: 'Make copies' },
        { id: 'photo', label: 'Photo', icon: Camera, desc: 'Take photos' },
        { id: 'fax', label: 'Fax', icon: Send, desc: 'Send fax' }
    ];

    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="icon" className="rounded-full text-blue-400">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className={`font-bold text-white ${isSeniorMode ? 'text-2xl' : 'text-xl'}`}>
                                Document Scanner
                            </h1>
                            <p className="text-sm text-blue-400">Scan, copy, edit & share documents</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Mode Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {modes.map((mode) => {
                        const Icon = mode.icon;
                        return (
                            <button
                                key={mode.id}
                                onClick={() => setActiveMode(mode.id)}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    activeMode === mode.id
                                        ? 'border-[#FF8C00] bg-gradient-to-br from-orange-950/30 to-blue-950/30'
                                        : 'border-blue-900/20 bg-[#0f1419] hover:border-blue-700/30'
                                }`}
                            >
                                <Icon className={`w-8 h-8 mx-auto mb-2 ${
                                    activeMode === mode.id ? 'text-[#FF8C00]' : 'text-blue-400'
                                }`} />
                                <div className={`font-semibold text-white ${isSeniorMode ? 'text-lg' : 'text-sm'}`}>
                                    {mode.label}
                                </div>
                                {!isSimpleMode && (
                                    <div className="text-xs text-blue-400 mt-1">{mode.desc}</div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Capture Controls */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button
                                onClick={() => cameraInputRef.current?.click()}
                                className={`bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] ${
                                    isSeniorMode ? 'h-20 text-xl' : isSimpleMode ? 'h-16 text-lg' : 'h-12'
                                }`}
                                disabled={isProcessing}
                            >
                                <Camera className={`${isSeniorMode ? 'w-8 h-8' : 'w-5 h-5'} mr-2`} />
                                {isSeniorMode ? 'Take Photo' : isSimpleMode ? 'Use Camera' : 'Camera'}
                            </Button>
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline"
                                className={`border-blue-900/30 text-blue-300 ${
                                    isSeniorMode ? 'h-20 text-xl' : isSimpleMode ? 'h-16 text-lg' : 'h-12'
                                }`}
                                disabled={isProcessing}
                            >
                                <Upload className={`${isSeniorMode ? 'w-8 h-8' : 'w-5 h-5'} mr-2`} />
                                {isSeniorMode ? 'Choose File' : isSimpleMode ? 'Upload File' : 'Upload'}
                            </Button>
                        </div>
                        
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleCameraCapture}
                            className="hidden"
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,application/pdf"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </CardContent>
                </Card>

                {/* Captured Documents */}
                {capturedImages.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className={`font-bold text-white ${isSeniorMode ? 'text-xl' : 'text-lg'}`}>
                                Captured Documents ({capturedImages.length})
                            </h2>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search documents by name..."
                                className="w-full pl-10 pr-4 py-3 bg-[#0f1419] border border-blue-900/30 rounded-lg text-white placeholder-blue-400/50"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {capturedImages
                                .filter(img => !searchQuery || img.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((image) => (
                                <Card key={image.id} className="bg-[#0f1419] border-blue-900/20">
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white mb-1">{image.name}</h3>
                                                <p className="text-xs text-blue-400 mb-3">
                                                    {new Date(image.timestamp).toLocaleString()}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => editDocument(image)}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <Edit3 className="w-4 h-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => saveToStorage(image, 'cloud')}
                                                        className="border-blue-900/30"
                                                    >
                                                        <Cloud className="w-4 h-4 mr-1" />
                                                        Cloud
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => saveToStorage(image, 'internal')}
                                                        className="border-blue-900/30"
                                                    >
                                                        <HardDrive className="w-4 h-4 mr-1" />
                                                        Save
                                                    </Button>
                                                    {activeMode === 'fax' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => sendFax(image)}
                                                            className="border-green-900/30 text-green-400"
                                                        >
                                                            <Send className="w-4 h-4 mr-1" />
                                                            Fax
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}