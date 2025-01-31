import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar } from "./ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Switch } from "./ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: {
    id: string;
    title: string;
    type: "quarterly" | "monthly" | "weekly" | "daily";
    category: "professional" | "personal";
    minutes: number;
    start_date: string;
    completed: boolean;
    parent_id?: string | null;
  };
}

interface SubGoal {
  title: string;
  id?: string;
}

export const EditTaskDialog = ({ open, onOpenChange, goal }: EditTaskDialogProps) => {
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    new Date(goal.start_date)
  );
  const [category, setCategory] = useState<"professional" | "personal">(goal.category);
  const [title, setTitle] = useState(goal.title);
  const [duration, setDuration] = useState(String(goal.minutes));
  const [type, setType] = useState(goal.type);
  const [completed, setCompleted] = useState(goal.completed);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(goal.parent_id || null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [subGoals, setSubGoals] = useState<SubGoal[]>([]);
  const [newSubGoal, setNewSubGoal] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing sub-goals
  const { data: existingSubGoals } = useQuery({
    queryKey: ['goals', 'children', goal.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('parent_id', goal.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Initialize subGoals state with existing sub-goals
  useState(() => {
    if (existingSubGoals) {
      setSubGoals(existingSubGoals.map(g => ({ title: g.title, id: g.id })));
    }
  }, [existingSubGoals]);

  // Fetch potential parent goals
  const { data: parentGoals } = useQuery({
    queryKey: ['goals', 'parents', type],
    queryFn: async () => {
      let parentType;
      switch (type) {
        case 'monthly':
          parentType = 'quarterly';
          break;
        case 'weekly':
          parentType = 'monthly';
          break;
        case 'daily':
          parentType = 'weekly';
          break;
        default:
          return [];
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('type', parentType)
        .neq('id', goal.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: type !== 'quarterly',
  });

  const handleAddSubGoal = () => {
    if (!newSubGoal.trim()) return;
    setSubGoals([...subGoals, { title: newSubGoal.trim() }]);
    setNewSubGoal("");
  };

  const handleRemoveSubGoal = (index: number) => {
    setSubGoals(subGoals.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubGoal();
    }
  };

  const handleSubmit = async () => {
    if (!title || !duration || !selectedStartDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      // Start a transaction
      const { error: updateError } = await supabase
        .from('goals')
        .update({
          title,
          type,
          category,
          minutes: parseInt(duration),
          start_date: selectedStartDate.toISOString(),
          completed,
          parent_id: selectedParentId,
        })
        .eq('id', goal.id);

      if (updateError) throw updateError;

      // Handle sub-goals
      for (const subGoal of subGoals) {
        if (subGoal.id) {
          // Update existing sub-goal
          const { error: subGoalError } = await supabase
            .from('goals')
            .update({
              title: subGoal.title,
              type: getChildType(type),
              category,
              start_date: selectedStartDate.toISOString(),
            })
            .eq('id', subGoal.id);

          if (subGoalError) throw subGoalError;
        } else {
          // Create new sub-goal
          const { error: subGoalError } = await supabase
            .from('goals')
            .insert({
              title: subGoal.title,
              type: getChildType(type),
              category,
              start_date: selectedStartDate.toISOString(),
              parent_id: goal.id,
            });

          if (subGoalError) throw subGoalError;
        }
      }

      toast({
        title: "Succès",
        description: "L'objectif et ses sous-objectifs ont été modifiés avec succès",
      });
      
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['goals'] });

    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de l'objectif",
        variant: "destructive",
      });
    }
  };

  const getChildType = (parentType: string): "quarterly" | "monthly" | "weekly" | "daily" => {
    switch (parentType) {
      case 'quarterly':
        return 'monthly';
      case 'monthly':
        return 'weekly';
      case 'weekly':
        return 'daily';
      default:
        return 'daily';
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goal.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'objectif a été supprimé avec succès",
      });
      
      setShowDeleteDialog(false);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['goals'] });

    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'objectif",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Modifier l'objectif
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Type d'objectif</Label>
                <RadioGroup
                  value={category}
                  onValueChange={(value) => setCategory(value as "professional" | "personal")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="professional" id="professional" />
                    <Label htmlFor="professional">Professionnel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="personal" id="personal" />
                    <Label htmlFor="personal">Personnel</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input 
                  id="title" 
                  placeholder="Nom de l'objectif" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Durée (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="60"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Type de période</Label>
                <Select value={type} onValueChange={(value) => setType(value as typeof goal.type)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Trimestriel</SelectItem>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="daily">Journalier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type !== 'quarterly' && parentGoals && parentGoals.length > 0 && (
                <div className="space-y-2">
                  <Label>Objectif parent</Label>
                  <Select value={selectedParentId || ''} onValueChange={setSelectedParentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un objectif parent" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentGoals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Date de début</Label>
                <Calendar
                  mode="single"
                  selected={selectedStartDate}
                  onSelect={setSelectedStartDate}
                  className="rounded-md border"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="completed"
                  checked={completed}
                  onCheckedChange={setCompleted}
                />
                <Label htmlFor="completed">Marqué comme complété</Label>
              </div>

              <div className="space-y-4">
                <Label>Sous-objectifs</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ajouter un sous-objectif"
                    value={newSubGoal}
                    onChange={(e) => setNewSubGoal(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button
                    onClick={handleAddSubGoal}
                    size="icon"
                    className="bg-gradient-to-r from-professional to-personal"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {subGoals.length > 0 && (
                  <div className="space-y-2">
                    {subGoals.map((subGoal, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                        <span className="flex-1">{subGoal.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSubGoal(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
            >
              Supprimer
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-gradient-to-r from-professional to-personal"
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement votre objectif.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};