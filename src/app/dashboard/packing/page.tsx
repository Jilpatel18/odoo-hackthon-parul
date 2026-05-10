"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Trash2, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import toast from "react-hot-toast";

type Item = { id: number; name: string; packed: boolean; category: string };

export default function PackingPage() {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categories, setCategories] = useState(["All", "Essentials", "Electronics", "Clothing", "Toiletries"]);
  
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/packing");
        const data = await res.json();
        if (data.success) {
          setItems(data.items);
          
          // Extract unique categories
          const uniqueCats = Array.from(new Set(data.items.map((i: Item) => i.category)));
          const baseCats = ["All", "Essentials", "Electronics", "Clothing", "Toiletries"];
          const combinedCats = Array.from(new Set([...baseCats, ...uniqueCats])) as string[];
          setCategories(combinedCats);
        } else {
          toast.error(data.error || "Failed to load packing items");
        }
      } catch (error) {
        toast.error("Failed to load packing items");
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  const [newItemText, setNewItemText] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Essentials");
  const [activeCategory, setActiveCategory] = useState("All");

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    if (!categories.includes(newCategoryName)) {
      setCategories([...categories, newCategoryName]);
    }
    setActiveCategory(newCategoryName);
    setNewCategoryName("");
    setShowCategoryModal(false);
  };

  const toggleItem = async (id: number) => {
    const itemToToggle = items.find(i => i.id === id);
    if (!itemToToggle) return;
    
    // Optimistic update
    setItems(items.map(item => item.id === id ? { ...item, packed: !item.packed } : item));
    
    try {
      await fetch('/api/packing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, packed: !itemToToggle.packed })
      });
    } catch {
      // Revert on error
      setItems(items.map(item => item.id === id ? { ...item, packed: itemToToggle.packed } : item));
      toast.error('Failed to update item');
    }
  };

  const deleteItem = async (id: number) => {
    // Optimistic update
    const previousItems = [...items];
    setItems(items.filter(item => item.id !== id));
    
    try {
      const res = await fetch(`/api/packing?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Item removed');
    } catch {
      setItems(previousItems);
      toast.error('Failed to delete item');
    }
  };

  const addItem = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!newItemText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/packing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemText, category: newItemCategory })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setItems([...items, data.item]);
        setNewItemText("");
        setShowItemModal(false);
        toast.success('Item added');
      } else {
        toast.error(data.error || 'Failed to add item');
      }
    } catch {
      toast.error('Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter(item => activeCategory === "All" || item.category === activeCategory);
  const packedCount = filteredItems.filter(i => i.packed).length;
  const progress = filteredItems.length === 0 ? 0 : Math.round((packedCount / filteredItems.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Packing List</h1>
          <p className="mt-1 text-muted-foreground">Don&apos;t forget the essentials for your next trip.</p>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Packing Progress</span>
            <span className="text-sm font-bold text-primary-600">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {packedCount} of {filteredItems.length} items packed
          </p>
        </CardContent>
      </Card>

      <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            className={activeCategory === category ? "rounded-full" : "rounded-full border-dashed"}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
        <Button
          variant="ghost"
          className="rounded-full text-primary-600 hover:bg-primary-50"
          onClick={() => setShowCategoryModal(true)}
        >
          <Plus className="mr-1 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => {
              setNewItemCategory(activeCategory === "All" ? "Essentials" : activeCategory);
              setShowItemModal(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>

          <div className="space-y-2">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors
                  ${item.packed ? 'bg-primary-50/50 border-primary-100' : 'bg-card border-border hover:border-primary-200'}`}
              >
                <div className="flex items-center space-x-3">
                  <button className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => toggleItem(item.id)}
                    className={`h-6 w-6 rounded-md border flex items-center justify-center transition-colors
                      ${item.packed ? 'bg-primary-500 border-primary-500 text-white' : 'border-input hover:border-primary-400 bg-background'}`}
                  >
                    {item.packed && <Check className="h-4 w-4" />}
                  </button>
                  <span className={`text-sm ${item.packed ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground hidden sm:inline-block">
                    {item.category}
                  </span>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredItems.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground text-sm">No items in this category.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-elevated border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="font-semibold text-lg text-foreground">Add Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddCategory}>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category Name</label>
                  <Input 
                    placeholder="e.g. Photography" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/30">
                <Button type="button" variant="outline" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-elevated border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="font-semibold text-lg text-foreground">Add Packing Item</h3>
              <button onClick={() => setShowItemModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={addItem}>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Item Name</label>
                  <Input 
                    placeholder="e.g. Toothbrush" 
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                  >
                    {categories.filter(c => c !== "All").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/30">
                <Button type="button" variant="outline" onClick={() => setShowItemModal(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Item"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
