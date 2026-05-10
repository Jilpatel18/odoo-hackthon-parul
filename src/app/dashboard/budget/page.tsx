"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Plus, Download, Receipt, ArrowUpRight, ArrowDownRight, Wallet, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import toast from 'react-hot-toast';

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

const initialExpenses = [
  { id: 1, title: 'Dinner at Pontocho', category: 'Food', amount: 45.00, date: 'Aug 12, 2026' },
  { id: 2, title: 'JR Pass 7 Days', category: 'Transport', amount: 210.00, date: 'Aug 10, 2026' },
  { id: 3, title: 'Kyoto Hotel (3 Nights)', category: 'Lodging', amount: 350.00, date: 'Aug 05, 2026' },
  { id: 4, title: 'Universal Studios Tickets', category: 'Activities', amount: 120.00, date: 'Aug 02, 2026' },
  { id: 5, title: 'Airport Express Train', category: 'Transport', amount: 25.00, date: 'Aug 01, 2026' },
  { id: 6, title: 'Matcha Ice Cream', category: 'Food', amount: 5.50, date: 'Aug 12, 2026' },
];

export default function BudgetPage() {
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expensesList, setExpensesList] = useState(initialExpenses);
  
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Food");

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount) return;
    
    const newExpense = {
      id: Date.now(),
      title: newTitle,
      category: newCategory,
      amount: parseFloat(newAmount),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    
    setExpensesList([newExpense, ...expensesList]);
    setShowExpenseModal(false);
    setNewTitle("");
    setNewAmount("");
    toast.success("Expense added successfully!");
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
    } catch (error) {
      toast.error('Failed to export report.');
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Budget & Expenses</h1>
          <p className="mt-1 text-muted-foreground">Track your spending across all your adventures.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hidden sm:flex" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={() => setShowExpenseModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
              <WalletIcon className="h-4 w-4 text-primary-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">$5,000</p>
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
              <p className="text-3xl font-bold text-foreground">$2,750</p>
              <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">55%</span>
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
              <p className="text-3xl font-bold text-foreground">$2,250</p>
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
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} tickFormatter={(value) => `$${value}`} />
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
                    <span className="font-medium">${item.value}</span>
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
            {(showAllExpenses ? expensesList : expensesList.slice(0, 3)).map((expense) => (
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
                  ${expense.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-6 text-primary-600 border-border hover:bg-primary-50"
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
                    <label className="text-sm font-medium text-foreground">Amount ($)</label>
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
                <Button type="submit">Save Expense</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
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
