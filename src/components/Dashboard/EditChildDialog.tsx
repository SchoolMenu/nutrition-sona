import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Child {
  id: string;
  name: string;
  grade: string;
  allergies: string[];
}

interface EditChildDialogProps {
  child: Child;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChildUpdated: () => void;
}

export const EditChildDialog = ({ child, open, onOpenChange, onChildUpdated }: EditChildDialogProps) => {
  const [allergies, setAllergies] = useState<string[]>(child.allergies || []);
  const [newAllergy, setNewAllergy] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy("");
    }
  };

  const removeAllergy = (allergyToRemove: string) => {
    setAllergies(allergies.filter(allergy => allergy !== allergyToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('children')
        .update({ allergies })
        .eq('id', child.id);

      if (error) {
        throw error;
      }

      onChildUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating child:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редагувати профіль - {child.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Алергії та харчові обмеження</Label>
            
            <div className="flex gap-2">
              <Input
                placeholder="Додати алергію..."
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAllergy();
                  }
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addAllergy}
                disabled={!newAllergy.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border border-input rounded-md bg-background">
              {allergies.length > 0 ? (
                allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="text-sm">
                    {allergy}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-transparent"
                      onClick={() => removeAllergy(allergy)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">Немає алергій</span>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Скасувати
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Збереження...' : 'Зберегти'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};