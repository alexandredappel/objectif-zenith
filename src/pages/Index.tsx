import React, { useState } from 'react';
import { TaskCard } from '@/components/TaskCard';
import { CategoryHeader } from '@/components/CategoryHeader';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';

const MOCK_TASKS = {
  professional: [
    { 
      id: "123e4567-e89b-12d3-a456-426614174000", 
      title: "Réunion d'équipe", 
      duration: 60, 
      progress: 0,
      type: "daily" as const
    },
    { 
      id: "123e4567-e89b-12d3-a456-426614174001", 
      title: "Revue de code", 
      duration: 90, 
      progress: 30,
      type: "daily" as const
    },
  ],
  personal: [
    { 
      id: "123e4567-e89b-12d3-a456-426614174002", 
      title: "Séance de sport", 
      duration: 45, 
      progress: 100,
      type: "daily" as const
    },
    { 
      id: "123e4567-e89b-12d3-a456-426614174003", 
      title: "Lecture", 
      duration: 30, 
      progress: 50,
      type: "daily" as const
    },
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
                id={task.id}
                title={task.title}
                duration={task.duration}
                progress={task.progress}
                category="professional"
                type={task.type}
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
                id={task.id}
                title={task.title}
                duration={task.duration}
                progress={task.progress}
                category="personal"
                type={task.type}
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