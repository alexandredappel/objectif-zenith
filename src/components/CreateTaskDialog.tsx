import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
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
  const [selectedType, setSelectedType] = useState<"quarterly" | "monthly" | "weekly" | "daily">(type);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  console.log("CreateTaskDialog rendered with type:", type);

  // Update selectedType when type prop changes
  useEffect(() => {
    setSelectedType(type);
  }, [type]);

  // Determine parent type based on selected type
  const getParentType = (currentType: string) => {
    switch (currentType) {
      case 'monthly':
        return 'quarterly';
      case 'weekly':
        return 'monthly';
      case 'daily':
        return 'weekly';
      default:
        return null;
    }
  };

  // Fetch potential parent goals based on the selected type
  const { data: parentGoals } = useQuery({
    queryKey: ['goals', 'parents', selectedType],
    queryFn: async () => {
      const parentType = getParentType(selectedType);
      if (!parentType) return [];

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('type', parentType)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: selectedType !== 'quarterly',
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
        type: selectedType,
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

  const periodTypes = [
    { value: "quarterly", label: "Trimestriel" },
    { value: "monthly", label: "Mensuel" },
    { value: "weekly", label: "Hebdomadaire" },
    { value: "daily", label: "Journalier" },
  ];

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
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={category === "professional" ? "default" : "outline"}
                  onClick={() => setCategory("professional")}
                  className={`flex-grow sm:flex-grow-0 ${
                    category === "professional" ? "bg-professional" : ""
                  }`}
                >
                  Professionnel
                </Button>
                <Button
                  variant={category === "personal" ? "default" : "outline"}
                  onClick={() => setCategory("personal")}
                  className={`flex-grow sm:flex-grow-0 ${
                    category === "personal" ? "bg-personal" : ""
                  }`}
                >
                  Personnel
                </Button>
              </div>
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
              <div className="flex flex-wrap gap-2">
                {periodTypes.map((period) => (
                  <Button
                    key={period.value}
                    variant={selectedType === period.value ? "default" : "outline"}
                    onClick={() => {
                      setSelectedType(period.value as typeof selectedType);
                      setSelectedParentId(null); // Reset parent selection when period type changes
                    }}
                    className="flex-grow sm:flex-grow-0"
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>

            {selectedType !== 'quarterly' && parentGoals && parentGoals.length > 0 && (
              <div className="space-y-2">
                <Label>Objectif parent</Label>
                <div className="flex flex-wrap gap-2">
                  {parentGoals.map((goal) => (
                    <Button
                      key={goal.id}
                      variant={selectedParentId === goal.id ? "default" : "outline"}
                      onClick={() => setSelectedParentId(goal.id)}
                      className={`flex-grow sm:flex-grow-0 ${
                        selectedParentId === goal.id
                          ? goal.category === "professional"
                            ? "bg-professional"
                            : "bg-personal"
                          : ""
                      }`}
                    >
                      {goal.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedType === "daily" && (
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Calendar
                  mode="single"
                  selected={selectedStartDate}
                  onSelect={setSelectedStartDate}
                  className="rounded-md border"
                />
              </div>
            )}
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