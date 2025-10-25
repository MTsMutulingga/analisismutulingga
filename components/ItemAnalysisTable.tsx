

import React from 'react';
import type { ItemAnalysis } from '../types.ts';

interface ItemAnalysisTableProps {
    itemAnalysis: ItemAnalysis[];
}

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
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

export default ItemAnalysisTable;