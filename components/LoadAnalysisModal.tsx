import React from 'react';
import type { SavedAnalysis } from '../types.ts';

interface LoadAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    analyses: SavedAnalysis[];
    onLoad: (id: number) => void;
    onDelete: (id: number) => void;
}

const LoadAnalysisModal: React.FC<LoadAnalysisModalProps> = ({ isOpen, onClose, analyses, onLoad, onDelete }) => {
    if (!isOpen) return null;
    
    // Sort analyses by date, newest first
    const sortedAnalyses = [...analyses].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h3 className="text-xl font-bold">Muat Analisis Tersimpan</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {sortedAnalyses.length > 0 ? (
                        <ul className="space-y-3">
                            {sortedAnalyses.map(analysis => (
                                <li key={analysis.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                    <div className="flex-grow mb-2 sm:mb-0">
                                        <p className="font-semibold text-gray-800">{analysis.name}</p>
                                        <p className="text-xs text-gray-500">
                                            Disimpan pada: {new Date(analysis.savedAt).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 flex gap-2 self-end sm:self-center">
                                        <button 
                                            onClick={() => onLoad(analysis.id)} 
                                            className="px-4 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                        >
                                            Muat
                                        </button>
                                        <button 
                                            onClick={() => onDelete(analysis.id)} 
                                            className="px-4 py-1.5 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Belum ada analisis yang tersimpan.</p>
                        </div>
                    )}
                </div>
                <div className="mt-4 pt-4 border-t text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default LoadAnalysisModal;
