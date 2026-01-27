import React, { useState, useRef } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCw, Check, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function MobileCamera({ onCapture, trigger }) {
    const [open, setOpen] = useState(false);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            toast.error('Camera access denied');
            console.error('Camera error:', error);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (video && canvas) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);
            
            canvas.toBlob((blob) => {
                const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
                setCapturedImage({ url: canvas.toDataURL('image/jpeg'), file });
            }, 'image/jpeg', 0.9);
        }
    };

    const switchCamera = async () => {
        stopCamera();
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
        setTimeout(() => startCamera(), 100);
    };

    const handleConfirm = () => {
        if (capturedImage) {
            onCapture(capturedImage.file);
            handleClose();
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
    };

    const handleClose = () => {
        stopCamera();
        setCapturedImage(null);
        setOpen(false);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            onCapture(file);
            handleClose();
        }
    };

    React.useEffect(() => {
        if (open && !capturedImage) {
            startCamera();
        }
        return () => stopCamera();
    }, [open, facingMode]);

    return (
        <Dialog open={open} onOpenChange={(o) => {
            setOpen(o);
            if (!o) handleClose();
        }}>
            {trigger ? (
                <div onClick={() => setOpen(true)}>{trigger}</div>
            ) : (
                <Button onClick={() => setOpen(true)} className="gap-2">
                    <Camera className="w-4 h-4" />
                    Take Photo
                </Button>
            )}
            
            <DialogContent className="max-w-full h-full m-0 p-0 max-h-screen">
                <div className="relative w-full h-full bg-black flex flex-col">
                    {!capturedImage ? (
                        <>
                            {/* Camera View */}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <canvas ref={canvasRef} className="hidden" />
                            
                            {/* Camera Controls */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center justify-between max-w-md mx-auto">
                                    <label className="w-14 h-14 rounded-full bg-blue-950/40 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-blue-900/40 transition-colors">
                                        <ImageIcon className="w-6 h-6 text-white" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />
                                    </label>
                                    
                                    <button
                                        onClick={capturePhoto}
                                        className="w-20 h-20 rounded-full bg-[#0f1419] border-4 border-blue-300/40 hover:scale-105 transition-transform"
                                    />
                                    
                                    <button
                                        onClick={switchCamera}
                                        className="w-14 h-14 rounded-full bg-blue-950/40 backdrop-blur flex items-center justify-center hover:bg-blue-900/40 transition-colors"
                                    >
                                        <RotateCw className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Preview */}
                            <img
                                src={capturedImage.url}
                                alt="Captured"
                                className="w-full h-full object-contain"
                            />
                            
                            {/* Preview Controls */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
                                    <Button
                                        onClick={handleRetake}
                                        variant="outline"
                                        size="lg"
                                        className="flex-1 bg-blue-950/40 backdrop-blur border-blue-800/40 text-white hover:bg-blue-950/40"
                                    >
                                        <X className="w-5 h-5 mr-2" />
                                        Retake
                                    </Button>
                                    <Button
                                        onClick={handleConfirm}
                                        size="lg"
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Check className="w-5 h-5 mr-2" />
                                        Use Photo
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}