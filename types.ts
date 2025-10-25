import React from 'react';

export type QuestionType = 'Pilihan Ganda' | 'Pilihan Ganda Kompleks' | 'Benar/Salah' | 'Menjodohkan' | 'Isian Singkat';

export interface Question {
    key: string;
    score: number;
    type: QuestionType; 
}

export interface StudentAnswers {
    name: string;
    answers: string[];
}

export interface AnalysisInput {
    guruMapel: string;
    nipGuru: string;
    mataPelajaran: string;
    tahunAjaran: string;
    kelasSemester: string;
    assessmentType: string;
    assessmentDate: string;
    analysisDate: string;
    kktp: number;
    kepalaMadrasah: string;
    nipKepala: string;
    questions: Question[];
    studentData: StudentAnswers[];
    capaianPembelajaran: string;
}

export interface Message {
    text: string;
    type: 'error' | 'info';
}

export interface Student {
    name: string;
    answers: string[];
    rawScore: number;
    maxScore: number;
    percentage: number;
    group: 'Atas' | 'Tengah' | 'Bawah';
    rtl: 'Pengayaan' | 'Reguler' | 'Remidi'; // Rencana Tindak Lanjut
    bgColor: string;
    correctAnswersCount: number;
    incorrectQuestionNumbers: number[];
    status: 'Tuntas' | 'Belum Tuntas';
}

export interface ItemAnalysis {
    questionId: number;
    key: string;
    type: QuestionType;
    numStudents: number;
    R: number; // Correct answers
    unansweredCount: number;
    P: string; // Difficulty index
    P_criteria: React.ReactNode;
    P_criteria_plain: string;
    D: string; // Discrimination index
    D_criteria: React.ReactNode;
    D_criteria_plain: string;
}

export interface AnalysisResult {
    students: Student[];
    itemAnalysis: ItemAnalysis[];
    maxScore: number;
    totalQuestions: number;
}

// New type for saved analysis sessions
export interface SavedAnalysis {
    id: number;
    name: string;
    savedAt: string;
    data: AnalysisInput;
}