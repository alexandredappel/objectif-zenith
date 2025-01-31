import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGoalManagement } from "@/hooks/useGoalManagement";
import { ChildGoalsList } from "./ChildGoalsList";

interface TaskCardProps {
  id: string;
  title: string;
  category: 'professional' | 'personal';
  completed?: boolean;
  onClick?: () => void;
  type: 'quarterly' | 'monthly' | 'weekly' | 'daily';
}

export const TaskCard = ({ 
  id, 
  title, 
  category, 
  completed = false, 
  onClick, 
  type 
}: TaskCardProps) => {
  const { toggleGoalCompletion, toggleChildGoalCompletion } = useGoalManagement();

  // Fetch child goals
  const { data: childGoals } = useQuery({
    queryKey: ['goals', 'children', id],
    queryFn: async () => {
      if (type === 'daily') return null;
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('parent_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: type !== 'daily',
  });

  // Calculate completion percentage and status
  const { completionPercentage, isFullyCompleted } = React.useMemo(() => {
    if (!childGoals || childGoals.length === 0) {
      return {
        completionPercentage: completed ? 100 : 0,
        isFullyCompleted: completed
      };
    }
    const completedGoals = childGoals.filter(goal => goal.completed).length;
    const percentage = Math.round((completedGoals / childGoals.length) * 100);
    return {
      completionPercentage: percentage,
      isFullyCompleted: percentage === 100 || completed
    };
  }, [childGoals, completed]);

  console.log('TaskCard rendered:', { 
    id, 
    title, 
    completed,
    childGoals, 
    completionPercentage,
    isFullyCompleted,
    type 
  });

  const handleCompletionToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleGoalCompletion(id, completed, childGoals);
  };

  const handleChildCompletionToggle = async (childId: string, isCompleted: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleChildGoalCompletion(childId, id, isCompleted);
  };
  
  return (
    <Card 
      className={`w-full p-4 hover:shadow-lg transition-shadow cursor-pointer relative ${
        category === 'professional' ? 
          isFullyCompleted ? 'bg-gradient-to-r from-professional/50 to-professional-light/50' :
          'bg-gradient-to-r from-professional to-professional-light' : 
        isFullyCompleted ? 'bg-gradient-to-r from-personal/50 to-personal-light/50' :
        'bg-gradient-to-r from-personal to-personal-light'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white font-semibold mb-2">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{completionPercentage}%</span>
          <button
            onClick={handleCompletionToggle}
            className={`rounded-full p-2 transition-colors ${
              isFullyCompleted ? 'bg-white' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <Check className={`h-4 w-4 ${isFullyCompleted ? 'text-green-500' : 'text-white'}`} />
          </button>
        </div>
      </div>

      <ChildGoalsList 
        childGoals={childGoals || []} 
        onToggleChild={handleChildCompletionToggle}
      />

      <Progress 
        value={completionPercentage} 
        className="h-2 bg-white/20 mt-4" 
        indicatorClassName="bg-white" 
      />
    </Card>
  );
};