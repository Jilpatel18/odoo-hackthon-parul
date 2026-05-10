"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Plus, Download, Receipt, ArrowUpRight, ArrowDownRight, X, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import toast from 'react-hot-toast';

type Expense = {
  id: number;
  title: string;
  category: string;
  amount: number;
  date: string;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const pieData = [
  { name: 'Flights', value: 1200, color: '#3b82f6' },
  { name: 'Lodging', value: 800, color: '#10b981' },
  { name: 'Food', value: 450, color: '#f59e0b' },
  { name: 'Activities', value: 300, color: '#8b5cf6' },
];

const barData = [
  { name: 'Aug 12', amount: 120 },
  { name: 'Aug 13', amount: 250 },
  { name: 'Aug 14', amount: 180 },
  { name: 'Aug 15', amount: 90 },
  { name: 'Aug 16', amount: 310 },
];

export function BudgetContent({ fixedTripId }: { fixedTripId?: string }) {
  const searchParams = useSearchParams();
  const initialTripId = fixedTripId || searchParams.get("tripId") || "all";
  
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expensesList, setExpensesList] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Food");

  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>(initialTripId);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editBudgetAmount, setEditBudgetAmount] = useState("");
  const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tripsRes, expRes] = await Promise.all([
          fetch('/api/trips'),
          fetch(`/api/budget${selectedTripId !== 'all' ? `?tripId=${selectedTripId}` : ''}`)
        ]);
        
        const tripsData = await tripsRes.json();
        const expData = await expRes.json();
        
        if (tripsData.success) {
          setTrips(tripsData.trips);
        }
        if (expData.success) {
          setExpensesList(expData.expenses.map((e: any) => ({ ...e, amount: parseFloat(e.amount) })));
        } else {
          toast.error(expData.error || 'Failed to load expenses');
        }
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedTripId]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: selectedTripId === 'all' ? undefined : selectedTripId,
          title: newTitle,
          category: newCategory,
          amount: parseFloat(newAmount),
          date: new Date().toISOString().split('T')[0]
        }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setExpensesList([data.expense, ...expensesList]);
        setShowExpenseModal(false);
        setNewTitle("");
        setNewAmount("");
        toast.success("Expense added successfully!");
      } else {
        toast.error(data.error || "Failed to add expense");
      }
    } catch (error) {
      toast.error("Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleExport = () => {
    try {
      const headers = ['Date', 'Title', 'Category', 'Amount'];
      const rows = expensesList.map(exp => [exp.date, exp.title, exp.category, exp.amount]);
      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', 'traveloop_expenses.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Budget report downloaded successfully!');
    } catch {
      toast.error('Failed to export report.');
    }
  };

  const handleUpdateBudget = async () => {
    if (selectedTripId === 'all') return;
    setIsUpdatingBudget(true);
    try {
      const res = await fetch(`/api/trips/${selectedTripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget: parseFloat(editBudgetAmount) })
      });
      if (res.ok) {
        setTrips(trips.map(t => t.id === parseInt(selectedTripId) ? { ...t, budget: parseFloat(editBudgetAmount) } : t));
        setIsEditingBudget(false);
        toast.success("Budget updated!");
      } else {
        toast.error("Failed to update budget");
      }
    } catch {
      toast.error("Failed to update budget");
    } finally {
      setIsUpdatingBudget(false);
    }
  };

  const totalSpent = expensesList.reduce((sum, item) => sum + item.amount, 0);
  const selectedTrip = trips.find(t => t.id === parseInt(selectedTripId));
  const totalBudget = selectedTripId === 'all' 
    ? trips.reduce((sum, t) => sum + (parseFloat(t.budget) || 5000), 0)
    : (selectedTrip ? (parseFloat(selectedTrip.budget) || 5000) : 5000);
  const remainingBudget = totalBudget - totalSpent;
  const budgetPercentage = totalBudget === 0 ? 0 : Math.min(Math.round((totalSpent / totalBudget) * 100), 100);

  return (
    <div className={fixedTripId ? "space-y-6" : "space-y-6 pb-8"}>
      {/* Header */}
      {!fixedTripId ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center space-x-4">
              <span>Budget & Expenses</span>
              <select 
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="text-sm font-medium border border-border rounded-lg px-3 py-1.5 bg-background shadow-sm"
              >
                <option value="all">All Trips</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </h1>
            <p className="mt-1 text-muted-foreground">Track your spending across {selectedTripId === 'all' ? 'all your adventures' : 'this trip'}.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="hidden sm:flex">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button onClick={() => setShowExpenseModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button onClick={() => setShowExpenseModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
              <WalletIcon className="h-4 w-4 text-primary-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              {isEditingBudget ? (
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={editBudgetAmount} 
                    onChange={(e) => setEditBudgetAmount(e.target.value)} 
                    className="w-24 h-8"
                    placeholder="5000"
                  />
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleUpdateBudget} disabled={isUpdatingBudget}>
                    <Check className="h-4 w-4 text-emerald-500" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsEditingBudget(false)}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <p className="text-3xl font-bold text-foreground">{formatCurrency(totalBudget)}</p>
                  {selectedTripId !== 'all' && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={() => {
                        setEditBudgetAmount(totalBudget.toString());
                        setIsEditingBudget(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
              <ArrowUpRight className="h-4 w-4 text-red-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{formatCurrency(totalSpent)}</p>
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${budgetPercentage > 100 ? 'text-red-600 bg-red-100' : 'text-red-500 bg-red-50'}`}>{budgetPercentage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Remaining</p>
              <ArrowDownRight className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-foreground'}`}>{formatCurrency(remainingBudget)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Daily Spending</CardTitle>
              <CardDescription>Your expenses over the last 5 days of your trip</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Spending by Category */}
          <Card>
            <CardHeader>
              <CardTitle>By Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading expenses...</p>
            ) : expensesList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expenses added yet.</p>
            ) : (showAllExpenses ? expensesList : expensesList.slice(0, 3)).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between py-3 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{expense.title}</p>
                    <p className="text-xs text-muted-foreground">{expense.category} • {expense.date}</p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {formatCurrency(expense.amount)}
                </div>
              </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-4 h-9 text-sm text-primary-600 border-border hover:bg-primary-50"
            onClick={() => setShowAllExpenses(!showAllExpenses)}
          >
            {showAllExpenses ? "Show Less" : "View All Expenses"}
          </Button>
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-elevated border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="font-semibold text-lg text-foreground">Add New Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddExpense}>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Expense Title</label>
                  <Input 
                    placeholder="e.g. Taxi to hotel" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Amount (₹)</label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      step="0.01"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Lodging">Lodging</option>
                      <option value="Activities">Activities</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/30">
                <Button type="button" variant="outline" onClick={() => setShowExpenseModal(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Expense"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BudgetPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <BudgetContent />
    </Suspense>
  );
}

function WalletIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
