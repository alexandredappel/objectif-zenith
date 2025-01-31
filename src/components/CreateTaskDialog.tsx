import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar } from "./ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { supabase } from "@/lib/supabase";
import { useToast } from "./ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "quarterly" | "monthly" | "weekly" | "daily";
}

export const CreateTaskDialog = ({ open, onOpenChange, type = "daily" }: CreateTaskDialogProps) => {
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState<"professional" | "personal">("professional");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log("CreateTaskDialog rendered with type:", type);

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
      const { error } = await supabase.from('goals').insert({
        title,
        type,
        category,
        minutes: parseInt(duration),
        start_date: selectedStartDate.toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'objectif a été créé avec succès",
      });

      // Reset form
      setTitle("");
      setDuration("");
      setSelectedStartDate(new Date());
      setCategory("professional");
      
      // Close dialog
      onOpenChange(false);
      
      // Invalidate queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ['goals'] });

    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'objectif",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Nouvel objectif
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Type d'objectif</Label>
            <RadioGroup
              defaultValue={category}
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
            <Select defaultValue={type}>
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
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            Créer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};