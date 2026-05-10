"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Plus, MoreHorizontal, CheckCircle2, Circle, Share2, Edit, Layers, ArrowDown, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { BudgetContent } from "@/app/dashboard/budget/page";
import { PackingContent } from "@/app/dashboard/packing/page";
import { NotesContent } from "@/app/dashboard/notes/page";
import { ImageUpload } from "@/components/ui/ImageUpload";

type TripData = {
  id: number;
  title: string;
  destination: string;
  date: string;
  status: string;
  image: string;
  budget: number;
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

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [isSavingTrip, setIsSavingTrip] = useState(false);

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

  const handleStopUpdate = (dayIndex: number, stopIndex: number, field: string, value: string) => {
    const updatedItinerary = [...itinerary];
    updatedItinerary[dayIndex].stops[stopIndex] = {
      ...updatedItinerary[dayIndex].stops[stopIndex],
      [field]: value
    };
    setItinerary(updatedItinerary);
  };

  const handleStopSave = async (stop: any, dayDate: string) => {
    if (!stop.title) return; // Don't save empty titles
    
    try {
      const isNew = typeof stop.id === 'number' && stop.id < 0;
      
      const payload = {
        id: isNew ? undefined : stop.id,
        title: stop.title,
        description: stop.location || '',
        start_time: new Date(dayDate).toISOString(), // Mocking time for now based on day date
        estimated_cost: parseFloat(stop.type) || 0
      };

      const res = await fetch(`/api/trips/${params.id}/itinerary`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!data.success) {
        toast.error("Failed to save activity");
      } else if (isNew && data.item) {
        // Update local ID if it was a new item
        setItinerary(current => {
          const updated = [...current];
          for (let d of updated) {
            for (let s of d.stops) {
              if (s.id === stop.id) {
                s.id = data.item.id;
              }
            }
          }
          return updated;
        });
      }
    } catch {
      toast.error("Failed to save activity");
    }
  };

  const handleAddStop = (dayIndex: number) => {
    const updatedItinerary = [...itinerary];
    updatedItinerary[dayIndex].stops.push({
      id: -Date.now(), // Temporary negative ID
      time: "09:00 AM",
      title: "",
      location: "",
      type: ""
    });
    setItinerary(updatedItinerary);
  };

  const handleDeleteStop = async (dayIndex: number, stopIndex: number, stopId: number | string) => {
    const updatedItinerary = [...itinerary];
    updatedItinerary[dayIndex].stops.splice(stopIndex, 1);
    setItinerary(updatedItinerary);

    if (typeof stopId !== 'number' || stopId > 0) {
      try {
        await fetch(`/api/trips/${params.id}/itinerary?itemId=${stopId}`, { method: 'DELETE' });
        toast.success("Activity deleted");
      } catch {
        toast.error("Failed to delete activity from server");
      }
    }
  };

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
            <Button 
              variant="outline" 
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied to clipboard!");
                } catch {
                  toast.error("Failed to copy link");
                }
              }}
            >
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button 
              className="bg-primary-600 text-white hover:bg-primary-700"
              onClick={() => {
                setEditTitle(trip.title);
                setEditDestination(trip.destination);
                setEditImage(trip.image);
                setEditBudget((trip.budget || 5000).toString());
                setShowEditModal(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit Trip
            </Button>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-elevated border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-lg">Edit Trip Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination</label>
                <Input value={editDestination} onChange={e => setEditDestination(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trip Cover Image</label>
                <ImageUpload 
                  value={editImage} 
                  onChange={setEditImage} 
                  className="h-40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Budget</label>
                <Input type="number" value={editBudget} onChange={e => setEditBudget(e.target.value)} />
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/30">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button 
                disabled={isSavingTrip}
                onClick={async () => {
                  setIsSavingTrip(true);
                  try {
                    const res = await fetch(`/api/trips/${params.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: editTitle,
                        destination: editDestination,
                        image: editImage,
                        budget: parseFloat(editBudget),
                      })
                    });
                    if (res.ok) {
                      setTrip({ ...trip, title: editTitle, destination: editDestination, image: editImage, budget: parseFloat(editBudget) });
                      setShowEditModal(false);
                      toast.success("Trip updated successfully!");
                    } else {
                      toast.error("Failed to update trip");
                    }
                  } catch {
                    toast.error("Failed to update trip");
                  } finally {
                    setIsSavingTrip(false);
                  }
                }}
              >
                {isSavingTrip ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

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
          
          {/* Timeline Builder */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">Itinerary for a selected place</h2>
            </div>
            
            {itinerary.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-border rounded-xl">
                <p className="text-muted-foreground mb-4">No itinerary items yet.</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add your first stop
                </Button>
              </div>
            ) : (
              itinerary.map((day, dayIndex) => (
                <div key={dayIndex} className="border border-border rounded-xl bg-card overflow-hidden">
                  <div className="bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center">
                    <h3 className="font-bold text-foreground border border-border px-3 py-1 rounded-md bg-background shadow-sm">Day {dayIndex + 1}</h3>
                    <span className="text-sm font-medium text-muted-foreground">{day.date}</span>
                  </div>
                  
                  <div className="p-6">
                    {day.stops.length > 0 && (
                      <div className="flex text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-4 px-2">
                        <div className="flex-1">Physical Activity</div>
                        <div className="w-24 sm:w-32 text-right pr-8 sm:pr-12">Expense</div>
                      </div>
                    )}
                    
                    <div className="space-y-2 relative">
                      {day.stops.map((stop, stopIndex) => (
                        <div key={stop.id}>
                          <div className="flex items-center gap-3">
                            <Input 
                              value={stop.title} 
                              onChange={(e) => handleStopUpdate(dayIndex, stopIndex, 'title', e.target.value)}
                              onBlur={() => handleStopSave(stop, day.date)}
                              placeholder="e.g. Visit Colosseum"
                              className="flex-1 bg-background"
                            />
                            <Input 
                              value={stop.type} 
                              onChange={(e) => handleStopUpdate(dayIndex, stopIndex, 'type', e.target.value)}
                              onBlur={() => handleStopSave(stop, day.date)}
                              placeholder="$0"
                              className="w-24 sm:w-32 bg-background text-right font-medium"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-red-500 hover:bg-red-50 shrink-0 h-10 w-10" 
                              onClick={() => handleDeleteStop(dayIndex, stopIndex, stop.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {stopIndex < day.stops.length - 1 && (
                            <div className="flex justify-center my-3 text-muted-foreground/30">
                              <ArrowDown className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-6 border-dashed text-muted-foreground hover:text-foreground" 
                      onClick={() => handleAddStop(dayIndex)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Activity
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            <Card className="bg-card">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Trip Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{itinerary.length} Days</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Stops</span>
                    <span className="font-medium">{itinerary.reduce((acc, day) => acc + day.stops.length, 0)} Planned</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Est. Budget</span>
                    <span className="font-medium text-primary-600 font-bold">
                      ₹{itinerary.reduce((acc, day) => acc + day.stops.reduce((acc2, stop) => acc2 + (parseFloat(stop.type) || 0), 0), 0).toFixed(2)}
                    </span>
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
                    <span className="text-sm line-through text-muted-foreground">Book flights</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-primary-500 mt-0.5" />
                    <span className="text-sm line-through text-muted-foreground">Reserve Hotel</span>
                  </div>
                  <div className="flex items-start space-x-3 cursor-pointer group">
                    <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary-500 mt-0.5 transition-colors" />
                    <span className="text-sm text-foreground">Buy Passes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {activeTab === "budget" && (
        <div className="pt-4 border border-border rounded-xl p-6 bg-card">
          <BudgetContent fixedTripId={trip.id.toString()} />
        </div>
      )}

      {activeTab === "packing" && (
        <div className="pt-4 border border-border rounded-xl p-6 bg-card">
          <PackingContent fixedTripId={trip.id.toString()} />
        </div>
      )}

      {activeTab === "notes" && (
        <div className="pt-4 border border-border rounded-xl p-6 bg-card">
          <NotesContent fixedTripId={trip.id.toString()} />
        </div>
      )}
    </div>
  );
}
