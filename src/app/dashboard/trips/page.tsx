"use client";

import { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { Search, MapPin, Calendar, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

type Trip = {
  id: number;
  title: string;
  destination: string;
  date: string;
  status: string;
  image: string;
};

export default function TripsPage() {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const res = await fetch("/api/trips", { cache: "no-store" });
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load trips");
        }
        
        setAllTrips(data.trips);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load trips from database.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTrips();
  }, []);

  const filteredTrips = allTrips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "All" || trip.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Trips</h1>
          <p className="mt-1 text-muted-foreground">Manage your past and future adventures.</p>
        </div>
        <Link href="/dashboard/trips/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Plan New Trip
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search trips..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filter === "All" ? "default" : "outline"} 
            size="sm" 
            className="hidden sm:flex"
            onClick={() => setFilter("All")}
          >
            All
          </Button>
          <Button 
            variant={filter === "Upcoming" ? "default" : "outline"} 
            size="sm" 
            className="hidden sm:flex"
            onClick={() => setFilter("Upcoming")}
          >
            Upcoming
          </Button>
          <Button 
            variant={filter === "Completed" ? "default" : "outline"} 
            size="sm" 
            className="hidden sm:flex"
            onClick={() => setFilter("Completed")}
          >
            Completed
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-muted-foreground col-span-full">Loading trips...</p>
        ) : filteredTrips.length === 0 ? (
          <p className="text-muted-foreground col-span-full">No trips found.</p>
        ) : filteredTrips.map((trip, index) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <Link href={`/dashboard/trips/${trip.id}`} className="block h-full">
              <Card className="overflow-hidden h-full flex flex-col border-border group cursor-pointer hover:border-primary-200">
                <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm
                      ${trip.status === 'Upcoming' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-muted text-muted-foreground dark:bg-muted/50 dark:text-muted-foreground'}`}>
                      {trip.status}
                    </span>
                  </div>
                  <ImageWithFallback 
                    src={trip.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop'} 
                    alt={trip.title}
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl line-clamp-1 group-hover:text-primary-600 transition-colors">{trip.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 pt-0">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-1">{trip.destination}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>{trip.date}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
