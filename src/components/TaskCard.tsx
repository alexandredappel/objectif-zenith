import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface TaskCardProps {
  title: string;
  duration: number;
  progress: number;
  category: 'professional' | 'personal';
}

export const TaskCard = ({ title, duration, progress, category }: TaskCardProps) => {
  return (
    <Card className={`p-4 hover:shadow-lg transition-shadow ${
      category === 'professional' ? 'bg-gradient-to-r from-professional to-professional-light' : 
      'bg-gradient-to-r from-personal to-personal-light'
    }`}>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <div className="text-white/80 text-sm mb-3">{duration} min</div>
      <Progress value={progress} className="h-2 bg-white/20" 
        indicatorClassName="bg-white" />
    </Card>
  );
};