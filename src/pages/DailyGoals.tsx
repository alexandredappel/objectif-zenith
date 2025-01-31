import { useState } from "react";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { EditTaskDialog } from "@/components/EditTaskDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskCard } from "@/components/TaskCard";

const DailyGoals = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', 'daily'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('type', 'daily')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const professionalGoals = goals?.filter(goal => goal.category === 'professional') || [];
  const personalGoals = goals?.filter(goal => goal.category === 'personal') || [];

  console.log('DailyGoals rendered:', { goals });

  const handleGoalClick = (goal: any) => {
    setSelectedGoal(goal);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Objectifs du jour</h1>
        <p className="text-gray-600">Gérez vos tâches quotidiennes</p>
      </header>

      <main className="max-w-3xl mx-auto space-y-8">
        {isLoading ? (
          <p>Chargement...</p>
        ) : (
          <>
            {professionalGoals.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Objectifs professionnels</h2>
                <div className="space-y-4">
                  {professionalGoals.map((goal) => (
                    <TaskCard
                      key={goal.id}
                      id={goal.id}
                      title={goal.title}
                      category={goal.category as "professional" | "personal"}
                      completed={goal.completed}
                      onClick={() => handleGoalClick(goal)}
                      type={goal.type as "quarterly" | "monthly" | "weekly" | "daily"}
                    />
                  ))}
                </div>
              </div>
            )}

            {personalGoals.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Objectifs personnels</h2>
                <div className="space-y-4">
                  {personalGoals.map((goal) => (
                    <TaskCard
                      key={goal.id}
                      id={goal.id}
                      title={goal.title}
                      category={goal.category as "professional" | "personal"}
                      completed={goal.completed}
                      onClick={() => handleGoalClick(goal)}
                      type={goal.type as "quarterly" | "monthly" | "weekly" | "daily"}
                    />
                  ))}
                </div>
              </div>
            )}

            {goals?.length === 0 && (
              <p className="text-gray-500">Aucun objectif pour aujourd'hui</p>
            )}
          </>
        )}
      </main>

      <FloatingActionButton onClick={() => setIsCreateDialogOpen(true)} />
      <CreateTaskDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        type="daily"
      />
      {selectedGoal && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          goal={selectedGoal}
        />
      )}
    </div>
  );
};

export default DailyGoals;