import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGoalManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const checkAndUpdateParentGoal = async (parentId: string) => {
    console.log('Checking parent goal:', parentId);
    
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

  const updateChildrenGoals = async (goalId: string, completed: boolean) => {
    console.log('Updating children goals:', { goalId, completed });

    // First, get all direct children
    const { data: childGoals, error: fetchError } = await supabase
      .from('goals')
      .select('id')
      .eq('parent_id', goalId);

    if (fetchError) {
      console.error('Error fetching child goals:', fetchError);
      return;
    }

    if (!childGoals || childGoals.length === 0) {
      return;
    }

    // Update all children
    const { error: updateError } = await supabase
      .from('goals')
      .update({ completed })
      .in('id', childGoals.map(child => child.id));

    if (updateError) {
      console.error('Error updating child goals:', updateError);
      return;
    }

    // Recursively update grandchildren
    for (const child of childGoals) {
      await updateChildrenGoals(child.id, completed);
    }
  };

  const toggleGoalCompletion = async (
    goalId: string, 
    currentStatus: boolean,
    childGoals?: { id: string; completed: boolean; parent_id: string | null }[] | null
  ) => {
    console.log('Toggling goal completion:', { goalId, currentStatus, hasChildren: !!childGoals?.length });
    
    try {
      // Update the goal itself
      const { data: updatedGoal, error: updateError } = await supabase
        .from('goals')
        .update({ completed: !currentStatus })
        .eq('id', goalId)
        .select('parent_id')
        .single();

      if (updateError) throw updateError;

      // If we're unchecking a goal, update all its children recursively
      if (currentStatus) {
        await updateChildrenGoals(goalId, false);
      }
      // If we're checking a goal and it has children, update them all
      else if (!currentStatus && childGoals && childGoals.length > 0) {
        await updateChildrenGoals(goalId, true);
      }

      // If this goal has a parent, check if we need to update its status
      if (updatedGoal?.parent_id) {
        await checkAndUpdateParentGoal(updatedGoal.parent_id);
      }

      await queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'goals'
      });

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

      // If we're unchecking the child, update its children recursively
      if (isCompleted) {
        await updateChildrenGoals(childId, false);
      }

      // Check and update the parent goal's status
      await checkAndUpdateParentGoal(parentId);

      await queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'goals'
      });

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