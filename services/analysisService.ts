import React from 'react';
import type { AnalysisInput, AnalysisResult, Student, ItemAnalysis } from '../types.ts';

const getDifficultyCriteria = (P: number): { criteria: React.ReactNode, plain: string } => {
    if (P > 0.7) return { criteria: React.createElement('span', { className: 'text-green-600 font-semibold' }, 'Mudah'), plain: 'Mudah' };
    if (P >= 0.3) return { criteria: React.createElement('span', { className: 'text-yellow-600 font-semibold' }, 'Sedang'), plain: 'Sedang' };
    return { criteria: React.createElement('span', { className: 'text-red-600 font-semibold' }, 'Sukar'), plain: 'Sukar' };
};

const getDiscriminationCriteria = (D: number): { criteria: React.ReactNode, plain: string } => {
    if (D > 0.4) return { criteria: React.createElement('span', { className: 'text-blue-600 font-semibold' }, 'Sangat Baik'), plain: 'Sangat Baik' };
    if (D >= 0.3) return { criteria: React.createElement('span', { className: 'text-green-600 font-semibold' }, 'Baik'), plain: 'Baik' };
    if (D >= 0.2) return { criteria: React.createElement('span', { className: 'text-yellow-600 font-semibold' }, 'Cukup'), plain: 'Cukup' };
    return { criteria: React.createElement('span', { className: 'text-red-600 font-semibold' }, 'Buruk'), plain: 'Buruk' };
};

// Helper function to sort string characters for complex multiple choice comparison
const sortString = (str: string): string => str.split('').sort().join('');


export const performAnalysisLogic = (inputs: AnalysisInput): AnalysisResult => {
    const { questions, studentData, kktp } = inputs;

    const validStudents = studentData.filter(s => s.name.trim() !== '');
    if (validStudents.length === 0) {
        throw new Error("Tidak ada data siswa yang valid untuk dianalisis. Pastikan nama siswa terisi.");
    }

    const maxScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
    if (maxScore === 0) {
        throw new Error("Skor maksimal tidak boleh nol. Periksa skor setiap soal.");
    }

    const totalQuestions = questions.filter(q => q.key.trim()).length;

    const studentsWithScores: Student[] = validStudents.map(student => {
        let rawScore = 0;
        let correctAnswersCount = 0;
        const incorrectQuestionNumbers: number[] = [];

        questions.forEach((question, i) => {
            if (!question.key.trim()) return; // Skip questions without a key
    
            let isAnswerCorrect = false;
            const answer = student.answers[i];
            
            if (answer && answer.trim()) {
                const questionKey = question.key.trim().toUpperCase();
                const studentAnswer = answer.trim().toUpperCase();
    
                switch (question.type) {
                    case 'Pilihan Ganda Kompleks':
                        isAnswerCorrect = sortString(studentAnswer) === sortString(questionKey);
                        break;
                    default:
                        isAnswerCorrect = studentAnswer === questionKey;
                        break;
                }
            }
            
            if (isAnswerCorrect) {
                rawScore += question.score || 0;
                correctAnswersCount++;
            } else {
                incorrectQuestionNumbers.push(i + 1);
            }
        });

        const percentage = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;
        const status = percentage >= kktp ? 'Tuntas' : 'Belum Tuntas';

        return {
            name: student.name,
            answers: student.answers,
            rawScore,
            maxScore,
            percentage,
            group: 'Tengah', // placeholder
            rtl: percentage >= kktp ? 'Pengayaan' : 'Remidi',
            bgColor: percentage >= kktp ? 'bg-green-50' : 'bg-red-50',
            correctAnswersCount,
            incorrectQuestionNumbers,
            status,
        };
    });

    // Sort students by score for grouping
    studentsWithScores.sort((a, b) => b.rawScore - a.rawScore);

    // Determine groups (Atas, Tengah, Bawah)
    const numStudents = studentsWithScores.length;
    const groupSize = Math.floor(numStudents * 0.27);
    
    if (numStudents >= 3 && groupSize > 0) {
        studentsWithScores.forEach((student, index) => {
            if (index < groupSize) {
                student.group = 'Atas';
            } else if (index >= numStudents - groupSize) {
                student.group = 'Bawah';
            } else {
                student.group = 'Tengah';
            }
        });

        // Refine RTL based on groups
        studentsWithScores.forEach(student => {
             if (student.percentage >= kktp) {
                 student.rtl = student.group === 'Atas' ? 'Pengayaan' : 'Reguler';
             } else {
                 student.rtl = 'Remidi';
             }
        });
    }

    const upperGroup = studentsWithScores.filter(s => s.group === 'Atas');
    const lowerGroup = studentsWithScores.filter(s => s.group === 'Bawah');
    
    const itemAnalysis: ItemAnalysis[] = questions.map((question, i) => {
        if (!question.key.trim()) return null;

        const questionKey = question.key.trim().toUpperCase();

        const isCorrect = (student: Student): boolean => {
            const studentAnswer = student.answers[i] ? student.answers[i].trim().toUpperCase() : '';
            if (!studentAnswer) return false;

            switch (question.type) {
                case 'Pilihan Ganda Kompleks':
                    return sortString(studentAnswer) === sortString(questionKey);
                default:
                    return studentAnswer === questionKey;
            }
        };
        
        const hasAnswered = (student: Student): boolean => {
            const answer = student.answers[i];
            return answer !== undefined && answer !== null && answer.trim() !== '';
        };

        const R = studentsWithScores.filter(isCorrect).length;
        const unansweredCount = studentsWithScores.filter(s => !hasAnswered(s)).length;
        const P_val = numStudents > 0 ? R / numStudents : 0;
        
        const RU = upperGroup.filter(isCorrect).length;
        const RL = lowerGroup.filter(isCorrect).length;
        
        const D_val = groupSize > 0 ? (RU - RL) / groupSize : 0;
        
        const { criteria: P_criteria, plain: P_criteria_plain } = getDifficultyCriteria(P_val);
        const { criteria: D_criteria, plain: D_criteria_plain } = getDiscriminationCriteria(D_val);

        return {
            questionId: i + 1,
            key: question.key,
            type: question.type,
            numStudents,
            R,
            unansweredCount,
            P: P_val.toFixed(2),
            P_criteria,
            P_criteria_plain,
            D: D_val.toFixed(2),
            D_criteria,
            D_criteria_plain,
        };
    }).filter((item): item is ItemAnalysis => item !== null);

    return {
        students: studentsWithScores,
        itemAnalysis,
        maxScore,
        totalQuestions,
    };
};