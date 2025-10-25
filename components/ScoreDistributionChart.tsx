

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Student } from '../types.ts';

interface ChartProps {
    students: Student[];
    kktp: number;
}

// Custom tooltip for better UX
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-lg text-sm">
        <p className="font-bold text-gray-700">{`Rentang Nilai: ${label}`}</p>
        <p style={{ color: payload[0].payload.fill }}>{`Jumlah Siswa: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};


const ScoreDistributionChart: React.FC<ChartProps> = ({ students, kktp }) => {
    const chartData = useMemo(() => {
        if (students.length === 0) return [];

        const distribution: { [key: string]: number } = {};
        const labels: string[] = [];
        const step = 10;

        // Create labels: 0-10%, 11-20%, ..., 91-100%
        labels.push('0-10%');
        for (let i = 10; i < 100; i += step) {
            labels.push(`${i + 1}-${i + step}%`);
        }
        labels.forEach(l => distribution[l] = 0);

        students.forEach(student => {
            const percent = student.percentage;
            let finalLabel: string | undefined;
            
            if (percent <= 10) {
                finalLabel = '0-10%';
            } else {
                const binIndex = Math.ceil(percent / step) - 1;
                if (labels[binIndex]) {
                    finalLabel = labels[binIndex];
                }
            }

            if (finalLabel && distribution.hasOwnProperty(finalLabel)) {
                distribution[finalLabel]++;
            }
        });

        return labels.map(label => ({
            name: label,
            "Jumlah Siswa": distribution[label] || 0,
        }));
    }, [students]);

    const COLORS = {
        BELOW: '#ef4444', // Red-500
        CONTAINS: '#f59e0b', // Amber-500
        ABOVE: '#3b82f6', // Blue-600
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} label={{ value: 'Jumlah Siswa', angle: -90, position: 'insideLeft', offset: 10, style: {fontSize: '14px', textAnchor: 'middle'}}} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(239, 246, 255, 0.7)'}}/>
                <Bar dataKey="Jumlah Siswa">
                    {chartData.map((entry, index) => {
                        const [lowerBound, upperBound] = entry.name.replace(/%/g, '').split('-').map(Number);
                        let color;
                        if (upperBound < kktp) {
                            color = COLORS.BELOW;
                        } else if (lowerBound >= kktp) {
                            color = COLORS.ABOVE;
                        } else {
                            color = COLORS.CONTAINS;
                        }
                        return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ScoreDistributionChart;