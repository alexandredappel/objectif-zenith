import { useState } from "react";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";

const DailyGoals = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Objectifs du jour</h1>
        <p className="text-gray-600">Gérez vos tâches quotidiennes</p>
      </header>

      <main className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Contenu à venir...</p>
        </div>
      </main>

      <FloatingActionButton onClick={() => setIsCreateDialogOpen(true)} />
      <CreateTaskDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        type="daily"
      />
    </div>
  );
};

export default DailyGoals;