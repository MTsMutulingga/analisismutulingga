import React from 'react';
import type { ItemAnalysis, DistractorAnalysis } from '../types.ts';

interface ItemAnalysisTableProps {
    itemAnalysis: ItemAnalysis[];
}

const renderDistractorAnalysis = (distractors: DistractorAnalysis | undefined, key: string) => {
    if (!distractors) {
        return <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">-</td>;
    }
    
    const sortedOptions = Object.keys(distractors).sort();

    return (
        <td className="px-4 py-3 whitespace-nowrap text-sm text-left">
            <ul className="space-y-1 text-xs">
                {sortedOptions.map(option => {
                    const detail = distractors[option];
                    const isKey = option === key;
                    const isGoodDistractor = !isKey && detail.lowerGroupCount > detail.upperGroupCount;
                    const isBadDistractor = !isKey && !isGoodDistractor;

                    let textColor = 'text-gray-700';
                    if (isKey) textColor = 'text-green-700 font-bold';
                    if (isGoodDistractor) textColor = 'text-green-600';
                    if (isBadDistractor) textColor = 'text-red-600';

                    return (
                        <li key={option} className={`flex items-center gap-2 ${textColor}`}>
                            <span>{option}:</span>
                            <span className="font-mono w-20">
                                {detail.totalCount} (A: {detail.upperGroupCount}, B: {detail.lowerGroupCount})
                            </span>
                             {isKey && <span title="Kunci Jawaban">🔑</span>}
                             {isGoodDistractor && <span title="Pengecoh Baik">✔️</span>}
                             {isBadDistractor && <span title="Pengecoh Buruk">❌</span>}
                        </li>
                    );
                })}
            </ul>
        </td>
    );
};


const ItemAnalysisTable: React.FC<ItemAnalysisTableProps> = ({ itemAnalysis }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Soal</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kunci</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Respon (B/S/K)</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tingkat Kesulitan (P)</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kriteria P</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Daya Pembeda (D)</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kriteria D</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Analisis Pengecoh</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {itemAnalysis.map((item, index) => {
                    const wrongCount = item.numStudents - item.R - item.unansweredCount;
                    return (
                        <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium text-gray-900">{item.questionId}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{item.type}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{item.key}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                                <span className="text-green-600 font-semibold">{item.R}</span> / <span className="text-red-600 font-semibold">{wrongCount}</span> / <span className="text-gray-500">{item.unansweredCount}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">{item.P}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.P_criteria}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">{item.D}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.D_criteria}</td>
                            {renderDistractorAnalysis(item.distractorAnalysis, item.key)}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

export default ItemAnalysisTable;