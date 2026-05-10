"use client";

import Link from "next/link";
import { ArrowLeft, Download, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import toast from "react-hot-toast";

const MOCK_INVOICE = {
  id: "INV-2025-001",
  date: "May 20, 2025",
  status: "Pending",
  tripName: "Trip to Europe Adventure",
  tripDates: "Aug 10 - Jun 15, 2025 • 4 cities visited",
  travelers: ["James", "Arjun", "Jerry", "Cristina"],
  budget: {
    total: 22000,
    remaining: 2000,
    spent: 20000
  },
  items: [
    { id: 1, category: "hotel", description: "hotel booking paris", qty: "3 nights", unitCost: 3000, amount: 9000 },
    { id: 2, category: "travel", description: "flight bookings (DEL -> PAR)", qty: 4, unitCost: 3000, amount: 12000 }
  ],
  subtotal: 21000,
  tax: 1050,
  discount: 50,
  grandTotal: 22000
};

export default function InvoicePage() {
  const handleAction = (action: string) => {
    toast.success(`${action} action triggered successfully!`);
  };

  const progress = Math.round((MOCK_INVOICE.budget.spent / MOCK_INVOICE.budget.total) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/trips">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Expense Invoice</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Trip Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-start space-x-4">
                  <div className="h-16 w-16 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-8 w-8 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{MOCK_INVOICE.tripName}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{MOCK_INVOICE.tripDates}</p>
                    
                    <div className="mt-4 space-y-1">
                      <p className="text-sm font-medium">Traveler Details:</p>
                      <p className="text-sm text-muted-foreground">{MOCK_INVOICE.travelers.join(", ")}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 md:text-right">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Invoice ID</p>
                    <p className="text-sm font-medium">{MOCK_INVOICE.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Generated Date</p>
                    <p className="text-sm font-medium">{MOCK_INVOICE.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Payment Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 mt-1">
                      {MOCK_INVOICE.status}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Budget Insights */}
        <div className="lg:col-span-1">
          <Card className="border-border h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6 self-start w-full text-left">Budget Insights</h3>
              
              <div className="relative h-32 w-32 mb-6">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle className="text-muted stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                  <circle className="text-primary-500 stroke-current" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={`${progress * 2.51} 251.2`} transform="rotate(-90 50 50)"></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold">{progress}%</span>
                  <span className="text-xs text-muted-foreground">Spent</span>
                </div>
              </div>

              <div className="w-full space-y-3 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Total Budget:</span>
                  <span className="font-semibold">${MOCK_INVOICE.budget.total}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Total Spent:</span>
                  <span className="font-semibold text-primary-600">${MOCK_INVOICE.budget.spent}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-semibold text-green-600">${MOCK_INVOICE.budget.remaining}</span>
                </div>
              </div>

              <Link href="/dashboard/budget" className="w-full mt-4">
                <Button variant="outline" className="w-full">View Full Budget</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoice Table */}
      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">#</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold text-right">Qty/Details</th>
                <th className="px-6 py-4 font-semibold text-right">Unit Cost</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_INVOICE.items.map((item, index) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{index + 1}</td>
                  <td className="px-6 py-4 uppercase tracking-wider text-xs font-semibold">{item.category}</td>
                  <td className="px-6 py-4 text-foreground">{item.description}</td>
                  <td className="px-6 py-4 text-right text-muted-foreground">{item.qty}</td>
                  <td className="px-6 py-4 text-right text-muted-foreground">${item.unitCost}</td>
                  <td className="px-6 py-4 text-right font-medium">${item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Calculation */}
        <div className="border-t border-border bg-muted/10 p-6 flex justify-end">
          <div className="w-full max-w-sm space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${MOCK_INVOICE.subtotal}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (5%)</span>
              <span>${MOCK_INVOICE.tax}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-${MOCK_INVOICE.discount}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-foreground pt-3 border-t border-border">
              <span>Grand Total</span>
              <span>${MOCK_INVOICE.grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-border p-6 bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none bg-background" onClick={() => handleAction("Download Invoice")}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none bg-background" onClick={() => handleAction("Export PDF")}>
              <FileText className="mr-2 h-4 w-4" /> Export as PDF
            </Button>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => handleAction("Mark as Paid")}>
            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as paid
          </Button>
        </div>
      </Card>
    </div>
  );
}
