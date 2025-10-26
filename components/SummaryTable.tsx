import React from 'react';
import type { Student } from '../types.ts';

interface SummaryTableProps {
    students: Student[];
    totalQuestions: number;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ students, totalQuestions }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                    <th className="px-2 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Skor</th>
                    <th className="px-2 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Persen (%)</th>
                    <th className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jml. Benar</th>
                    <th className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kelompok</th>
                    <th className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">RTL</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soal Salah (No.)</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => (
                    <tr key={index} className={`${student.bgColor}`}>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900">{student.rawScore}</td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900">{student.percentage}%</td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-center text-gray-900">{student.correctAnswersCount} / {totalQuestions}</td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-center font-semibold">{student.status === 'Tuntas' ? <span className="text-green-700">Tuntas</span> : <span className="text-red-700">Belum Tuntas</span>}</td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-center text-gray-900">{student.group}</td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-center text-gray-900">{student.rtl}</td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-left">
                            {student.incorrectQuestionNumbers.length > 0 ? (
                                <span className="text-red-600 font-medium">{student.incorrectQuestionNumbers.join(', ')}</span>
                            ) : (
                                <span className="text-green-600">Semua Benar</span>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default SummaryTable;