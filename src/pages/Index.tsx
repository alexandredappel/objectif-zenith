import React, { useState } from 'react';
import { TaskCard } from '@/components/TaskCard';
import { CategoryHeader } from '@/components/CategoryHeader';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';

const MOCK_TASKS = {
  professional: [
    { id: 1, title: "Réunion d'équipe", duration: 60, progress: 0 },
    { id: 2, title: "Revue de code", duration: 90, progress: 30 },
  ],
  personal: [
    { id: 3, title: "Séance de sport", duration: 45, progress: 100 },
    { id: 4, title: "Lecture", duration: 30, progress: 50 },
  ],
};

const Index = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bonjour 👋</h1>
        <p className="text-gray-600">Voici vos objectifs du jour</p>
      </header>

      <main className="max-w-3xl mx-auto space-y-8">
        <section>
          <CategoryHeader 
            title="Professionnel" 
            count={MOCK_TASKS.professional.length} 
          />
          <div className="grid gap-4 md:grid-cols-2">
            {MOCK_TASKS.professional.map((task) => (
              <TaskCard
                key={task.id}
                title={task.title}
                duration={task.duration}
                progress={task.progress}
                category="professional"
              />
            ))}
          </div>
        </section>

        <section>
          <CategoryHeader 
            title="Personnel" 
            count={MOCK_TASKS.personal.length} 
          />
          <div className="grid gap-4 md:grid-cols-2">
            {MOCK_TASKS.personal.map((task) => (
              <TaskCard
                key={task.id}
                title={task.title}
                duration={task.duration}
                progress={task.progress}
                category="personal"
              />
            ))}
          </div>
        </section>
      </main>

      <FloatingActionButton onClick={() => setCreateDialogOpen(true)} />
      <CreateTaskDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default Index;