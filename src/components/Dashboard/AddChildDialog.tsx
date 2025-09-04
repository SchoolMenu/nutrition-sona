import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddChildForm, type ChildFormData } from "./AddChildForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";

interface AddChildDialogProps {
  onChildAdded: () => void;
}

export const AddChildDialog = ({ onChildAdded }: AddChildDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (data: ChildFormData) => {
    if (!user) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('children')
        .insert({
          name: data.name,
          grade: data.grade,
          allergies: data.allergies,
          parent_id: user.id
        });

      if (error) {
        throw error;
      }

      setOpen(false);
      onChildAdded();
    } catch (error) {
      console.error('Error adding child:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Додати дитину
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Додати нову дитину</DialogTitle>
          <DialogDescription>
            Заповніть інформацію про вашу дитину. Поля з * є обов'язковими.
          </DialogDescription>
        </DialogHeader>
        <AddChildForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};