"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Plus, MoreHorizontal, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

type TripData = {
  id: number;
  title: string;
  destination: string;
  date: string;
  status: string;
  image: string;
};

type ItineraryDay = {
  date: string;
  stops: {
    id: number;
    time: string;
    title: string;
    location: string;
    type: string;
  }[];
};

export default function TripItineraryPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [trip, setTrip] = useState<TripData | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const res = await fetch(`/api/trips/${params.id}`);
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load trip");
        }
        
        setTrip(data.trip);
        setItinerary(data.itinerary);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load trip from database.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTripDetails();
  }, [params.id]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading trip...</div>;
  }

  if (!trip) {
    return <div className="p-8 text-center text-muted-foreground">Trip not found.</div>;
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="relative h-64 rounded-3xl overflow-hidden mb-8">
        <ImageWithFallback 
          src={trip.image || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop'} 
          alt={trip.title}
          className="absolute inset-0 w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium mb-3
              ${trip.status === 'Upcoming' ? 'bg-primary-500/80 text-white' : 'bg-white/20 text-white'} backdrop-blur-md`}>
              {trip.status}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{trip.title}</h1>
            <div className="flex items-center text-white/80 mt-2 space-x-4">
              <div className="flex items-center text-sm">
                <Calendar className="mr-1.5 h-4 w-4" />
                {trip.date}
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="mr-1.5 h-4 w-4" />
                {trip.destination}
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md">
              Share
            </Button>
            <Button className="bg-primary-600 text-white hover:bg-primary-700">
              Edit Trip
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border overflow-x-auto hide-scrollbar">
        {["Itinerary", "Budget", "Packing", "Notes"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors relative
              ${activeTab === tab.toLowerCase() ? "text-primary-600" : "text-muted-foreground hover:text-foreground"}
            `}
          >
            {tab}
            {activeTab === tab.toLowerCase() && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
              />
            )}
          </button>
        ))}
      </div>

      {/* Itinerary Tab Content */}
      {activeTab === "itinerary" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          
          {/* Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {itinerary.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-border rounded-xl">
                <p className="text-muted-foreground mb-4">No itinerary items yet.</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add your first stop
                </Button>
              </div>
            ) : (
              itinerary.map((day, dayIndex) => (
                <div key={dayIndex} className="relative">
                  <div className="sticky top-16 z-10 bg-background/90 backdrop-blur-md py-3 font-bold text-lg text-foreground border-b border-border mb-6 flex justify-between items-center">
                    {day.date}
                    <Button variant="ghost" size="sm" className="text-primary-600">
                      <Plus className="h-4 w-4 mr-1" /> Add Stop
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {day.stops.map((stop, stopIndex) => (
                      <motion.div 
                        key={stop.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: stopIndex * 0.1 }}
                        className="flex gap-4 relative group"
                      >
                        {/* Timeline Line */}
                        <div className="flex flex-col items-center">
                          <div className="h-4 w-4 rounded-full border-2 border-primary-500 bg-background mt-1 z-10"></div>
                          {stopIndex !== day.stops.length - 1 && (
                            <div className="w-0.5 h-full bg-border -my-1 absolute top-5 bottom-[-1rem] left-[7px]"></div>
                          )}
                        </div>
                        
                        {/* Content Card */}
                        <Card className="flex-1 hover:border-primary-200 transition-colors cursor-pointer shadow-none">
                          <CardContent className="p-4 flex sm:items-center flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{stop.time}</span>
                              </div>
                              <h4 className="font-semibold text-foreground text-lg">{stop.title}</h4>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                {stop.location}
                              </div>
                            </div>
                            <div>
                              <Button variant="ghost" size="icon" className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            )}
            
            <Button variant="outline" className="w-full border-dashed">
              <Plus className="mr-2 h-4 w-4" /> Add Day
            </Button>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            <Card className="bg-card">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Trip Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">13 Days</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Stops</span>
                    <span className="font-medium">14 Planned</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Est. Budget</span>
                    <span className="font-medium">₹2,400.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Checklist</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-primary-500 mt-0.5" />
                    <span className="text-sm line-through text-muted-foreground">Book flights to KIX</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-primary-500 mt-0.5" />
                    <span className="text-sm line-through text-muted-foreground">Reserve Kyoto Hotel</span>
                  </div>
                  <div className="flex items-start space-x-3 cursor-pointer group">
                    <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary-500 mt-0.5 transition-colors" />
                    <span className="text-sm text-foreground">Buy JR Pass</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {activeTab !== "itinerary" && (
        <div className="py-12 text-center border-2 border-dashed border-border rounded-xl mt-4">
          <h3 className="text-lg font-medium text-foreground mb-2">Coming Soon</h3>
          <p className="text-muted-foreground">This section is currently under development.</p>
        </div>
      )}
    </div>
  );
}
