"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plane, Compass, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/20 to-transparent blur-3xl rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Logo */}
          <Link href="/" className="mb-12 inline-flex items-center space-x-3 group">
            <div className="h-12 w-12 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
              <Plane className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight font-heading bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Traveloop
            </span>
          </Link>

          {/* 404 Graphic */}
          <div className="relative mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.7, type: "spring" }}
            >
              <h1 className="text-[9rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted select-none">
                404
              </h1>
            </motion.div>
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 1, type: "spring", stiffness: 100 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="h-32 w-32 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center shadow-2xl shadow-primary-500/10">
                <Compass className="h-16 w-16 text-primary-500" />
              </div>
            </motion.div>
          </div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold font-heading mb-4 text-foreground tracking-tight">
              Looks like you're off the map.
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
              We couldn't find the destination you're looking for. It might have been moved, deleted, or never existed in the first place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto h-12 px-8 text-base font-medium rounded-xl group"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-5 w-5 text-muted-foreground group-hover:-translate-x-1 transition-transform" />
                Go Back
              </Button>
              <Link href="/" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full h-12 px-8 text-base font-medium rounded-xl bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/25 group"
                >
                  <Home className="mr-2 h-5 w-5 opacity-90 group-hover:scale-110 transition-transform" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-8 text-sm text-muted-foreground font-medium">
        © {new Date().getFullYear()} Traveloop Inc.
      </div>
    </div>
  );
}
