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
import { useQueryClient } from "@tanstack/react-query";

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
  };
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('EditTaskDialog rendered:', { goal, completed });

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
      const { error } = await supabase
        .from('goals')
        .update({
          title,
          type,
          category,
          minutes: parseInt(duration),
          start_date: selectedStartDate.toISOString(),
          completed,
        })
        .eq('id', goal.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'objectif a été modifié avec succès",
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Modifier l'objectif
            </DialogTitle>
          </DialogHeader>
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
          </div>

          <div className="flex justify-between">
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
              <Button onClick={handleSubmit}>
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