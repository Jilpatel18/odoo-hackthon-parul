"use client";

import { useEffect, useMemo, useState } from "react";

import { Activity, Search, MoreHorizontal, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import toast from 'react-hot-toast';

type ActivityItem = {
  id: number;
  title: string;
  type: string;
  destination: string;
  added: number;
};

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const res = await fetch("/api/admin/activities", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch activities");
        }

        setActivities(data.activities);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load activities from database.");
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, []);

  const filteredActivities = useMemo(
    () => activities.filter((act) =>
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.type.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [activities, searchQuery]
  );

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;
    const destination = formData.get("destination") as string;
    const added = Number(formData.get("added") || 0);

    try {
      if (editingActivity) {
        const res = await fetch(`/api/admin/activities/${editingActivity.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, type, destination, added }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to update activity");
        }

        setActivities((current) => current.map((activity) => (
          activity.id === editingActivity.id ? data.activity : activity
        )));
        toast.success("Activity updated successfully!");
      } else {
        const res = await fetch("/api/admin/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, type, destination, added }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to add activity");
        }

        setActivities((current) => [data.activity, ...current]);
        toast.success("Activity added successfully!");
      }

      setIsAddModalOpen(false);
      setEditingActivity(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save activity.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this activity?")) return;

    try {
      const res = await fetch(`/api/admin/activities/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete activity");
      }

      setActivities((current) => current.filter((activity) => activity.id !== id));
      toast.success("Activity deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete activity.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Activities</h1>
          <p className="mt-1 text-muted-foreground">Manage discoverable activities and tours.</p>
        </div>
        <Button onClick={() => { setEditingActivity(null); setIsAddModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Activity
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
          <CardTitle className="text-lg">Database</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search activities..." 
              className="pl-9 h-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Activity Title</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Destination</th>
                  <th className="px-6 py-4 font-medium">Times Added to Trip</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">Loading activities...</td>
                  </tr>
                ) : filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">No activities found.</td>
                  </tr>
                ) : filteredActivities.map((act) => (
                  <tr key={act.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span>{act.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
                        {act.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{act.destination}</td>
                    <td className="px-6 py-4 text-muted-foreground">{act.added}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 mr-2" onClick={() => { setEditingActivity(act); setIsAddModalOpen(true); }}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(act.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editingActivity ? "Edit Activity" : "Add Activity"}</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Activity Title</label>
                <Input name="title" required defaultValue={editingActivity?.title || ""} placeholder="e.g. Eiffel Tower Tour" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <Input name="type" required defaultValue={editingActivity?.type || ""} placeholder="e.g. Culture, Entertainment" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Destination</label>
                <Input name="destination" required defaultValue={editingActivity?.destination || ""} placeholder="e.g. Paris" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Times Added</label>
                <Input name="added" type="number" min="0" defaultValue={editingActivity?.added ?? 0} />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); setEditingActivity(null); }}>Cancel</Button>
                <Button type="submit">{editingActivity ? "Save Changes" : "Add Activity"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
