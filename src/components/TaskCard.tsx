import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "./ui/use-toast";

interface TaskCardProps {
  id: string;
  title: string;
  duration: number;
  progress: number;
  category: 'professional' | 'personal';
  completed?: boolean;
  onClick?: () => void;
  type: 'quarterly' | 'monthly' | 'weekly' | 'daily';
}

export const TaskCard = ({ id, title, duration, category, completed = false, onClick, type }: TaskCardProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  // Calculate completion percentage
  const completionPercentage = React.useMemo(() => {
    if (!childGoals || childGoals.length === 0) return completed ? 100 : 0;
    
    const completedGoals = childGoals.filter(goal => goal.completed).length;
    return Math.round((completedGoals / childGoals.length) * 100);
  }, [childGoals, completed]);

  console.log('TaskCard rendered:', { id, title, completed, childGoals, completionPercentage });

  const handleCompletionToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const { error } = await supabase
        .from('goals')
        .update({ completed: !completed })
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['goals'] });

      toast({
        title: completed ? "Objectif non complété" : "Objectif complété",
        description: completed ? "L'objectif a été marqué comme non complété" : "L'objectif a été marqué comme complété",
      });

    } catch (error) {
      console.error('Error toggling completion:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de l'objectif",
        variant: "destructive",
      });
    }
  };

  const handleChildCompletionToggle = async (childId: string, isCompleted: boolean, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const { error } = await supabase
        .from('goals')
        .update({ completed: !isCompleted })
        .eq('id', childId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['goals'] });

      toast({
        title: isCompleted ? "Sous-objectif non complété" : "Sous-objectif complété",
        description: isCompleted ? "Le sous-objectif a été marqué comme non complété" : "Le sous-objectif a été marqué comme complété",
      });

    } catch (error) {
      console.error('Error toggling child completion:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du sous-objectif",
        variant: "destructive",
      });
    }
  };
  
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
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white font-semibold mb-2">{title}</h3>
          <div className="text-white/80 text-sm">{duration} min</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{completionPercentage}%</span>
          <button
            onClick={handleCompletionToggle}
            className={`rounded-full p-2 transition-colors ${
              completed ? 'bg-white' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <Check className={`h-4 w-4 ${completed ? 'text-green-500' : 'text-white'}`} />
          </button>
        </div>
      </div>

      {childGoals && childGoals.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="h-px bg-white/20 mb-3"></div>
          {childGoals.map((child) => (
            <div key={child.id} 
              className="flex items-center justify-between py-1 px-2 rounded bg-white/10">
              <span className="text-sm text-white">{child.title}</span>
              <button
                onClick={(e) => handleChildCompletionToggle(child.id, child.completed, e)}
                className={`rounded-full p-1.5 transition-colors ${
                  child.completed ? 'bg-white' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <Check className={`h-3 w-3 ${child.completed ? 'text-green-500' : 'text-white'}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Progress 
        value={completionPercentage} 
        className="h-2 bg-white/20 mt-4" 
        indicatorClassName="bg-white" 
      />
    </Card>
  );
};