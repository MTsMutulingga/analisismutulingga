import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.tsx';
import InputSection from './components/InputSection.tsx';
import OutputSection from './components/OutputSection.tsx';
import MessageBox from './components/MessageBox.tsx';
import Footer from './components/Footer.tsx';
import { performAnalysisLogic } from './services/analysisService.ts';
import type { AnalysisInput, Message, AnalysisResult } from './types.ts';
import { DEFAULT_INPUTS } from './constants.ts';

const LOCAL_STORAGE_KEY = 'mutulinggaAnalysisInputs';

const App: React.FC = () => {
    const [inputs, setInputs] = useState<AnalysisInput>(DEFAULT_INPUTS);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [message, setMessage] = useState<Message | null>(null);

    const showMessage = useCallback((text: string, type: 'error' | 'info') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 5000);
    }, []);

    useEffect(() => {
        // Load saved identity from localStorage on initial load
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Merge saved data with defaults to ensure all keys are present
                setInputs(prev => ({ ...prev, ...parsedData }));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            showMessage("Gagal memuat data tersimpan.", "error");
        }

        const today = new Date().toISOString().split('T')[0];
        setInputs(prev => ({ 
            ...prev, 
            assessmentDate: prev.assessmentDate || today, 
            analysisDate: prev.analysisDate || today 
        }));
    }, [showMessage]);

    const handleAnalysis = useCallback(() => {
        try {
            if (inputs.questions.some(q => !q.key.trim())) {
                throw new Error("Pastikan semua kunci jawaban telah diisi.");
            }
            if (inputs.questions.length === 0) {
                 throw new Error("Tambahkan setidaknya satu butir soal untuk dianalisis.");
            }
             // Validate KKTP
            if (isNaN(inputs.kktp) || inputs.kktp < 0 || inputs.kktp > 100) {
                 throw new Error("KKTP harus berupa angka antara 0 dan 100.");
            }

            // Validate question scores
            if (inputs.questions.some(q => isNaN(q.score) || q.score <= 0)) {
                throw new Error("Skor setiap soal harus berupa angka positif (lebih besar dari 0).");
            }
            
            const result = performAnalysisLogic(inputs);
            setAnalysisResult(result);
            if (result.students.length > 0) {
              setTimeout(() => {
                const outputSection = document.getElementById('output-section');
                if (outputSection) {
                    outputSection.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }
        } catch (error) {
            if (error instanceof Error) {
                showMessage(error.message, 'error');
            } else {
                showMessage('An unknown error occurred.', 'error');
            }
            setAnalysisResult(null);
        }
    }, [inputs, showMessage]);
    
    const handleSaveIdentity = useCallback(() => {
        try {
            const identityData = {
                guruMapel: inputs.guruMapel,
                nipGuru: inputs.nipGuru,
                mataPelajaran: inputs.mataPelajaran,
                tahunAjaran: inputs.tahunAjaran,
                kelasSemester: inputs.kelasSemester,
                assessmentType: inputs.assessmentType,
                kktp: inputs.kktp,
                kepalaMadrasah: inputs.kepalaMadrasah,
                nipKepala: inputs.nipKepala,
                capaianPembelajaran: inputs.capaianPembelajaran,
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(identityData));
            showMessage("Identitas berhasil disimpan di browser ini.", "info");
        } catch (error) {
             console.error("Failed to save data to localStorage", error);
            showMessage("Gagal menyimpan identitas.", "error");
        }
    }, [inputs, showMessage]);
    
    const handleResetIdentity = useCallback(() => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data identitas yang tersimpan?")) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setInputs(prev => ({
                ...prev,
                guruMapel: DEFAULT_INPUTS.guruMapel,
                nipGuru: DEFAULT_INPUTS.nipGuru,
                mataPelajaran: DEFAULT_INPUTS.mataPelajaran,
                tahunAjaran: DEFAULT_INPUTS.tahunAjaran,
                kelasSemester: DEFAULT_INPUTS.kelasSemester,
                assessmentType: DEFAULT_INPUTS.assessmentType,
                kktp: DEFAULT_INPUTS.kktp,
                kepalaMadrasah: DEFAULT_INPUTS.kepalaMadrasah,
                nipKepala: DEFAULT_INPUTS.nipKepala,
                capaianPembelajaran: DEFAULT_INPUTS.capaianPembelajaran,
            }));
            showMessage("Identitas telah direset.", "info");
        }
    }, [showMessage]);

    return (
        <div className="max-w-4xl mx-auto">
            <Header />
            <div className="no-print">
                <InputSection 
                    inputs={inputs} 
                    setInputs={setInputs} 
                    onAnalyze={handleAnalysis} 
                    onSaveIdentity={handleSaveIdentity}
                    onResetIdentity={handleResetIdentity}
                    showMessage={showMessage}
                />
            </div>
            {analysisResult && <OutputSection result={analysisResult} inputs={inputs} />}
            <MessageBox message={message} />
            <Footer />
        </div>
    );
};

export default App;