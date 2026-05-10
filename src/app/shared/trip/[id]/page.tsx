"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Copy, Plane } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import toast from "react-hot-toast";

export default function SharedTripPage() {
  const itinerary = [
    {
      date: "Day 1 - Aug 12",
      stops: [
        { id: 1, time: "10:00 AM", title: "Arrive at Kansai Airport", location: "KIX, Osaka" },
        { id: 2, time: "12:30 PM", title: "Check-in at Hotel", location: "Kyoto Station Area" },
        { id: 3, time: "03:00 PM", title: "Fushimi Inari Taisha", location: "Fushimi Ward, Kyoto" },
        { id: 4, time: "07:00 PM", title: "Dinner at Pontocho Alley", location: "Nakagyo Ward, Kyoto" },
      ]
    },
    {
      date: "Day 2 - Aug 13",
      stops: [
        { id: 5, time: "09:00 AM", title: "Arashiyama Bamboo Grove", location: "Ukyo Ward, Kyoto" },
        { id: 6, time: "01:00 PM", title: "Tenryu-ji Temple", location: "Ukyo Ward, Kyoto" },
      ]
    }
  ];

  const handleCopy = () => {
    toast.success("Trip copied to your dashboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Traveloop</span>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/signup">
                <Button>Create Your Own</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto space-y-6 pb-8 p-4 sm:p-6 lg:p-8 mt-4">
        {/* Header */}
        <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden mb-8">
          <img 
            src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop" 
            alt="Kyoto"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-sm font-medium text-white mb-3">
                Public Itinerary
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Summer in Kyoto</h1>
              <div className="flex items-center text-white/80 mt-2 space-x-4">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-1.5 h-4 w-4" />
                  Aug 12 - Aug 24, 2026
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-1.5 h-4 w-4" />
                  Kyoto, Japan
                </div>
              </div>
              <p className="text-white/70 mt-3 text-sm flex items-center">
                Curated by <span className="font-semibold text-white ml-1">John Doe</span>
              </p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={handleCopy} className="bg-primary-600 text-white hover:bg-primary-700">
                <Copy className="mr-2 h-4 w-4" /> Copy Trip
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto space-y-8">
          {itinerary.map((day, dayIndex) => (
            <div key={dayIndex} className="relative">
              <div className="sticky top-20 z-10 bg-background/90 backdrop-blur-md py-3 font-bold text-lg text-foreground border-b border-border mb-6">
                {day.date}
              </div>
              
              <div className="space-y-4">
                {day.stops.map((stop, stopIndex) => (
                  <motion.div 
                    key={stop.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: stopIndex * 0.1 }}
                    className="flex gap-4 relative"
                  >
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div className="h-4 w-4 rounded-full border-2 border-primary-500 bg-background mt-1 z-10"></div>
                      {stopIndex !== day.stops.length - 1 && (
                        <div className="w-0.5 h-full bg-border -my-1 absolute top-5 bottom-[-1rem] left-[7px]"></div>
                      )}
                    </div>
                    
                    {/* Content Card */}
                    <Card className="flex-1 shadow-none border-border">
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
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
