import React from 'react';
import type { AnalysisResult, AnalysisInput } from '../types.ts';
import ScoreDistributionChart from './ScoreDistributionChart.tsx';
import SummaryTable from './SummaryTable.tsx';
import ItemAnalysisTable from './ItemAnalysisTable.tsx';
import ExportButtons from './ExportButtons.tsx';

interface OutputSectionProps {
    result: AnalysisResult;
    inputs: AnalysisInput;
}

const OutputSection: React.FC<OutputSectionProps> = ({ result, inputs }) => {
    return (
        <div id="output-section" className="mt-12">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">Hasil Analisis</h2>
            
            <ExportButtons result={result} inputs={inputs} />

            <div className="container-card bg-white p-6 rounded-xl border border-gray-200 mb-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Visualisasi Distribusi Skor Siswa</h3>
                <div id="score-distribution-chart" className="h-64">
                    <ScoreDistributionChart students={result.students} kktp={inputs.kktp} />
                </div>
                <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-4">
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></span>Di Bawah KKTP</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-500 mr-1.5"></span>Mencakup KKTP</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-600 mr-1.5"></span>Di Atas KKTP</div>
                </div>
            </div>

            <div className="container-card bg-white p-6 rounded-xl border border-gray-200 mb-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Ringkasan Skor Siswa dan Rencana Tindak Lanjut (RTL)</h3>
                <SummaryTable students={result.students} totalQuestions={result.totalQuestions} />
                <p className="text-xs text-gray-500 mt-4">
                    * Kelompok ditentukan berdasarkan pemeringkatan skor (27% Atas, 27% Bawah, sisanya Tengah).
                </p>
            </div>

            <div className="container-card bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Analisis Butir Soal</h3>
                <ItemAnalysisTable itemAnalysis={result.itemAnalysis} />
                 <p className="text-xs text-gray-500 mt-4">
                    * Respon (B/S/K): Jumlah jawaban Benar / Salah / Kosong (Tidak Menjawab).<br />
                    Kriteria P (Tingkat Kesulitan): Mudah (&gt; 0.70), Sedang (0.30 - 0.70), Sukar (&lt; 0.30).<br />
                    Kriteria D (Daya Pembeda): Sangat Baik (&gt; 0.40), Baik (0.30 - 0.39), Cukup (0.20 - 0.29), Buruk (&lt; 0.20).<br />
                    Analisis Pengecoh: Menunjukkan jumlah pemilih per opsi. (A: Kelompok Atas, B: Kelompok Bawah). Pengecoh yang baik (✔️) dipilih lebih banyak oleh kelompok Bawah.
                </p>
            </div>
        </div>
    );
};

export default OutputSection;