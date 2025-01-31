import { Plus } from "lucide-react";
import { Button } from "./ui/button";

export const FloatingActionButton = ({
  onClick,
}: {
  onClick: () => void;
}) => {
  return (
    <Button
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-professional to-personal shadow-lg hover:shadow-xl transition-shadow"
      size="icon"
      onClick={onClick}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};