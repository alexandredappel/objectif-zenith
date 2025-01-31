import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskCard } from "@/components/TaskCard";

const PeriodGoals = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<"quarterly" | "monthly" | "weekly">("quarterly");

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filterGoalsByType = (type: string) => {
    return goals?.filter(goal => goal.type === type) || [];
  };

  const renderGoals = (type: string) => {
    const filteredGoals = filterGoalsByType(type);
    
    if (isLoading) {
      return <p>Chargement...</p>;
    }

    if (filteredGoals.length === 0) {
      return <p className="text-gray-500">Aucun objectif pour cette période</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGoals.map((goal) => (
          <TaskCard
            key={goal.id}
            title={goal.title}
            duration={goal.minutes}
            progress={0}
            category={goal.category}
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
            {renderGoals("quarterly")}
          </TabsContent>
          <TabsContent value="monthly" className="bg-white rounded-lg shadow p-6">
            {renderGoals("monthly")}
          </TabsContent>
          <TabsContent value="weekly" className="bg-white rounded-lg shadow p-6">
            {renderGoals("weekly")}
          </TabsContent>
        </Tabs>
      </main>

      <FloatingActionButton onClick={() => setIsCreateDialogOpen(true)} />
      <CreateTaskDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        type={currentPeriod}
      />
    </div>
  );
};

export default PeriodGoals;