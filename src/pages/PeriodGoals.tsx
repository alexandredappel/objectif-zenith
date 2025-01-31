import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { EditTaskDialog } from "@/components/EditTaskDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskCard } from "@/components/TaskCard";

const PeriodGoals = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<"quarterly" | "monthly" | "weekly">("quarterly");
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', currentPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('type', currentPeriod)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  console.log('PeriodGoals rendered:', { currentPeriod, goals });

  const handleGoalClick = (goal: any) => {
    setSelectedGoal(goal);
    setIsEditDialogOpen(true);
  };

  const renderGoals = () => {
    if (isLoading) {
      return <p>Chargement...</p>;
    }

    if (!goals || goals.length === 0) {
      return <p className="text-gray-500">Aucun objectif pour cette période</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <TaskCard
            key={goal.id}
            id={goal.id}
            title={goal.title}
            duration={goal.minutes}
            progress={0}
            category={goal.category as "professional" | "personal"}
            completed={goal.completed}
            onClick={() => handleGoalClick(goal)}
            type={goal.type as "quarterly" | "monthly" | "weekly" | "daily"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Objectifs périodiques</h1>
        <p className="text-gray-600">Gérez vos objectifs à long terme</p>
      </header>

      <main className="max-w-3xl mx-auto">
        <Tabs 
          defaultValue="quarterly" 
          className="w-full"
          onValueChange={(value) => setCurrentPeriod(value as "quarterly" | "monthly" | "weekly")}
        >
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="quarterly">Trimestriels</TabsTrigger>
            <TabsTrigger value="monthly">Mensuels</TabsTrigger>
            <TabsTrigger value="weekly">Hebdomadaires</TabsTrigger>
          </TabsList>
          <TabsContent value="quarterly" className="bg-white rounded-lg shadow p-6">
            {renderGoals()}
          </TabsContent>
          <TabsContent value="monthly" className="bg-white rounded-lg shadow p-6">
            {renderGoals()}
          </TabsContent>
          <TabsContent value="weekly" className="bg-white rounded-lg shadow p-6">
            {renderGoals()}
          </TabsContent>
        </Tabs>
      </main>

      <FloatingActionButton onClick={() => setIsCreateDialogOpen(true)} />
      <CreateTaskDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        type={currentPeriod}
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

export default PeriodGoals;