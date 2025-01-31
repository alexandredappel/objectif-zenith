import React from 'react';
import { TaskCard } from '@/components/TaskCard';
import { CategoryHeader } from '@/components/CategoryHeader';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  // Fetch daily tasks
  const { data: dailyTasks } = useQuery({
    queryKey: ['goals', 'daily'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('type', 'daily')
        .gte('start_date', today.toISOString())
        .lt('start_date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch weekly goals for progress
  const { data: weeklyGoals } = useQuery({
    queryKey: ['goals', 'weekly'],
    queryFn: async () => {
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('type', 'weekly')
        .gte('start_date', startOfWeek.toISOString())
        .lt('start_date', endOfWeek.toISOString());

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate weekly completion percentage
  const weeklyCompletionPercentage = React.useMemo(() => {
    if (!weeklyGoals || weeklyGoals.length === 0) return 0;
    const completedGoals = weeklyGoals.filter(goal => goal.completed).length;
    return Math.round((completedGoals / weeklyGoals.length) * 100);
  }, [weeklyGoals]);

  // Group daily tasks by category
  const professionalTasks = dailyTasks?.filter(task => task.category === 'professional') || [];
  const personalTasks = dailyTasks?.filter(task => task.category === 'personal') || [];

  console.log('Dashboard rendered:', { dailyTasks, weeklyGoals, weeklyCompletionPercentage });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bonjour 👋</h1>
            <p className="text-gray-600">
              {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold mb-1">Objectifs de la semaine</div>
            <div className="flex items-center gap-2">
              <Progress 
                value={weeklyCompletionPercentage} 
                className="w-32 h-2" 
              />
              <span className="text-sm font-medium">{weeklyCompletionPercentage}%</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto space-y-8">
        <section>
          <CategoryHeader 
            title="Professionnel" 
            count={professionalTasks.length} 
          />
          <div className="grid gap-4">
            {professionalTasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                category="professional"
                type="daily"
                completed={task.completed || false}
              />
            ))}
          </div>
        </section>

        <section>
          <CategoryHeader 
            title="Personnel" 
            count={personalTasks.length} 
          />
          <div className="grid gap-4">
            {personalTasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                category="personal"
                type="daily"
                completed={task.completed || false}
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