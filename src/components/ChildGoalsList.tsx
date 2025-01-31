import { Check } from "lucide-react";

interface ChildGoalsListProps {
  childGoals: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  onToggleChild: (childId: string, isCompleted: boolean, e: React.MouseEvent) => void;
}

export const ChildGoalsList = ({ childGoals, onToggleChild }: ChildGoalsListProps) => {
  if (!childGoals || childGoals.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="h-px bg-white/20 mb-3"></div>
      {childGoals.map((child) => (
        <div key={child.id} 
          className="flex items-center justify-between py-1 px-2 rounded bg-white/10">
          <span className="text-sm text-white">{child.title}</span>
          <button
            onClick={(e) => onToggleChild(child.id, child.completed, e)}
            className={`rounded-full p-1.5 transition-colors ${
              child.completed ? 'bg-white' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <Check className={`h-3 w-3 ${child.completed ? 'text-green-500' : 'text-white'}`} />
          </button>
        </div>
      ))}
    </div>
  );
};