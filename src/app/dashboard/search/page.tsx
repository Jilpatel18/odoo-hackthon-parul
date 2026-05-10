"use client";

import { useState } from "react";
import { Search, MapPin, Clock, Plus, Filter, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";

const searchResults = [
  { id: 1, title: "Fushimi Inari Taisha", location: "Kyoto, Japan", duration: "2-3 hours", cost: "Free", type: "Culture" },
  { id: 2, title: "Arashiyama Bamboo Grove", location: "Kyoto, Japan", duration: "1-2 hours", cost: "Free", type: "Nature" },
  { id: 3, title: "Universal Studios Japan", location: "Osaka, Japan", duration: "Full Day", cost: "₹60.00", type: "Entertainment" },
  { id: 4, title: "Osaka Castle", location: "Osaka, Japan", duration: "2 hours", cost: "₹5.00", type: "History" },
];

export default function ActivitySearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Discover Activities</h1>
        <p className="mt-1 text-muted-foreground">Search and add the best experiences to your itinerary.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search cities, landmarks, or activities..." 
            className="pl-10 h-12 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 px-6">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2">
        {["All", "Culture", "Nature", "Food", "Entertainment", "History"].map((category) => (
          <Button key={category} variant="secondary" size="sm" className="rounded-full">
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 pt-4">
        {searchResults.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:border-primary-300 transition-colors">
            <CardContent className="p-0 flex flex-col sm:flex-row">
              <div className="w-full sm:w-48 h-40 sm:h-auto bg-muted shrink-0">
                <img 
                  src={`https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400&auto=format&fit=crop&sig=${item.id}`} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
                      {item.type}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-4 space-x-4">
                    <span className="flex items-center"><MapPin className="mr-1 h-4 w-4" /> {item.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 border-t border-border pt-4">
                  <div className="flex space-x-4 text-sm font-medium">
                    <span className="flex items-center text-foreground"><Clock className="mr-1 h-4 w-4 text-muted-foreground" /> {item.duration}</span>
                    <span className="flex items-center text-foreground"><DollarSign className="mr-1 h-4 w-4 text-muted-foreground" /> {item.cost}</span>
                  </div>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add to Trip
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
