import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGoalManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleGoalCompletion = async (
    goalId: string, 
    currentStatus: boolean,
    childGoals?: { id: string; completed: boolean }[] | null
  ) => {
    console.log('Toggling goal completion:', { goalId, currentStatus, hasChildren: !!childGoals?.length });
    
    try {
      // Update parent goal
      const { error: parentError } = await supabase
        .from('goals')
        .update({ completed: !currentStatus })
        .eq('id', goalId);

      if (parentError) throw parentError;

      // If completing a parent goal, also complete all children
      if (!currentStatus && childGoals && childGoals.length > 0) {
        console.log('Completing all child goals for parent:', goalId);
        const { error: childError } = await supabase
          .from('goals')
          .update({ completed: true })
          .in('id', childGoals.map(child => child.id));

        if (childError) throw childError;
      }
      // If unchecking a parent goal, also uncheck all children
      else if (currentStatus && childGoals && childGoals.length > 0) {
        console.log('Unchecking all child goals for parent:', goalId);
        const { error: childError } = await supabase
          .from('goals')
          .update({ completed: false })
          .in('id', childGoals.map(child => child.id));

        if (childError) throw childError;
      }

      await queryClient.invalidateQueries({ queryKey: ['goals'] });

      toast({
        title: currentStatus ? "Objectif non complété" : "Objectif complété",
        description: currentStatus 
          ? "L'objectif et ses sous-objectifs ont été marqués comme non complétés" 
          : "L'objectif et ses sous-objectifs ont été marqués comme complétés",
      });

      return true;
    } catch (error) {
      console.error('Error toggling goal completion:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de l'objectif",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleChildGoalCompletion = async (
    childId: string,
    parentId: string,
    isCompleted: boolean
  ) => {
    console.log('Toggling child goal completion:', { childId, parentId, currentStatus: isCompleted });
    
    try {
      // First, update the child goal
      const { error: childError } = await supabase
        .from('goals')
        .update({ completed: !isCompleted })
        .eq('id', childId);

      if (childError) throw childError;

      // If we're unchecking a child, ensure the parent is also unchecked
      if (isCompleted) {
        console.log('Child goal unchecked, updating parent goal:', parentId);
        const { error: parentError } = await supabase
          .from('goals')
          .update({ completed: false })
          .eq('id', parentId);

        if (parentError) throw parentError;
      }

      await queryClient.invalidateQueries({ queryKey: ['goals'] });

      toast({
        title: isCompleted ? "Sous-objectif non complété" : "Sous-objectif complété",
        description: isCompleted 
          ? "Le sous-objectif a été marqué comme non complété" 
          : "Le sous-objectif a été marqué comme complété",
      });

      return true;
    } catch (error) {
      console.error('Error toggling child goal completion:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du sous-objectif",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    toggleGoalCompletion,
    toggleChildGoalCompletion,
  };
};