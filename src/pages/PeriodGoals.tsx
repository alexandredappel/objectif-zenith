import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { EditTaskDialog } from "@/components/EditTaskDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskCard } from "@/components/TaskCard";
import { format, startOfWeek, endOfWeek, getQuarter, setQuarter, startOfQuarter, endOfQuarter } from "date-fns";
import { fr } from "date-fns/locale";

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

  const professionalGoals = goals?.filter(goal => goal.category === 'professional') || [];
  const personalGoals = goals?.filter(goal => goal.category === 'personal') || [];

  console.log('PeriodGoals rendered:', { currentPeriod, goals });

  const handleGoalClick = (goal: any) => {
    setSelectedGoal(goal);
    setIsEditDialogOpen(true);
  };

  const getCurrentPeriodLabel = () => {
    const now = new Date();
    
    switch (currentPeriod) {
      case "quarterly": {
        const quarter = getQuarter(now);
        const quarterStart = startOfQuarter(now);
        const quarterEnd = endOfQuarter(now);
        return `${format(quarterStart, 'MMMM', { locale: fr })} - ${format(quarterEnd, 'MMMM', { locale: fr })}`;
      }
      case "monthly":
        return format(now, 'MMMM', { locale: fr });
      case "weekly": {
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        return `Du ${format(weekStart, 'dd/MM')} au ${format(weekEnd, 'dd/MM')}`;
      }
      default:
        return "";
    }
  };

  const renderGoals = () => {
    if (isLoading) {
      return <p>Chargement...</p>;
    }

    if (!goals || goals.length === 0) {
      return <p className="text-gray-500">Aucun objectif pour cette période</p>;
    }

    return (
      <div className="space-y-8">
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
          <div className="flex justify-between items-center mb-6">
            <TabsList className="justify-start">
              <TabsTrigger value="quarterly">Trimestriels</TabsTrigger>
              <TabsTrigger value="monthly">Mensuels</TabsTrigger>
              <TabsTrigger value="weekly">Hebdomadaires</TabsTrigger>
            </TabsList>
            <span className="text-gray-600 font-medium">{getCurrentPeriodLabel()}</span>
          </div>
          
          <TabsContent value="quarterly">
            {renderGoals()}
          </TabsContent>
          <TabsContent value="monthly">
            {renderGoals()}
          </TabsContent>
          <TabsContent value="weekly">
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