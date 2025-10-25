import React from 'react';
import { exportToCSV, generateReportHtml } from '../services/exportService.ts';
import type { AnalysisResult, AnalysisInput } from '../types.ts';

interface ExportButtonsProps {
    result: AnalysisResult;
    inputs: AnalysisInput;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ result, inputs }) => {
    
    const handlePrint = () => {
        const reportContent = generateReportHtml(result, inputs);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(reportContent);
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.print();
            };
        } else {
            alert("Gagal membuka jendela cetak. Pastikan pop-up diizinkan.");
        }
    };
    
    const handleDownloadHtml = () => {
        const reportContent = generateReportHtml(result, inputs);
        const file = new Blob([reportContent], { type: 'text/html' });
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Laporan_Analisis_${inputs.mataPelajaran.replace(/\s/g, '_')}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const baseButtonClass = "w-full sm:w-auto flex-grow text-center px-6 py-3 font-semibold text-white rounded-xl shadow-md transition duration-150 ease-in-out transform hover:scale-[1.01] focus:outline-none focus:ring-4";

    return (
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 no-print">
            <button onClick={() => exportToCSV(result, inputs)} className={`${baseButtonClass} bg-green-600 hover:bg-green-700 focus:ring-green-300`}>
                Simpan Excel (CSV)
            </button>
            <button onClick={handleDownloadHtml} className={`${baseButtonClass} bg-purple-600 hover:bg-purple-700 focus:ring-purple-300`}>
                Simpan Dokumen HTML
            </button>
            <button onClick={handlePrint} className={`${baseButtonClass} bg-blue-600 hover:bg-blue-700 focus:ring-blue-300`}>
                Cetak / Simpan PDF
            </button>
        </div>
    );
};

export default ExportButtons;