import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { StudentAnswers, Message } from '../types.ts';

interface AIScanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanComplete: (data: StudentAnswers) => void;
    numberOfQuestions: number;
    showMessage: (text: string, type: Message['type']) => void;
}

const AIScanModal: React.FC<AIScanModalProps> = ({ isOpen, onClose, onScanComplete, numberOfQuestions, showMessage }) => {
    const [mode, setMode] = useState<'choice' | 'camera' | 'preview'>('choice');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [scannedData, setScannedData] = useState<StudentAnswers | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const startCamera = useCallback(async () => {
        if (stream) return;
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            setError("Kamera tidak dapat diakses. Pastikan Anda telah memberikan izin.");
            setMode('choice');
            stopCamera();
        }
    }, [stream, stopCamera]);
    
    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setCapturedImage(null);
            setScannedData(null);
            setError(null);
            setIsLoading(false);
            setMode('choice');
        }

        return () => {
            stopCamera();
        };
    }, [isOpen, stopCamera]);

    const processImageWithAI = async (base64Image: string) => {
        setIsLoading(true);
        setError(null);
        setScannedData(null);

        if (!process.env.API_KEY) {
            setError("API Key for Gemini not configured.");
            setIsLoading(false);
            return;
        }
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const imagePart = {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Image,
                },
            };

            const textPart = {
                 text: `Anda adalah sistem OCR ahli untuk lembar jawaban ujian. Analisis gambar lembar jawaban siswa ini. Ekstrak nama siswa dan jawaban mereka untuk ${numberOfQuestions} soal pilihan ganda. Kembalikan hasilnya sebagai objek JSON tunggal yang valid. Jika nama tidak ditemukan, kembalikan string kosong. Jika jawaban tidak jelas atau kosong, kembalikan string kosong untuk jawaban tersebut dalam array. Jangan sertakan teks apa pun di luar objek JSON.`
            };
            
            const responseSchema = {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: "Nama lengkap siswa seperti yang tertulis di lembar.",
                },
                answers: {
                  type: Type.ARRAY,
                  description: `Sebuah array string yang berisi jawaban untuk setiap soal. Harus ada tepat ${numberOfQuestions} item.`,
                  items: {
                    type: Type.STRING,
                  },
                },
              },
              required: ['name', 'answers'],
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [textPart, imagePart] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                },
            });
            
            const jsonString = response.text;
            const result = JSON.parse(jsonString);

            if (!result.name || !Array.isArray(result.answers)) {
                throw new Error("Format respons AI tidak valid.");
            }
            
            while (result.answers.length < numberOfQuestions) {
                result.answers.push('');
            }
            result.answers = result.answers.slice(0, numberOfQuestions);

            setScannedData(result);

        } catch (err) {
            console.error("AI processing error:", err);
            setError("Gagal menganalisis gambar. Coba lagi dengan gambar yang lebih jelas.");
            showMessage("Analisis AI gagal. Pastikan API Key valid dan gambar tidak buram.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        stopCamera();
        setMode('preview');
        processImageWithAI(imageDataUrl.split(',')[1]);
    };

     const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setCapturedImage(result);
            stopCamera();
            setMode('preview');
            processImageWithAI(result.split(',')[1]);
        };
        reader.onerror = () => {
            setError("Gagal membaca file gambar.");
            setMode('choice');
        };
        reader.readAsDataURL(file);

        if (event.target) {
            event.target.value = "";
        }
    };
    
    const handleRetry = () => {
        setCapturedImage(null);
        setScannedData(null);
        setError(null);
        setMode('choice');
    };
    
    const handleConfirm = () => {
        if (scannedData) {
            onScanComplete(scannedData);
            onClose();
        }
    };
    
    if (!isOpen) return null;

    const renderContent = () => {
        if (error) {
            return (
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button onClick={handleRetry} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Coba Lagi</button>
                </div>
            );
        }

        if (mode === 'preview') {
            return (
                <div>
                    <img src={capturedImage!} alt="Captured" className="w-full h-auto rounded-md" />
                     <div className="mt-4 text-sm">
                        {isLoading && (
                             <div className="flex items-center justify-center text-blue-600">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Menganalisis gambar dengan AI...
                            </div>
                        )}
                        {scannedData && (
                            <div className="bg-gray-100 p-3 rounded-md">
                                <h4 className="font-bold mb-2">Hasil Pindaian:</h4>
                                <p><strong>Nama:</strong> {scannedData.name || '(Tidak terdeteksi)'}</p>
                                <p><strong>Jawaban:</strong> {scannedData.answers.map(a => a || '-').join(', ')}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between mt-4">
                        <button onClick={handleRetry} disabled={isLoading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50">Ambil Ulang</button>
                        <button onClick={handleConfirm} disabled={isLoading || !scannedData} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Konfirmasi & Tambah</button>
                    </div>
                </div>
            );
        }

        if (mode === 'camera') {
            return (
                <div>
                    <div className="relative w-full bg-gray-200 rounded-md overflow-hidden">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
                        <div className="absolute top-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded-md text-xs">Arahkan kamera ke LJK</div>
                    </div>
                    <button onClick={handleCapture} className="w-full mt-4 px-4 py-3 bg-blue-600 text-white font-bold rounded-md">Ambil Gambar</button>
                </div>
            );
        }

        // Default mode is 'choice'
        return (
            <div className="text-center space-y-4">
                <p className="text-gray-600">Pilih metode untuk memasukkan lembar jawaban:</p>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept="image/*" 
                />
                <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition"
                >
                    Unggah Gambar
                </button>
                <button 
                    onClick={() => {
                        setMode('camera');
                        startCamera();
                    }}
                    className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition"
                >
                    Gunakan Kamera
                </button>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Pindai Lembar Jawaban (AI)</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <canvas ref={canvasRef} className="hidden"></canvas>
                {renderContent()}
            </div>
        </div>
    );
};

export default AIScanModal;