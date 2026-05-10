"use client";

import { MapPin, Search, MoreHorizontal, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import toast from 'react-hot-toast';

const destinations = [
  { id: 1, name: "Kyoto", country: "Japan", trips: 145, rating: "4.9" },
  { id: 2, name: "Zermatt", country: "Switzerland", trips: 89, rating: "4.8" },
  { id: 3, name: "Rome", country: "Italy", trips: 230, rating: "4.7" },
  { id: 4, name: "Reykjavik", country: "Iceland", trips: 56, rating: "4.9" },
];

export default function AdminDestinationsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Destinations</h1>
          <p className="mt-1 text-muted-foreground">Manage popular destinations.</p>
        </div>
        <Button onClick={() => toast.success('Open add destination modal...')}>
          <Plus className="mr-2 h-4 w-4" /> Add Destination
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
          <CardTitle className="text-lg">Database</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search destinations..." className="pl-9 h-9" />
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
                {destinations.map((dest) => (
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
    </div>
  );
}
