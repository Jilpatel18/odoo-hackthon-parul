"use client";

import { useState } from "react";

import { MapPin, Search, MoreHorizontal, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import toast from 'react-hot-toast';

const initialDestinations = [
  { id: 1, name: "Kyoto", country: "Japan", trips: 145, rating: "4.9" },
  { id: 2, name: "Zermatt", country: "Switzerland", trips: 89, rating: "4.8" },
  { id: 3, name: "Rome", country: "Italy", trips: 230, rating: "4.7" },
  { id: 4, name: "Reykjavik", country: "Iceland", trips: 56, rating: "4.9" },
];

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState(initialDestinations);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredDestinations = destinations.filter(dest => 
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    dest.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const country = formData.get("country") as string;

    setDestinations([...destinations, {
      id: Date.now(),
      name,
      country,
      trips: 0,
      rating: "0.0"
    }]);
    setIsAddModalOpen(false);
    toast.success("Destination added successfully!");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Destinations</h1>
          <p className="mt-1 text-muted-foreground">Manage popular destinations.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
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
                {filteredDestinations.length === 0 ? (
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success('Opening options menu...')}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Add Destination</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Destination Name</label>
                <Input name="name" required placeholder="e.g. Kyoto" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Country</label>
                <Input name="country" required placeholder="e.g. Japan" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">Add Destination</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
