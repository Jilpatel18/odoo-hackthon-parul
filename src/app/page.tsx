"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plane, Map, Wallet, Camera, ArrowRight, Globe, Shield, Users, CheckCircle2, MapPin } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Check auth client-side to prevent hydration mismatch
    const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
    setIsAuthenticated(!!token);
    setIsAdmin(token === 'mock-admin-token');

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background selection:bg-primary-100 selection:text-primary-900 overflow-x-hidden font-sans">
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight font-heading bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Traveloop</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex space-x-8 text-sm font-medium text-muted-foreground mr-2">
                <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
                <Link href="#destinations" className="hover:text-foreground transition-colors">Destinations</Link>
                <Link href="/dashboard/community" className="hover:text-foreground transition-colors">Community</Link>
              </div>
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link href="/admin">
                      <Button variant="ghost" className="font-semibold hidden sm:flex">Admin</Button>
                    </Link>
                  )}
                  <Link href="/dashboard">
                    <Button className="rounded-full px-6 shadow-md hover:shadow-lg transition-all bg-foreground text-background hover:bg-foreground/90 font-medium">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary-600 transition-colors hidden sm:block">
                    Sign in
                  </Link>
                  <Link href="/signup">
                    <Button className="rounded-full px-6 shadow-soft hover:shadow-medium transition-all bg-primary-600 hover:bg-primary-700 text-white font-medium">Start for free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100/50 via-background to-background -z-10 blur-3xl opacity-50 dark:from-primary-900/20"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
              <motion.div variants={fadeUp} className="inline-flex items-center rounded-full border border-primary-200/50 bg-primary-50/50 px-4 py-1.5 text-sm font-medium text-primary-800 mb-8 backdrop-blur-sm dark:bg-primary-900/20 dark:border-primary-800/50 dark:text-primary-300 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary-600 mr-2 animate-pulse"></span>
                Travel planning, reimagined.
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="font-heading text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-foreground mb-6 leading-[1.05]">
                Design your next <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-accent">masterpiece journey.</span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="mt-4 text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                The premier ecosystem for modern explorers. Itineraries, budgets, and memories crafted into a single, beautiful workspace.
              </motion.p>
              
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
                  <Button size="lg" className="rounded-full px-10 text-lg h-14 shadow-medium hover:shadow-elevated hover:-translate-y-0.5 transition-all bg-primary-600 hover:bg-primary-700 text-white border-0 group font-medium">
                    Start Exploring
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" as const }}
              className="mt-20 sm:mt-28 relative max-w-6xl mx-auto rounded-[2.5rem] border border-border shadow-elevated bg-card/80 backdrop-blur-xl overflow-hidden ring-1 ring-border/50"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10"></div>
              <div className="aspect-[16/9] w-full bg-muted flex flex-col items-center justify-center relative">
                 <img 
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop" 
                    alt="Dashboard Preview"
                    className="w-full h-full object-cover opacity-90"
                  />
                  {/* Floating UI Elements over the hero image */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="absolute top-1/4 left-8 lg:left-12 bg-background/95 backdrop-blur-md p-4 rounded-2xl shadow-elevated border border-border/50 hidden md:block transform -rotate-2 hover:rotate-0 transition-transform duration-300 z-20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-5 h-5"/></div>
                      <div>
                        <p className="font-heading font-bold text-sm text-foreground">Flights Booked</p>
                        <p className="text-xs text-muted-foreground font-medium">Kyoto, Japan</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="absolute bottom-1/4 right-8 lg:right-12 bg-background/95 backdrop-blur-md p-4 rounded-2xl shadow-elevated border border-border/50 hidden md:block transform rotate-3 hover:rotate-0 transition-transform duration-300 z-20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-lg font-heading">¥</div>
                      <div>
                        <p className="font-heading font-bold text-sm text-foreground">Budget optimized</p>
                        <p className="text-xs text-emerald-500 font-medium">Under budget by 15%</p>
                      </div>
                    </div>
                  </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trending Destinations */}
        <section id="destinations" className="py-24 sm:py-32 bg-background relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
            >
              <motion.div variants={fadeUp}>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">Trending Destinations</h2>
                <p className="text-lg text-muted-foreground font-light">Curated spots for your next adventure.</p>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Button variant="ghost" className="rounded-full group font-medium hover:bg-muted">
                  View all locations <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Kyoto, Japan", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop", tag: "Cultural" },
                { title: "Swiss Alps", img: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop", tag: "Nature" },
                { title: "Amalfi Coast", img: "https://images.unsplash.com/photo-1612698093158-e07ac200d44e?q=80&w=800&auto=format&fit=crop", tag: "Relaxation" }
              ].map((dest, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-soft hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 z-10 transition-opacity duration-300 group-hover:opacity-90"></div>
                  <img src={dest.img} alt={dest.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 z-20 flex flex-col justify-between p-8">
                    <div className="self-end bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-semibold uppercase tracking-widest shadow-sm">
                      {dest.tag}
                    </div>
                    <div>
                      <h3 className="font-heading text-3xl font-bold text-white mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{dest.title}</h3>
                      <p className="text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 font-medium text-sm">
                        <MapPin className="w-4 h-4" /> Explore itineraries
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 sm:py-32 bg-card border-y border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mb-20 max-w-3xl mx-auto"
            >
              <h2 className="text-sm font-bold text-primary-600 dark:text-primary-500 tracking-widest uppercase mb-4">The Platform</h2>
              <p className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">A first-class experience for your travel logistics.</p>
              <p className="text-lg sm:text-xl text-muted-foreground font-light">Every tool you need, meticulously designed to stay out of your way.</p>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {[
                { icon: Map, title: "Interactive Itineraries", desc: "Build day-by-day plans with an intuitive timeline interface that feels like magic." },
                { icon: Wallet, title: "Smart Budgeting", desc: "Track every penny with beautiful charts and alerts. Never overspend on a trip again." },
                { icon: Camera, title: "Memories & Notes", desc: "Keep a journal of your adventures and share them with a vibrant community." },
                { icon: Globe, title: "Offline Access", desc: "Access your plans anywhere in the world, even when you're off the grid." },
                { icon: Users, title: "Collaborative Planning", desc: "Invite friends and family to plan the perfect trip together in real-time." },
                { icon: Shield, title: "Secure Documents", desc: "Keep your passports, tickets, and reservations safely encrypted." }
              ].map((feature, i) => (
                <motion.div 
                  variants={fadeUp}
                  key={i} 
                  className="bg-background border border-border p-8 rounded-[2rem] shadow-soft hover:shadow-medium transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="h-14 w-14 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 stroke-[2]" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-light">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-card py-20 border-t border-border mt-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] dark:opacity-[0.04]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <Plane className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight font-heading bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Traveloop</span>
              </div>
              <p className="text-muted-foreground leading-relaxed font-light max-w-sm">
                The premier ecosystem for modern explorers. Itineraries, budgets, and memories crafted into a single, beautiful workspace.
              </p>
            </div>
            
            <div>
              <h4 className="font-heading font-bold text-foreground mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-muted-foreground font-light">
                <li><Link href="#features" className="hover:text-primary-600 transition-colors">Features</Link></li>
                <li><Link href="#destinations" className="hover:text-primary-600 transition-colors">Destinations</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary-600 transition-colors">Dashboard</Link></li>
                <li><Link href="/pricing" className="hover:text-primary-600 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-bold text-foreground mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground font-light">
                <li><Link href="#" className="hover:text-primary-600 transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary-600 transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary-600 transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary-600 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-bold text-foreground mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-muted-foreground font-light">
                <li><Link href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary-600 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary-600 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/60 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground font-light">
            <p>© {new Date().getFullYear()} Traveloop Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-foreground cursor-pointer transition-colors">Twitter</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Instagram</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">LinkedIn</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
