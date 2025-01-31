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
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";

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

      setTitle("");
      setSelectedStartDate(new Date());
      setCategory("professional");
      setSelectedParentId(null);
      onOpenChange(false);
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