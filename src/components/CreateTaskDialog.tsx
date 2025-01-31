import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar } from "./ui/calendar";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "quarterly" | "monthly" | "weekly" | "daily";
}

export const CreateTaskDialog = ({ open, onOpenChange, type = "daily" }: CreateTaskDialogProps) => {
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState<"professional" | "personal">("professional");

  console.log("CreateTaskDialog rendered with type:", type);

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
            <Input id="title" placeholder="Nom de l'objectif" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Description de l'objectif" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durée (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              placeholder="60"
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

          <div className="space-y-2">
            <Label>Date de fin</Label>
            <Calendar
              mode="single"
              selected={selectedEndDate}
              onSelect={setSelectedEndDate}
              className="rounded-md border"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Créer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};