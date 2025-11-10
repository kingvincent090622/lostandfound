
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Item, Category } from '../types';

interface DashboardChartProps {
  items: Item[];
  categories: Category[];
}

const DashboardChart: React.FC<DashboardChartProps> = ({ items, categories }) => {
  const data = categories.map(category => {
    const lost = items.filter(item => item.categoryId === category.id && item.status === 'Lost').length;
    const found = items.filter(item => item.categoryId === category.id && item.status === 'Found').length;
    return {
      name: category.name,
      Lost: lost,
      Found: found,
    };
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md h-96">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Items by Category</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5, right: 20, left: -10, bottom: 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} tick={{ fill: 'currentColor', fontSize: 12 }} />
          <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              borderColor: 'rgba(128, 128, 128, 0.3)',
              color: '#ffffff'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }}/>
          <Bar dataKey="Lost" fill="#f87171" />
          <Bar dataKey="Found" fill="#4ade80" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardChart;
