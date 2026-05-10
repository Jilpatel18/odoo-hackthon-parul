import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/Button";
import { Plane, Map, Wallet, Camera, ArrowRight, Star, Globe, Shield, Users, CheckCircle2, MapPin } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from "next/image";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const isAuthenticated = !!token;
  const isAdmin = token === 'mock-admin-token';

  return (
    <div className="min-h-screen bg-background selection:bg-primary-100 selection:text-primary-900 overflow-x-hidden">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Traveloop</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex space-x-6 text-sm font-medium text-muted-foreground mr-4">
                <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
                <Link href="#destinations" className="hover:text-foreground transition-colors">Destinations</Link>
                <Link href="#community" className="hover:text-foreground transition-colors">Community</Link>
              </div>
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link href="/admin">
                      <Button variant="ghost" className="font-semibold">Admin</Button>
                    </Link>
                  )}
                  <Link href="/dashboard">
                    <Button className="rounded-full px-6 shadow-md hover:shadow-lg transition-all bg-foreground text-background hover:bg-foreground/90">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-semibold text-foreground hover:text-primary-600 transition-colors hidden sm:block">
                    Sign in
                  </Link>
                  <Link href="/signup">
                    <Button className="rounded-full px-6 shadow-md hover:shadow-lg transition-all bg-primary-600 hover:bg-primary-700 text-white">Start for free</Button>
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
            <div className="inline-flex items-center rounded-full border border-primary-200/50 bg-primary-50/50 px-3 py-1 text-sm font-medium text-primary-800 mb-8 backdrop-blur-sm dark:bg-primary-900/20 dark:border-primary-800/50 dark:text-primary-300">
              <span className="flex h-2 w-2 rounded-full bg-primary-600 mr-2 animate-pulse"></span>
              Travel planning, reimagined.
            </div>
            <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-foreground mb-8 leading-[1.1]">
              Design your next <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-amber-500">masterpiece journey.</span>
            </h1>
            <p className="mt-6 text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              The premier ecosystem for modern explorers. Itineraries, budgets, and memories crafted into a single, beautiful workspace.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
                <Button size="lg" className="rounded-full px-10 text-lg h-14 shadow-xl shadow-primary-500/20 hover:shadow-2xl hover:shadow-primary-500/30 transition-all bg-primary-600 hover:bg-primary-700 text-white border-0 group">
                  Start Exploring
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            <div className="mt-24 sm:mt-32 relative max-w-6xl mx-auto rounded-[2.5rem] border border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl overflow-hidden ring-1 ring-border/50">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
              <div className="aspect-[16/9] w-full bg-muted flex flex-col items-center justify-center border-t border-white/10 relative">
                 <img 
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop" 
                    alt="Dashboard Preview"
                    className="w-full h-full object-cover opacity-90"
                  />
                  {/* Floating UI Elements over the hero image */}
                  <div className="absolute top-1/4 left-10 bg-background/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-border/50 hidden md:block transform -rotate-2 hover:rotate-0 transition-transform">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600"><CheckCircle2 className="w-5 h-5"/></div>
                      <div>
                        <p className="font-bold text-sm">Flights Booked</p>
                        <p className="text-xs text-muted-foreground">Kyoto, Japan</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-1/4 right-10 bg-background/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-border/50 hidden md:block transform rotate-3 hover:rotate-0 transition-transform">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">¥</div>
                      <div>
                        <p className="font-bold text-sm">Budget optimized</p>
                        <p className="text-xs text-emerald-500 font-medium">Under budget by 15%</p>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Destinations */}
        <section id="destinations" className="py-32 bg-background relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">Trending Destinations</h2>
                <p className="text-xl text-muted-foreground">Curated spots for your next adventure.</p>
              </div>
              <Button variant="ghost" className="rounded-full group">
                View all locations <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Kyoto, Japan", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop", tag: "Cultural" },
                { title: "Swiss Alps", img: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop", tag: "Nature" },
                { title: "Amalfi Coast", img: "https://images.unsplash.com/photo-1612698093158-e07ac200d44e?q=80&w=800&auto=format&fit=crop", tag: "Relaxation" }
              ].map((dest, i) => (
                <div key={i} className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10"></div>
                  <img src={dest.img} alt={dest.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 z-20 flex flex-col justify-between p-6">
                    <div className="self-end bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold uppercase tracking-wider">
                      {dest.tag}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform">{dest.title}</h3>
                      <p className="text-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Explore itineraries
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-card border-y border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-24 max-w-3xl mx-auto">
              <h2 className="text-sm font-bold text-primary-600 tracking-widest uppercase mb-4">The Platform</h2>
              <p className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">A first-class experience for your travel logistics.</p>
              <p className="text-xl text-muted-foreground">Every tool you need, meticulously designed to stay out of your way.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Map, title: "Interactive Itineraries", desc: "Build day-by-day plans with an intuitive timeline interface that feels like magic." },
                { icon: Wallet, title: "Smart Budgeting", desc: "Track every penny with beautiful charts and alerts. Never overspend on a trip again." },
                { icon: Camera, title: "Memories & Notes", desc: "Keep a journal of your adventures and share them with a vibrant community." },
                { icon: Globe, title: "Offline Access", desc: "Access your plans anywhere in the world, even when you're off the grid." },
                { icon: Users, title: "Collaborative Planning", desc: "Invite friends and family to plan the perfect trip together in real-time." },
                { icon: Shield, title: "Secure Documents", desc: "Keep your passports, tickets, and reservations safely encrypted." }
              ].map((feature, i) => (
                <div key={i} className="bg-background border border-border p-8 rounded-3xl hover:shadow-xl transition-shadow group">
                  <div className="h-14 w-14 bg-primary-50 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-foreground rounded-lg flex items-center justify-center">
                <Plane className="h-5 w-5 text-background" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Traveloop</span>
            </div>
            <div className="flex gap-8 text-sm font-medium text-muted-foreground">
              <Link href="#" className="hover:text-foreground">About</Link>
              <Link href="#" className="hover:text-foreground">Privacy</Link>
              <Link href="#" className="hover:text-foreground">Terms</Link>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 Traveloop Inc. All rights reserved.</p>
            <p>Designed with precision.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
