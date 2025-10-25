import React, { useState, useEffect } from 'react';
import type { AnalysisInput, Question, StudentAnswers, Message, QuestionType } from '../types.ts';
import AIScanModal from './AIScanModal.tsx';
import KeyImportModal from './KeyImportModal.tsx';

interface InputSectionProps {
    inputs: AnalysisInput;
    setInputs: React.Dispatch<React.SetStateAction<AnalysisInput>>;
    onAnalyze: () => void;
    onSaveIdentity: () => void;
    onResetIdentity: () => void;
    showMessage: (text: string, type: Message['type']) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ inputs, setInputs, onAnalyze, onSaveIdentity, onResetIdentity, showMessage }) => {
    const [studentDataText, setStudentDataText] = useState('');
    const [isAiScanModalOpen, setIsAiScanModalOpen] = useState(false);
    const [isKeyImportModalOpen, setIsKeyImportModalOpen] = useState(false);
    
    // Sync textarea when table data changes
    useEffect(() => {
        const newText = inputs.studentData.map(s => 
            `${s.name}\t${s.answers.slice(0, inputs.questions.length).join('\t')}`
        ).join('\n');
        setStudentDataText(newText);
    }, [inputs.studentData, inputs.questions.length]);


    const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: name === 'kktp' ? parseInt(value, 10) || 0 : value }));
    };

    // FIX: Changed `value` type from `string | number` to `string` as all call sites pass a string.
    // This resolves the type error when assigning `value` to `question.key` or `question.type`.
    const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
        const newQuestions = [...inputs.questions];
        const question = { ...newQuestions[index] };
        
        if (field === 'score') {
            question.score = Number(value) || 0;
        } else if (field === 'key') {
            question.key = value;
        } else if (field === 'type') {
            question.type = value as QuestionType;
        }
        
        newQuestions[index] = question;
        setInputs(prev => ({ ...prev, questions: newQuestions }));
    };

    const addQuestion = () => {
        setInputs(prev => ({
            ...prev,
            questions: [...prev.questions, { key: '', score: 10, type: 'Pilihan Ganda' }]
        }));
    };

    const removeQuestion = (index: number) => {
        if (inputs.questions.length <= 1) {
            showMessage("Minimal harus ada satu soal.", "error");
            return;
        }
        const newQuestions = inputs.questions.filter((_, i) => i !== index);
        setInputs(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleStudentDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setStudentDataText(text);
        const lines = text.trim().split('\n');
        const studentData: StudentAnswers[] = lines.map(line => {
            const parts = line.split('\t');
            const name = parts[0] || '';
            const answers = parts.slice(1, inputs.questions.length + 1);
            // Pad answers if student has fewer answers than questions
            while (answers.length < inputs.questions.length) {
                answers.push('');
            }
            return { name, answers };
        }).filter(s => s.name.trim() !== '' || s.answers.some(a => a.trim() !== ''));
        setInputs(prev => ({ ...prev, studentData }));
    };

    const handleKeyImport = (keys: string[]) => {
        const newQuestions: Question[] = keys.map((key, index) => ({
            key,
            score: inputs.questions[index]?.score || 10,
            type: inputs.questions[index]?.type || 'Pilihan Ganda',
        }));
        setInputs(prev => ({ ...prev, questions: newQuestions }));
        showMessage(`${keys.length} kunci jawaban berhasil diimpor.`, 'info');
    };
    
    const handleAiScanComplete = (data: StudentAnswers) => {
        const existingStudentIndex = inputs.studentData.findIndex(s => s.name.toLowerCase() === data.name.toLowerCase());
        let updatedStudentData;
        if (existingStudentIndex !== -1) {
            updatedStudentData = [...inputs.studentData];
            updatedStudentData[existingStudentIndex] = data;
             showMessage(`Data siswa ${data.name} berhasil diperbarui.`, 'info');
        } else {
            updatedStudentData = [...inputs.studentData, data];
            showMessage(`Siswa baru ${data.name} berhasil ditambahkan.`, 'info');
        }
        
        setInputs(prev => ({ ...prev, studentData: updatedStudentData }));
    };
    
    const handleStudentDetailChange = (index: number, newName: string) => {
        const newStudentData = [...inputs.studentData];
        newStudentData[index] = { ...newStudentData[index], name: newName };
        setInputs(prev => ({ ...prev, studentData: newStudentData }));
    };

    const handleStudentAnswerChange = (studentIndex: number, answerIndex: number, newAnswer: string) => {
        const newStudentData = JSON.parse(JSON.stringify(inputs.studentData));
        newStudentData[studentIndex].answers[answerIndex] = newAnswer;
        setInputs(prev => ({ ...prev, studentData: newStudentData }));
    };

    const addStudentRow = () => {
        const newStudent: StudentAnswers = {
            name: '',
            answers: Array(inputs.questions.length).fill('')
        };
        setInputs(prev => ({ ...prev, studentData: [...prev.studentData, newStudent] }));
    };

    const removeStudentRow = (index: number) => {
        const newStudentData = inputs.studentData.filter((_, i) => i !== index);
        setInputs(prev => ({ ...prev, studentData: newStudentData }));
    };


    const SubHeader: React.FC<{ title: string, subtitle: string }> = ({ title, subtitle }) => (
        <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
    );
    
    const baseButtonClass = "px-4 py-2 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition duration-150";
    const primaryButton = `${baseButtonClass} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400`;
    const secondaryButton = `${baseButtonClass} bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400`;
    const dangerButton = `${baseButtonClass} bg-red-600 text-white hover:bg-red-700 focus:ring-red-400`;

    const labelClass = "block text-sm font-medium text-gray-700";
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
    
    const assessmentOptions = ['Penilaian Harian', 'Sumatif Tengah Semester', 'Sumatif Akhir Semester', 'Sumatif Akhir Tahun', 'Ujian Madrasah'];

    return (
        <div className="space-y-8">
            <div className="container-card bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <SubHeader title="1. Identitas Laporan" subtitle="Informasi umum mengenai penilaian yang akan dianalisis." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <label className={labelClass}>Guru Mata Pelajaran</label>
                        <input type="text" name="guruMapel" value={inputs.guruMapel} onChange={handleIdentityChange} className={inputClass} />
                        <label className={`${labelClass} mt-4`}>NIP/NBM Guru</label>
                        <input type="text" name="nipGuru" value={inputs.nipGuru} onChange={handleIdentityChange} className={inputClass} placeholder="Opsional" />
                        <label className={`${labelClass} mt-4`}>Mata Pelajaran</label>
                        <input type="text" name="mataPelajaran" value={inputs.mataPelajaran} onChange={handleIdentityChange} className={inputClass} />
                        <label className={`${labelClass} mt-4`}>Tahun Ajaran</label>
                        <input type="text" name="tahunAjaran" value={inputs.tahunAjaran} onChange={handleIdentityChange} className={inputClass} />
                         <label className={`${labelClass} mt-4`}>Jenis Penilaian</label>
                        <input type="text" name="assessmentType" value={inputs.assessmentType} onChange={handleIdentityChange} className={inputClass} />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {assessmentOptions.map(option => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setInputs(prev => ({ ...prev, assessmentType: option }))}
                                    className={`px-3 py-1 text-xs rounded-full transition ${
                                        inputs.assessmentType === option
                                            ? 'bg-blue-600 text-white font-semibold shadow-md'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        <label className={`${labelClass} mt-4`}>Capaian Pembelajaran</label>
                        <textarea name="capaianPembelajaran" value={inputs.capaianPembelajaran} onChange={handleIdentityChange} className={inputClass} rows={3} placeholder="Contoh: Peserta didik dapat mengidentifikasi..."></textarea>
                    </div>
                    <div>
                        <label className={labelClass}>Kelas / Semester</label>
                        <input type="text" name="kelasSemester" value={inputs.kelasSemester} onChange={handleIdentityChange} className={inputClass} />
                        <label className={`${labelClass} mt-4`}>KKTP</label>
                        <input type="number" name="kktp" value={inputs.kktp} onChange={handleIdentityChange} className={inputClass} min="0" max="100" />
                        <label className={`${labelClass} mt-4`}>Tanggal Penilaian</label>
                        <input type="date" name="assessmentDate" value={inputs.assessmentDate} onChange={handleIdentityChange} className={inputClass} />
                        <label className={`${labelClass} mt-4`}>Tanggal Analisis</label>
                        <input type="date" name="analysisDate" value={inputs.analysisDate} onChange={handleIdentityChange} className={inputClass} />
                        <label className={`${labelClass} mt-4`}>Kepala Madrasah</label>
                        <input type="text" name="kepalaMadrasah" value={inputs.kepalaMadrasah} onChange={handleIdentityChange} className={inputClass} />
                         <label className={`${labelClass} mt-4`}>NIP/NBM Kepala</label>
                        <input type="text" name="nipKepala" value={inputs.nipKepala} onChange={handleIdentityChange} className={inputClass} placeholder="Opsional"/>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                    <button onClick={onSaveIdentity} className={secondaryButton}>Simpan Identitas</button>
                    <button onClick={onResetIdentity} className={dangerButton}>Hapus Identitas Tersimpan</button>
                </div>
            </div>

            <div className="container-card bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <SubHeader title="2. Butir Soal dan Kunci Jawaban" subtitle="Masukkan kunci jawaban, skor, dan jenis untuk setiap butir soal." />
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">No.</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kunci Jawaban</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Skor</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Jenis Soal</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inputs.questions.map((q, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-2 text-center font-medium">{i + 1}</td>
                                    <td className="px-4 py-2">
                                        <input type="text" value={q.key} onChange={(e) => handleQuestionChange(i, 'key', e.target.value)} className={inputClass} placeholder="cth: A / B,C / BENAR"/>
                                    </td>
                                    <td className="px-4 py-2">
                                        <input type="number" value={q.score} onChange={(e) => handleQuestionChange(i, 'score', e.target.value)} className={`${inputClass} text-center`} min="0"/>
                                    </td>
                                    <td className="px-4 py-2">
                                        <select value={q.type} onChange={(e) => handleQuestionChange(i, 'type', e.target.value)} className={inputClass}>
                                            <option>Pilihan Ganda</option>
                                            <option>Pilihan Ganda Kompleks</option>
                                            <option>Benar/Salah</option>
                                            <option>Menjodohkan</option>
                                            <option>Isian Singkat</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <button onClick={() => removeQuestion(i)} className="text-red-500 hover:text-red-700" title="Hapus Soal">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div className="flex flex-wrap gap-2 mt-4">
                    <button onClick={addQuestion} className={primaryButton}>Tambah Soal</button>
                    <button onClick={() => setIsKeyImportModalOpen(true)} className={secondaryButton}>Impor Kunci Jawaban</button>
                </div>
            </div>

            <div className="container-card bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <SubHeader title="3. Jawaban Siswa" subtitle="Tempel data dari spreadsheet (Excel/Sheets) atau masukkan secara manual di bawah." />
                <textarea
                    className="w-full h-24 p-3 font-mono text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder={"Contoh:\nSiswa A\tA\tB\tC...\nSiswa B\tD\tB\tA..."}
                    value={studentDataText}
                    onChange={handleStudentDataChange}
                />
                 <div className="flex flex-wrap gap-2 mt-4 items-center">
                    <button onClick={() => setIsAiScanModalOpen(true)} className={`${primaryButton} disabled:bg-gray-400 disabled:cursor-not-allowed`} disabled={!process.env.API_KEY}>
                       Pindai LJK dengan AI
                    </button>
                     {!process.env.API_KEY && (
                         <p className="text-xs text-red-600 self-center">
                           Fitur AI dinonaktifkan. Atur <code className="bg-gray-200 p-1 rounded">API_KEY</code> untuk mengaktifkan.
                        </p>
                    )}
                </div>
                
                <div className="mt-6 pt-4 border-t">
                     <h4 className="text-md font-semibold text-gray-700 mb-3">Input Manual Jawaban Siswa</h4>
                     <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">No.</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Nama Siswa</th>
                                    {inputs.questions.map((_, i) => (
                                        <th key={i} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{i + 1}</th>
                                    ))}
                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {inputs.studentData.map((student, studentIndex) => (
                                    <tr key={studentIndex}>
                                        <td className="px-3 py-1 text-center text-sm text-gray-500">{studentIndex + 1}</td>
                                        <td className="px-3 py-1">
                                            <input
                                                type="text"
                                                value={student.name}
                                                onChange={(e) => handleStudentDetailChange(studentIndex, e.target.value)}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-1"
                                                placeholder={`Siswa ${studentIndex + 1}`}
                                            />
                                        </td>
                                        {Array.from({ length: inputs.questions.length }).map((_, answerIndex) => (
                                            <td key={answerIndex} className="px-2 py-1">
                                                <input
                                                    type="text"
                                                    value={student.answers[answerIndex] || ''}
                                                    onChange={(e) => handleStudentAnswerChange(studentIndex, answerIndex, e.target.value.toUpperCase())}
                                                    className="w-12 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-1 text-center"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-3 py-1 text-center">
                                            <button onClick={() => removeStudentRow(studentIndex)} className="text-red-500 hover:text-red-700" title="Hapus Siswa">
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                     <div className="mt-4">
                         <button onClick={addStudentRow} className={secondaryButton}>Tambah Baris Siswa</button>
                     </div>
                </div>

            </div>

            <div className="text-center mt-8">
                <button onClick={onAnalyze} className="w-full md:w-auto px-12 py-4 text-lg font-bold text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-150 transform hover:scale-105">
                    Lakukan Analisis
                </button>
            </div>
            
            <KeyImportModal
                isOpen={isKeyImportModalOpen}
                onClose={() => setIsKeyImportModalOpen(false)}
                onImport={handleKeyImport}
                numberOfQuestions={inputs.questions.length}
            />
            
            <AIScanModal 
                isOpen={isAiScanModalOpen}
                onClose={() => setIsAiScanModalOpen(false)}
                onScanComplete={handleAiScanComplete}
                numberOfQuestions={inputs.questions.length}
                showMessage={showMessage}
            />
        </div>
    );
};

export default InputSection;