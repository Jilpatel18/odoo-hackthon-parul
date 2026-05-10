"use client";

import { motion } from "framer-motion";
import { Plus, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import Link from "next/link";

const stats = [
  { name: "Total Trips", value: "12" },
  { name: "Countries Visited", value: "8" },
  { name: "Cities Explored", value: "24" },
];

const upcomingTrips = [
  {
    id: 1,
    title: "Summer in Kyoto",
    destination: "Kyoto, Japan",
    date: "Aug 12 - Aug 24, 2026",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Swiss Alps Adventure",
    destination: "Zermatt, Switzerland",
    date: "Dec 05 - Dec 15, 2026",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=600&auto=format&fit=crop",
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-primary-900 px-6 py-12 sm:px-12 sm:py-16">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Hello, John!
            </h1>
            <p className="mt-2 text-lg text-primary-100 max-w-xl">
              Ready for your next adventure? Let's start planning something extraordinary today.
            </p>
          </div>
          <Link href="/dashboard/trips/new">
            <Button size="lg" className="bg-white text-primary-900 hover:bg-primary-50 rounded-full font-semibold px-8 whitespace-nowrap">
              <Plus className="mr-2 h-5 w-5" />
              Plan new trip
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-card">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground font-medium">{stat.name}</CardDescription>
              <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Upcoming Trips */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Upcoming Trips</h2>
          <Link href="/dashboard/trips" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className="overflow-hidden h-full flex flex-col border-border group cursor-pointer hover:border-primary-200">
                <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                  <img 
                    src={trip.image} 
                    alt={trip.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl line-clamp-1">{trip.title}</CardTitle>
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
                <CardFooter className="pt-0 border-t border-border mt-auto flex items-center justify-between bg-muted/30">
                  <span className="text-sm font-medium text-foreground">View Itinerary</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-600 transition-colors" />
                </CardFooter>
              </Card>
            </motion.div>
          ))}
          
          {/* Create New Trip Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: upcomingTrips.length * 0.1, duration: 0.4 }}
          >
            <Link href="/dashboard/trips/new" className="block h-full">
              <Card className="h-full min-h-[300px] border-2 border-dashed border-border hover:border-primary-300 hover:bg-primary-50/50 transition-colors flex flex-col items-center justify-center text-center p-6 cursor-pointer group shadow-none">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                  <Plus className="h-8 w-8 text-primary-600" />
                </div>
                <CardTitle className="text-xl mb-2 text-foreground group-hover:text-primary-700">Create new trip</CardTitle>
                <CardDescription className="text-muted-foreground max-w-[200px]">
                  Start planning your next adventure from scratch.
                </CardDescription>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
