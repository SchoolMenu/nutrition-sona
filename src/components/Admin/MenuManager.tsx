import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Save, Calendar, Loader2, Lightbulb } from "lucide-react";
import { MenuItem, DayMenu, allergensList } from "@/data/menuData";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useDishSuggestions } from "@/hooks/useDishSuggestions";
interface MenuManagerProps {
  weekMenu: DayMenu[];
  onUpdateMenu: (dayIndex: number, updatedDay: DayMenu) => void;
}
export const MenuManager = ({
  weekMenu,
  onUpdateMenu
}: MenuManagerProps) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const {
    saving,
    saveMenuToDatabase
  } = useMenuItems();
  const {
    findSimilarDish,
    loading: suggestionLoading
  } = useDishSuggestions();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    allergens: [] as string[],
    category: "meal1" as 'meal1' | 'meal2' | 'side'
  });

  // Auto-fill price based on similar dish name
  useEffect(() => {
    const searchSimilarDish = async () => {
      if (formData.name.trim().length >= 3 && !editingItem) {
        const similarDish = await findSimilarDish(formData.name);
        if (similarDish && similarDish.name.toLowerCase() !== formData.name.toLowerCase()) {
          setShowSuggestion(true);
        } else {
          setShowSuggestion(false);
        }
      } else {
        setShowSuggestion(false);
      }
    };
    const debounceTimer = setTimeout(searchSimilarDish, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.name, editingItem, findSimilarDish]);
  const applySuggestion = async () => {
    const similarDish = await findSimilarDish(formData.name);
    if (similarDish) {
      setFormData(prev => ({
        ...prev,
        price: similarDish.price,
        description: similarDish.description,
        allergens: [...similarDish.allergens]
      }));
      setShowSuggestion(false);
    }
  };
  const handleSaveToDatabase = async () => {
    await saveMenuToDatabase(weekMenu);
  };
  const openEditDialog = (item?: MenuItem, category?: 'meal1' | 'meal2' | 'side') => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        allergens: [...item.allergens],
        category: item.category
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        allergens: [],
        category: category || "meal1"
      });
    }
    setShowSuggestion(false);
    setIsDialogOpen(true);
  };
  const handleAllergenToggle = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen) ? prev.allergens.filter(a => a !== allergen) : [...prev.allergens, allergen]
    }));
  };
  const handleSaveItem = () => {
    const newItem: MenuItem = {
      id: editingItem?.id || `new_${Date.now()}`,
      ...formData
    };
    const currentDay = weekMenu[selectedDay];
    const updatedDay = {
      ...currentDay
    };
    if (editingItem) {
      // Update existing item
      const categoryKey = `${formData.category}Options` as keyof DayMenu;
      const categoryItems = updatedDay[categoryKey] as MenuItem[];
      const itemIndex = categoryItems.findIndex(item => item.id === editingItem.id);
      if (itemIndex >= 0) {
        categoryItems[itemIndex] = newItem;
      }
    } else {
      // Add new item
      const categoryKey = `${formData.category}Options` as keyof DayMenu;
      (updatedDay[categoryKey] as MenuItem[]).push(newItem);
    }
    onUpdateMenu(selectedDay, updatedDay);
    setIsDialogOpen(false);
  };
  const handleDeleteItem = (itemId: string, category: 'meal1' | 'meal2' | 'side') => {
    const currentDay = weekMenu[selectedDay];
    const updatedDay = {
      ...currentDay
    };
    const categoryKey = `${category}Options` as keyof DayMenu;
    const categoryItems = updatedDay[categoryKey] as MenuItem[];
    const filteredItems = categoryItems.filter(item => item.id !== itemId);
    (updatedDay[categoryKey] as MenuItem[]) = filteredItems;
    onUpdateMenu(selectedDay, updatedDay);
  };
  const renderMenuItems = (items: MenuItem[], category: 'meal1' | 'meal2' | 'side') => <div className="space-y-3">
      {items.map(item => <Card key={item.id} className="border-card-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{item.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm font-medium text-primary">₴{item.price}</span>
                  {item.allergens.length > 0 && <div className="flex flex-wrap gap-1">
                      {item.allergens.map((allergen, idx) => <Badge key={idx} variant="secondary" className="text-xs">
                          {allergen}
                        </Badge>)}
                    </div>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id, category)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>)}
      <Button variant="outline" className="w-full" onClick={() => openEditDialog(undefined, category)}>
        <Plus className="h-4 w-4 mr-2" />
        Додати страву
      </Button>
    </div>;
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Управління меню</h2>
          <p className="text-muted-foreground">Редагування тижневого меню школи</p>
        </div>
        <Button variant="default" onClick={handleSaveToDatabase} disabled={saving}>
          {saving ? <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Збереження...
            </> : <>
              <Save className="h-4 w-4 mr-2" />
              Зберегти зміни
            </>}
        </Button>
      </div>

      {/* Day selector */}
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Вибір дня тижня
          </CardTitle>
        </CardHeader>
        <CardContent className="py-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {weekMenu.map((day, index) => <Button key={index} variant={selectedDay === index ? "default" : "outline"} onClick={() => setSelectedDay(index)} className="flex flex-col gap-1 h-auto py-2 text-center">
                <span className="font-medium text-xs sm:text-sm">{day.dayName}</span>
                <span className="text-xs opacity-70">
                  {new Date(day.date).toLocaleDateString('uk-UA', {
                day: 'numeric',
                month: 'short'
              })}
                </span>
              </Button>)}
          </div>
        </CardContent>
      </Card>

      {/* Menu editor */}
      <Tabs defaultValue="meal1" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1">
          <TabsTrigger value="meal1" className="text-xs sm:text-sm my-0 py-0 px-[6px]">Перша страва</TabsTrigger>
          <TabsTrigger value="meal2" className="text-xs sm:text-sm py-0">Друга страва</TabsTrigger>
          <TabsTrigger value="side" className="text-xs sm:text-sm py-0">Додатково</TabsTrigger>
        </TabsList>
        
        <TabsContent value="meal1" className="mt-4">
          {renderMenuItems(weekMenu[selectedDay].meal1Options, 'meal1')}
        </TabsContent>
        
        <TabsContent value="meal2" className="mt-4">
          {renderMenuItems(weekMenu[selectedDay].meal2Options, 'meal2')}
        </TabsContent>
        
        <TabsContent value="side" className="mt-4">
          {renderMenuItems(weekMenu[selectedDay].sideOptions, 'side')}
        </TabsContent>
      </Tabs>

      {/* Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Редагувати страву" : "Додати нову страву"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Назва страви</Label>
              <div className="relative">
                <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({
                ...prev,
                name: e.target.value
              }))} placeholder="Наприклад: Борщ український" />
                {showSuggestion && !suggestionLoading && <div className="absolute top-full left-0 right-0 z-[5] mt-1 p-3 bg-card border border-border rounded-md shadow-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Lightbulb className="h-4 w-4" />
                      <span>Знайдено схожу страву</span>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={applySuggestion} className="w-full text-left justify-start">
                      Використати дані з схожої страви
                    </Button>
                  </div>}
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Опис</Label>
              <Textarea id="description" value={formData.description} onChange={e => setFormData(prev => ({
              ...prev,
              description: e.target.value
            }))} placeholder="Детальний опис страви та інгредієнтів" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Ціна (₴)</Label>
                <Input id="price" type="number" value={formData.price} onChange={e => setFormData(prev => ({
                ...prev,
                price: Number(e.target.value)
              }))} />
              </div>
              
              <div>
                <Label htmlFor="category">Категорія</Label>
                <Select value={formData.category} onValueChange={(value: 'meal1' | 'meal2' | 'side') => setFormData(prev => ({
                ...prev,
                category: value
              }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meal1">Перша страва</SelectItem>
                    <SelectItem value="meal2">Друга страва</SelectItem>
                    <SelectItem value="side">Додатково</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Алергени</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {allergensList.map(allergen => <div key={allergen} className="flex items-center space-x-2">
                    <Checkbox id={allergen} checked={formData.allergens.includes(allergen)} onCheckedChange={() => handleAllergenToggle(allergen)} />
                    <Label htmlFor={allergen} className="text-sm">
                      {allergen}
                    </Label>
                  </div>)}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={handleSaveItem}>
                {editingItem ? "Зберегти зміни" : "Додати страву"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};