import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { WeeklySummary } from '../types';

interface SalesChartProps {
  weeklyData: WeeklySummary[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ weeklyData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Progreso Semanal vs Meta</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="weekNumber" tickFormatter={(val) => `Sem ${val}`} />
              <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monto']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend />
              <Bar name="Ventas Reales" dataKey="total" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar name="Meta Semanal" dataKey="goal" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendencia Acumulada</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weeklyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="weekNumber" tickFormatter={(val) => `Sem ${val}`} />
              <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
              <Tooltip 
                 formatter={(value: number) => [`$${value.toLocaleString()}`, 'Venta']}
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                name="Ventas Totales" 
                dataKey="total" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
