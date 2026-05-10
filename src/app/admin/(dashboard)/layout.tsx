"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MapPin, Activity, Settings, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  const navLinks = [
    { href: "/admin", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/destinations", icon: MapPin, label: "Destinations" },
    { href: "/admin/activities", icon: Activity, label: "Activities" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="font-bold text-lg tracking-tight">Traveloop Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all
                  ${isActive 
                    ? 'bg-primary-50/80 text-primary-700 border-l-4 border-primary-600 shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border-l-4 border-transparent'
                  }
                `}
              >
                <link.icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-muted-foreground'}`} /> 
                <span>{link.label}</span>
              </Link>
            );
          })}
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
            <div className="h-6 w-px bg-border mx-2"></div>
            <button 
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/admin/login";
              }}
              className="flex items-center space-x-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
