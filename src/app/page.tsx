import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/Button";
import { Plane, Map, Wallet, Camera } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const isAuthenticated = !!token;
  const isAdmin = token === 'mock-admin-token'; // basic mock check for admin

  return (
    <div className="min-h-screen bg-background selection:bg-primary-100 selection:text-primary-900">
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Traveloop</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link href="/admin">
                      <Button variant="outline">Admin Panel</Button>
                    </Link>
                  )}
                  <Link href="/dashboard">
                    <Button>Go to Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Log in
                  </Link>
                  <Link href="/signup">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 sm:pt-32 sm:pb-40 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-50 via-background to-background -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-foreground mb-6">
              Plan your next <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">masterpiece journey.</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Traveloop is the handcrafted workspace for your travel planning. From itineraries to budgets, everything you need to plan a perfect trip in one beautiful place.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="rounded-full px-8 text-base h-12 shadow-medium hover:shadow-elevated transition-all">
                    Go to your Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/signup">
                  <Button size="lg" className="rounded-full px-8 text-base h-12 shadow-medium hover:shadow-elevated transition-all">
                    Start Planning for Free
                  </Button>
                </Link>
              )}
              <Link href="#features">
                <Button variant="outline" size="lg" className="rounded-full px-8 text-base h-12">
                  Explore Features
                </Button>
              </Link>
            </div>
            
            <div className="mt-16 sm:mt-24 relative max-w-5xl mx-auto rounded-xl sm:rounded-2xl border border-border shadow-elevated bg-card overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/20 pointer-events-none"></div>
              {/* Mock Dashboard Image placeholder */}
              <div className="aspect-[16/9] w-full bg-muted flex flex-col items-center justify-center border-t border-border/50">
                 <img 
                    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop" 
                    alt="Dashboard Preview"
                    className="w-full h-full object-cover opacity-80"
                  />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-sm font-semibold text-primary-600 tracking-wide uppercase mb-3">Features</h2>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Everything you need, nothing you don't.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { icon: Map, title: "Interactive Itineraries", desc: "Build day-by-day plans with an intuitive timeline interface that feels like magic." },
                { icon: Wallet, title: "Smart Budgeting", desc: "Track every penny with beautiful charts and alerts. Never overspend on a trip again." },
                { icon: Camera, title: "Memories & Notes", desc: "Keep a journal of your adventures and share them with a vibrant community." }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <Plane className="h-5 w-5 text-primary-600" />
            <span className="text-lg font-bold">Traveloop</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Traveloop. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
