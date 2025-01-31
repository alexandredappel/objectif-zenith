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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, PlusCircle, MinusCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "quarterly" | "monthly" | "weekly" | "daily";
}

interface SubGoal {
  id: string;
  title: string;
}

export const CreateTaskDialog = ({ open, onOpenChange, type = "daily" }: CreateTaskDialogProps) => {
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState<"professional" | "personal">("professional");
  const [title, setTitle] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"quarterly" | "monthly" | "weekly" | "daily">(type);
  const [subGoals, setSubGoals] = useState<SubGoal[]>([]);
  const [newSubGoal, setNewSubGoal] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  useEffect(() => {
    setSelectedType(type);
  }, [type]);

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

  const handleAddSubGoal = () => {
    if (!newSubGoal.trim()) return;
    
    setSubGoals([...subGoals, {
      id: crypto.randomUUID(),
      title: newSubGoal.trim()
    }]);
    setNewSubGoal("");
  };

  const handleRemoveSubGoal = (id: string) => {
    setSubGoals(subGoals.filter(goal => goal.id !== id));
  };

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
      // Create main goal
      const { data: mainGoal, error: mainError } = await supabase
        .from('goals')
        .insert({
          title,
          type: selectedType,
          category,
          start_date: selectedStartDate.toISOString(),
          parent_id: selectedParentId,
        })
        .select()
        .single();

      if (mainError) throw mainError;

      // Create sub-goals if any
      if (subGoals.length > 0) {
        const { error: subGoalsError } = await supabase
          .from('goals')
          .insert(
            subGoals.map(subGoal => ({
              title: subGoal.title,
              type: selectedType,
              category,
              start_date: selectedStartDate.toISOString(),
              parent_id: mainGoal.id,
            }))
          );

        if (subGoalsError) throw subGoalsError;
      }

      toast({
        title: "Succès",
        description: "L'objectif et ses sous-objectifs ont été créés avec succès",
      });

      setTitle("");
      setSelectedStartDate(new Date());
      setCategory("professional");
      setSelectedParentId(null);
      setSubGoals([]);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['goals'] });

    } catch (error) {
      console.error('Error creating goals:', error);
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
      <DialogContent className={`${isMobile ? 'w-[95vw] h-[90vh]' : 'w-[60vw] h-[80vh]'} p-0 flex flex-col`}>
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold">
            Nouvel objectif
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="grid gap-4 py-4">
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
              <Label>Type d'objectif</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={category === "professional" ? "default" : "outline"}
                  onClick={() => setCategory("professional")}
                  className={`flex-grow sm:flex-grow-0 ${
                    category === "professional" ? "bg-gradient-to-r from-professional to-professional-light" : ""
                  }`}
                >
                  Professionnel
                </Button>
                <Button
                  variant={category === "personal" ? "default" : "outline"}
                  onClick={() => setCategory("personal")}
                  className={`flex-grow sm:flex-grow-0 ${
                    category === "personal" ? "bg-gradient-to-r from-personal to-personal-light" : ""
                  }`}
                >
                  Personnel
                </Button>
              </div>
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
                      setSelectedParentId(null);
                    }}
                    className={`flex-grow sm:flex-grow-0 ${
                      selectedType === period.value ? "bg-gradient-to-r from-professional to-personal" : ""
                    }`}
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
                            ? "bg-gradient-to-r from-professional to-professional-light"
                            : "bg-gradient-to-r from-personal to-personal-light"
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedStartDate ? (
                        format(selectedStartDate, "PPP", { locale: fr })
                      ) : (
                        <span>Choisir une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedStartDate}
                      onSelect={setSelectedStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="space-y-2 pt-4">
              <Label>Sous-objectifs</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un sous-objectif"
                  value={newSubGoal}
                  onChange={(e) => setNewSubGoal(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubGoal();
                    }
                  }}
                />
                <Button
                  onClick={handleAddSubGoal}
                  variant="outline"
                  size="icon"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              {subGoals.length > 0 && (
                <div className="space-y-2 mt-2">
                  {subGoals.map((subGoal) => (
                    <div
                      key={subGoal.id}
                      className="flex items-center justify-between p-2 rounded bg-gray-100 dark:bg-gray-800"
                    >
                      <span className="text-sm">{subGoal.title}</span>
                      <Button
                        onClick={() => handleRemoveSubGoal(subGoal.id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <MinusCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-center gap-2 p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-professional to-personal"
          >
            Créer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};