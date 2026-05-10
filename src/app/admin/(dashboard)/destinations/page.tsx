"use client";

import { useEffect, useMemo, useState } from "react";

import { MapPin, Search, MoreHorizontal, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import toast from 'react-hot-toast';

type Destination = {
  id: number;
  name: string;
  country: string;
  trips: number;
  rating: string;
};

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const res = await fetch("/api/admin/destinations", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch destinations");
        }

        setDestinations(data.destinations);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load destinations from database.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDestinations();
  }, []);

  const filteredDestinations = useMemo(
    () => destinations.filter((dest) =>
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [destinations, searchQuery]
  );

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const country = formData.get("country") as string;
    const trips = Number(formData.get("trips") || 0);
    const rating = String(formData.get("rating") || "0.0");

    try {
      if (editingDestination) {
        const res = await fetch(`/api/admin/destinations/${editingDestination.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, country, trips, rating }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to update destination");
        }

        setDestinations((current) => current.map((dest) => (
          dest.id === editingDestination.id ? data.destination : dest
        )));
        toast.success("Destination updated successfully!");
      } else {
        const res = await fetch("/api/admin/destinations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, country, trips, rating }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to add destination");
        }

        setDestinations((current) => [data.destination, ...current]);
        toast.success("Destination added successfully!");
      }

      setIsAddModalOpen(false);
      setEditingDestination(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save destination.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this destination?")) return;

    try {
      const res = await fetch(`/api/admin/destinations/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete destination");
      }

      setDestinations((current) => current.filter((dest) => dest.id !== id));
      toast.success("Destination deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete destination.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Destinations</h1>
          <p className="mt-1 text-muted-foreground">Manage popular destinations.</p>
        </div>
        <Button onClick={() => { setEditingDestination(null); setIsAddModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Destination
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
          <CardTitle className="text-lg">Database</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search destinations..." 
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
                  <th className="px-6 py-4 font-medium">Destination</th>
                  <th className="px-6 py-4 font-medium">Country</th>
                  <th className="px-6 py-4 font-medium">Trips Planned</th>
                  <th className="px-6 py-4 font-medium">Avg Rating</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">Loading destinations...</td>
                  </tr>
                ) : filteredDestinations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">No destinations found.</td>
                  </tr>
                ) : filteredDestinations.map((dest) => (
                  <tr key={dest.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{dest.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{dest.country}</td>
                    <td className="px-6 py-4 text-muted-foreground">{dest.trips}</td>
                    <td className="px-6 py-4 text-muted-foreground">⭐ {dest.rating}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 mr-2" onClick={() => { setEditingDestination(dest); setIsAddModalOpen(true); }}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(dest.id)}>
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
            <h2 className="text-xl font-bold mb-4">{editingDestination ? "Edit Destination" : "Add Destination"}</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Destination Name</label>
                <Input name="name" required defaultValue={editingDestination?.name || ""} placeholder="e.g. Kyoto" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Country</label>
                <Input name="country" required defaultValue={editingDestination?.country || ""} placeholder="e.g. Japan" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Trips Planned</label>
                  <Input name="trips" type="number" min="0" defaultValue={editingDestination?.trips ?? 0} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Rating</label>
                  <Input name="rating" defaultValue={editingDestination?.rating || "0.0"} placeholder="4.9" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); setEditingDestination(null); }}>Cancel</Button>
                <Button type="submit">{editingDestination ? "Save Changes" : "Add Destination"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
