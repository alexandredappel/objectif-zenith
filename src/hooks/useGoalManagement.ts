import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGoalManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const checkAndUpdateParentGoal = async (parentId: string) => {
    console.log('Checking parent goal:', parentId);
    
    // Vérifier d'abord si le parent existe toujours
    const { data: parentExists, error: existsError } = await supabase
      .from('goals')
      .select('id')
      .eq('id', parentId)
      .single();

    if (existsError || !parentExists) {
      console.log('Parent goal no longer exists:', parentId);
      return;
    }
    
    // Fetch all child goals for this parent
    const { data: childGoals, error: childError } = await supabase
      .from('goals')
      .select('*')
      .eq('parent_id', parentId);

    if (childError) {
      console.error('Error fetching child goals:', childError);
      return;
    }

    // If all child goals are completed, mark parent as completed
    const allCompleted = childGoals?.every(goal => goal.completed) ?? false;
    
    // Update the parent goal
    const { data: parentData, error: parentUpdateError } = await supabase
      .from('goals')
      .update({ completed: allCompleted })
      .eq('id', parentId)
      .select('parent_id')
      .single();

    if (parentUpdateError) {
      console.error('Error updating parent goal:', parentUpdateError);
      return;
    }

    // If this parent has its own parent, recursively check that one too
    if (parentData?.parent_id) {
      await checkAndUpdateParentGoal(parentData.parent_id);
    }
  };

  const toggleGoalCompletion = async (
    goalId: string, 
    currentStatus: boolean,
    childGoals?: { id: string; completed: boolean; parent_id: string | null }[] | null
  ) => {
    console.log('Toggling goal completion:', { goalId, currentStatus, hasChildren: !!childGoals?.length });
    
    try {
      // Update parent goal
      const { data: updatedGoal, error: parentError } = await supabase
        .from('goals')
        .update({ completed: !currentStatus })
        .eq('id', goalId)
        .select('parent_id')
        .single();

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

      // If this goal has a parent, check if we need to update its status
      if (updatedGoal?.parent_id) {
        await checkAndUpdateParentGoal(updatedGoal.parent_id);
      }

      // Invalidate all goals queries to ensure fresh data
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

      // Check and update the parent goal's status
      await checkAndUpdateParentGoal(parentId);

      // Invalidate all goals queries to ensure fresh data
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