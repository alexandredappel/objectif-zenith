import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface TaskCardProps {
  id: string;
  title: string;
  duration: number;
  progress: number;
  category: 'professional' | 'personal';
  completed?: boolean;
  onClick?: () => void;
}

export const TaskCard = ({ id, title, duration, progress, category, completed = false, onClick }: TaskCardProps) => {
  console.log('TaskCard rendered:', { id, title, completed });
  
  return (
    <Card 
      className={`p-4 hover:shadow-lg transition-shadow cursor-pointer relative ${
        category === 'professional' ? 
          completed ? 'bg-gradient-to-r from-professional/50 to-professional-light/50' :
          'bg-gradient-to-r from-professional to-professional-light' : 
        completed ? 'bg-gradient-to-r from-personal/50 to-personal-light/50' :
        'bg-gradient-to-r from-personal to-personal-light'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-white font-semibold mb-2">{title}</h3>
          <div className="text-white/80 text-sm mb-3">{duration} min</div>
        </div>
        {completed && (
          <div className="bg-white rounded-full p-1">
            <Check className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>
      <Progress value={progress} className="h-2 bg-white/20" 
        indicatorClassName="bg-white" />
    </Card>
  );
};