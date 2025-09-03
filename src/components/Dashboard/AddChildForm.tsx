import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface AddChildFormProps {
  onSubmit: (data: ChildFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface ChildFormData {
  name: string;
  grade: string;
  allergies: string[];
}

const gradeOptions = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"
];

const commonAllergies = [
  "Молочні продукти", "Яйця", "Горіхи", "Глютен", "Риба", "Морепродукти", "Соя", "Мед"
];

export const AddChildForm = ({ onSubmit, isSubmitting }: AddChildFormProps) => {
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<ChildFormData>({
    defaultValues: {
      name: "",
      grade: "",
      allergies: []
    }
  });

  const selectedGrade = watch("grade");

  const addAllergy = (allergy: string) => {
    if (allergy && !allergies.includes(allergy)) {
      const updatedAllergies = [...allergies, allergy];
      setAllergies(updatedAllergies);
      setValue("allergies", updatedAllergies);
      setNewAllergy("");
    }
  };

  const removeAllergy = (allergyToRemove: string) => {
    const updatedAllergies = allergies.filter(a => a !== allergyToRemove);
    setAllergies(updatedAllergies);
    setValue("allergies", updatedAllergies);
  };

  const handleFormSubmit = async (data: ChildFormData) => {
    const formData = {
      ...data,
      allergies
    };
    
    await onSubmit(formData);
    
    // Reset form
    reset();
    setAllergies([]);
    setNewAllergy("");
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Ім'я дитини *</Label>
        <Input
          id="name"
          placeholder="Введіть ім'я дитини"
          {...register("name", { 
            required: "Ім'я є обов'язковим",
            minLength: { value: 2, message: "Ім'я повинно містити принаймні 2 символи" }
          })}
          className="w-full"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Grade Field */}
      <div className="space-y-2">
        <Label htmlFor="grade">Клас *</Label>
        <Select 
          value={selectedGrade} 
          onValueChange={(value) => setValue("grade", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Оберіть клас" />
          </SelectTrigger>
          <SelectContent>
            {gradeOptions.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade} клас
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.grade && (
          <p className="text-sm text-destructive">{errors.grade.message}</p>
        )}
      </div>

      {/* Allergies Field */}
      <div className="space-y-2">
        <Label>Алергії (необов'язково)</Label>
        
        {/* Current Allergies */}
        {allergies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {allergies.map((allergy) => (
              <Badge key={allergy} variant="secondary" className="text-sm">
                {allergy}
                <button
                  type="button"
                  onClick={() => removeAllergy(allergy)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Common Allergies */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Часті алергії:</p>
          <div className="flex flex-wrap gap-2">
            {commonAllergies.map((allergy) => (
              <Button
                key={allergy}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addAllergy(allergy)}
                disabled={allergies.includes(allergy)}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                {allergy}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Allergy Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Додати власну алергію"
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addAllergy(newAllergy);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => addAllergy(newAllergy)}
            disabled={!newAllergy.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Додавання..." : "Додати дитину"}
      </Button>
    </form>
  );
};