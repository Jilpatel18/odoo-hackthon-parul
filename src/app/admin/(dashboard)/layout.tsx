import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, MapPin, Activity, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="font-bold text-lg tracking-tight">Traveloop Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary-50 text-primary-700 font-medium text-sm">
            <LayoutDashboard className="h-4 w-4" /> <span>Overview</span>
          </Link>
          <Link href="/admin/users" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground font-medium text-sm">
            <Users className="h-4 w-4" /> <span>Users</span>
          </Link>
          <Link href="/admin/destinations" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground font-medium text-sm">
            <MapPin className="h-4 w-4" /> <span>Destinations</span>
          </Link>
          <Link href="/admin/activities" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground font-medium text-sm">
            <Activity className="h-4 w-4" /> <span>Activities</span>
          </Link>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-card border-b border-border flex items-center px-8 justify-between">
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Back to App
            </Link>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
