import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "./ui/use-toast";

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
  const queryClient = useQueryClient();
  const { toast } = useToast();

  console.log('TaskCard rendered:', { id, title, completed });

  const handleCompletionToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's onClick

    try {
      const { error } = await supabase
        .from('goals')
        .update({ completed: !completed })
        .eq('id', id);

      if (error) throw error;

      // Invalidate and refetch queries
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
        <button
          onClick={handleCompletionToggle}
          className={`rounded-full p-2 transition-colors ${
            completed ? 'bg-white' : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          <Check className={`h-4 w-4 ${completed ? 'text-green-500' : 'text-white'}`} />
        </button>
      </div>
      <Progress value={progress} className="h-2 bg-white/20" 
        indicatorClassName="bg-white" />
    </Card>
  );
};