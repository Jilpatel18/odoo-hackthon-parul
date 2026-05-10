"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Users, TrendingUp, Map, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

const data = [
  { name: 'Jan', users: 4000, trips: 2400 },
  { name: 'Feb', users: 3000, trips: 1398 },
  { name: 'Mar', users: 2000, trips: 9800 },
  { name: 'Apr', users: 2780, trips: 3908 },
  { name: 'May', users: 1890, trips: 4800 },
  { name: 'Jun', users: 2390, trips: 3800 },
  { name: 'Jul', users: 3490, trips: 4300 },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Overview</h1>
        <p className="mt-1 text-muted-foreground">Platform analytics and user engagement.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Users", value: "24,592", icon: Users, trend: "+12%" },
          { title: "Active Trips", value: "1,429", icon: Map, trend: "+5%" },
          { title: "Avg. Engagement", value: "84%", icon: TrendingUp, trend: "+2%" },
          { title: "Revenue (Est)", value: "₹12,400", icon: DollarSign, trend: "+18%" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{stat.trend}</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Growth</CardTitle>
          <CardDescription>Monthly active users and trips created over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-100 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="trips" stroke="#10b981" fillOpacity={1} fill="url(#colorTrips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
