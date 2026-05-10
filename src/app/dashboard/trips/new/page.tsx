"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { ImageUpload } from "@/components/ui/ImageUpload";
import toast from "react-hot-toast";

export default function CreateTripPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [tripData, setTripData] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    coverImage: "",
  });

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create trip");
      }
      
      toast.success("Trip created successfully!");
      router.push(`/dashboard/trips/${data.tripId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create trip.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Plan a new trip</h1>
        <p className="mt-2 text-muted-foreground">
          Let's get the basic details down. You can always change these later.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        <div className={`h-2.5 flex-1 rounded-l-full ${step >= 1 ? "bg-primary-500" : "bg-muted"}`}></div>
        <div className={`h-2.5 flex-1 rounded-r-full ml-1 ${step >= 2 ? "bg-primary-500" : "bg-muted"}`}></div>
      </div>

      <Card className="border border-border shadow-soft">
        <CardContent className="p-6 sm:p-10">
          <form onSubmit={handleSubmit}>
            
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                    Trip Title
                  </label>
                  <Input
                    id="title"
                    placeholder="e.g. Summer in Tokyo"
                    value={tripData.title}
                    onChange={(e) => setTripData({ ...tripData, title: e.target.value })}
                    className="text-lg h-12"
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-foreground mb-2">
                    Primary Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="destination"
                      placeholder="Search for a city or country..."
                      value={tripData.destination}
                      onChange={(e) => setTripData({ ...tripData, destination: e.target.value })}
                      className="pl-10 text-lg h-12"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="button" 
                    size="lg" 
                    onClick={handleNext}
                    disabled={!tripData.title || !tripData.destination}
                  >
                    Next <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-foreground mb-2">
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="startDate"
                        type="date"
                        value={tripData.startDate}
                        onChange={(e) => setTripData({ ...tripData, startDate: e.target.value })}
                        className="pl-10 text-lg h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-foreground mb-2">
                      End Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="endDate"
                        type="date"
                        value={tripData.endDate}
                        onChange={(e) => setTripData({ ...tripData, endDate: e.target.value })}
                        className="pl-10 text-lg h-12"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cover Image
                  </label>
                  <ImageUpload 
                    value={tripData.coverImage} 
                    onChange={(url) => setTripData({ ...tripData, coverImage: url })} 
                  />
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <Button type="button" variant="ghost" onClick={handleBack}>
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={isLoading || !tripData.startDate || !tripData.endDate}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Trip"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
