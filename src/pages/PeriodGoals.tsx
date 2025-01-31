import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";

const PeriodGoals = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<"quarterly" | "monthly" | "weekly">("quarterly");

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
            <p className="text-gray-500">Objectifs trimestriels à venir...</p>
          </TabsContent>
          <TabsContent value="monthly" className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">Objectifs mensuels à venir...</p>
          </TabsContent>
          <TabsContent value="weekly" className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">Objectifs hebdomadaires à venir...</p>
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