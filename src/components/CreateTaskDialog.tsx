import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar } from "./ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { ScrollArea } from "./ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "quarterly" | "monthly" | "weekly" | "daily";
}

export const CreateTaskDialog = ({ open, onOpenChange, type = "daily" }: CreateTaskDialogProps) => {
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState<"professional" | "personal">("professional");
  const [title, setTitle] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  console.log("CreateTaskDialog rendered with type:", type);

  // Fetch potential parent goals based on the selected type
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
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: type !== 'quarterly', // Only fetch if we're not creating a quarterly goal
  });

  const handleSubmit = async () => {
    if (!title || !selectedStartDate) {
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
        start_date: selectedStartDate.toISOString(),
        parent_id: selectedParentId,
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'objectif a été créé avec succès",
      });

      // Reset form
      setTitle("");
      setSelectedStartDate(new Date());
      setCategory("professional");
      setSelectedParentId(null);
      
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
      <DialogContent className={`${isMobile ? 'w-[95vw] h-[90vh]' : 'w-[60vw] h-[80vh]'} p-0`}>
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold">
            Nouvel objectif
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full px-6">
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

            {type !== 'quarterly' && parentGoals && parentGoals.length > 0 && (
              <div className="space-y-2">
                <Label>Objectif parent</Label>
                <div className="flex flex-wrap gap-2">
                  {parentGoals.map((goal) => (
                    <Button
                      key={goal.id}
                      variant={selectedParentId === goal.id ? "default" : "outline"}
                      onClick={() => setSelectedParentId(goal.id)}
                      className="flex-grow sm:flex-grow-0"
                    >
                      {goal.title}
                    </Button>
                  ))}
                </div>
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
          </div>

          <div className="flex justify-end gap-2 py-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              Créer
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};