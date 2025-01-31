import React from 'react';

interface CategoryHeaderProps {
  title: string;
  count: number;
}

export const CategoryHeader = ({ title, count }: CategoryHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <span className="text-sm text-gray-500">{count} tâches</span>
    </div>
  );
};