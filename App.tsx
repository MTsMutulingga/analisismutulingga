import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.tsx';
import InputSection from './components/InputSection.tsx';
import OutputSection from './components/OutputSection.tsx';
import MessageBox from './components/MessageBox.tsx';
import Footer from './components/Footer.tsx';
import LoadAnalysisModal from './components/LoadAnalysisModal.tsx';
import UserGuideModal from './components/UserGuideModal.tsx';
import DeveloperInfoModal from './components/DeveloperInfoModal.tsx';
import { performAnalysisLogic } from './services/analysisService.ts';
import type { AnalysisInput, Message, AnalysisResult, SavedAnalysis } from './types.ts';
import { DEFAULT_INPUTS } from './constants.ts';

const IDENTITY_STORAGE_KEY = 'mutulinggaAnalysisInputs';
const SESSIONS_STORAGE_KEY = 'mutulinggaSavedAnalyses';

const App: React.FC = () => {
    const [inputs, setInputs] = useState<AnalysisInput>(DEFAULT_INPUTS);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [message, setMessage] = useState<Message | null>(null);
    const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
    const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
    const [isDeveloperInfoModalOpen, setIsDeveloperInfoModalOpen] = useState(false);

    const showMessage = useCallback((text: string, type: 'error' | 'info') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 5000);
    }, []);

    useEffect(() => {
        // Load saved identity and saved sessions from localStorage on initial load
        try {
            const savedIdentity = localStorage.getItem(IDENTITY_STORAGE_KEY);
            if (savedIdentity) {
                const parsedData = JSON.parse(savedIdentity);
                setInputs(prev => ({ ...prev, ...parsedData }));
            }
            
            const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
            if(savedSessions) {
                setSavedAnalyses(JSON.parse(savedSessions));
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
             if (isNaN(inputs.kktp) || inputs.kktp < 0 || inputs.kktp > 100) {
                 throw new Error("KKTP harus berupa angka antara 0 dan 100.");
            }
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
            localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(identityData));
            showMessage("Identitas berhasil disimpan di browser ini.", "info");
        } catch (error) {
             console.error("Failed to save data to localStorage", error);
            showMessage("Gagal menyimpan identitas.", "error");
        }
    }, [inputs, showMessage]);
    
    const handleResetIdentity = useCallback(() => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data identitas yang tersimpan?")) {
            localStorage.removeItem(IDENTITY_STORAGE_KEY);
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

    const handleSaveAnalysis = useCallback(() => {
        const name = window.prompt("Masukkan nama untuk analisis ini (cth: PH 1 Kelas 7A):");
        if (name) {
            try {
                const newSave: SavedAnalysis = {
                    id: Date.now(),
                    name: name,
                    savedAt: new Date().toISOString(),
                    data: inputs
                };
                const updatedAnalyses = [...savedAnalyses, newSave];
                setSavedAnalyses(updatedAnalyses);
                localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedAnalyses));
                showMessage(`Analisis "${name}" berhasil disimpan.`, "info");
            } catch (error) {
                console.error("Failed to save analysis", error);
                showMessage("Gagal menyimpan analisis.", "error");
            }
        }
    }, [inputs, savedAnalyses, showMessage]);

    const handleLoadAnalysis = useCallback((id: number) => {
        const analysisToLoad = savedAnalyses.find(a => a.id === id);
        if (analysisToLoad) {
            setInputs(analysisToLoad.data);
            setAnalysisResult(null); // Clear previous results
            setIsLoadModalOpen(false);
            showMessage(`Analisis "${analysisToLoad.name}" berhasil dimuat.`, "info");
        } else {
            showMessage("Analisis yang dipilih tidak ditemukan.", "error");
        }
    }, [savedAnalyses, showMessage]);
    
    const handleDeleteAnalysis = useCallback((id: number) => {
        const analysisToDelete = savedAnalyses.find(a => a.id === id);
        if (analysisToDelete && window.confirm(`Apakah Anda yakin ingin menghapus analisis "${analysisToDelete.name}"?`)) {
            try {
                const updatedAnalyses = savedAnalyses.filter(a => a.id !== id);
                setSavedAnalyses(updatedAnalyses);
                localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedAnalyses));
                showMessage("Analisis berhasil dihapus.", "info");
            } catch (error) {
                 console.error("Failed to delete analysis", error);
                 showMessage("Gagal menghapus analisis.", "error");
            }
        }
    }, [savedAnalyses, showMessage]);

    const handleExportAnalysis = useCallback(() => {
        try {
            const fileName = `analisis_nilai_${inputs.mataPelajaran.replace(/\s/g, '_') || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
            const jsonString = JSON.stringify(inputs, null, 2); // pretty print JSON
            const blob = new Blob([jsonString], { type: 'application/json' });
            const href = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = href;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(href);
            showMessage("Analisis berhasil diekspor ke file.", "info");
        } catch (error) {
            console.error("Failed to export analysis", error);
            showMessage("Gagal mengekspor analisis.", "error");
        }
    }, [inputs, showMessage]);

    const handleImportAnalysis = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Konten file tidak dapat dibaca.");
                }
                const data = JSON.parse(text);

                // Basic validation
                if (typeof data === 'object' && data !== null && 'questions' in data && 'studentData' in data) {
                    setInputs(data as AnalysisInput);
                    setAnalysisResult(null); // Clear previous results
                    showMessage(`Analisis dari file "${file.name}" berhasil dimuat.`, "info");
                } else {
                    throw new Error("File tidak valid atau format tidak sesuai.");
                }
            } catch (error) {
                console.error("Failed to import analysis", error);
                if (error instanceof Error) {
                    showMessage(`Gagal mengimpor file: ${error.message}`, "error");
                } else {
                    showMessage("Gagal mengimpor file.", "error");
                }
            } finally {
                // Reset file input value to allow re-uploading the same file
                if(event.target) {
                    event.target.value = '';
                }
            }
        };
        reader.onerror = () => {
            showMessage("Gagal membaca file.", "error");
        };
        reader.readAsText(file);
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
                    onSaveAnalysis={handleSaveAnalysis}
                    onOpenLoadModal={() => setIsLoadModalOpen(true)}
                    onOpenGuideModal={() => setIsGuideModalOpen(true)}
                    onExportAnalysis={handleExportAnalysis}
                    onImportAnalysis={handleImportAnalysis}
                    showMessage={showMessage}
                />
            </div>
            {analysisResult && <OutputSection result={analysisResult} inputs={inputs} />}
            <MessageBox message={message} />
            <Footer onOpenDeveloperInfo={() => setIsDeveloperInfoModalOpen(true)} />
            <LoadAnalysisModal
                isOpen={isLoadModalOpen}
                onClose={() => setIsLoadModalOpen(false)}
                analyses={savedAnalyses}
                onLoad={handleLoadAnalysis}
                onDelete={handleDeleteAnalysis}
            />
            <UserGuideModal
                isOpen={isGuideModalOpen}
                onClose={() => setIsGuideModalOpen(false)}
            />
            <DeveloperInfoModal
                isOpen={isDeveloperInfoModalOpen}
                onClose={() => setIsDeveloperInfoModalOpen(false)}
            />
        </div>
    );
};

export default App;