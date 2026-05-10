"use client";

import { useEffect, useState } from "react";
import { User, Bell, Shield, CreditCard, Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import toast from 'react-hot-toast';
import { useDashboardUser } from "@/components/layout/DashboardLayout";

type BillingState = {
  selectedPlan: string;
  subscriptionActive: boolean;
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
};

const buildDefaultBilling = (displayName: string | undefined, email: string | undefined): BillingState => ({
  selectedPlan: "Pro Plan",
  subscriptionActive: true,
  cardholderName: displayName || email || "Traveler",
  cardNumber: "4242 4242 4242 4242",
  expiryDate: "2028-12",
  cvv: "123",
});

export default function SettingsPage() {
  const currentUser = useDashboardUser();
  const defaultBilling = buildDefaultBilling(currentUser?.name, currentUser?.email);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billing, setBilling] = useState<BillingState>(defaultBilling);
  const [cardholderName, setCardholderName] = useState(defaultBilling.cardholderName);
  const [cardNumber, setCardNumber] = useState(defaultBilling.cardNumber);
  const [expiryDate, setExpiryDate] = useState(defaultBilling.expiryDate);
  const [cvv, setCvv] = useState(defaultBilling.cvv);

  useEffect(() => {
    const loadBilling = async () => {
      try {
        const res = await fetch("/api/account/billing", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch billing");
        }

        const loaded = data.billing as BillingState;
        setBilling(loaded);
        setCardholderName(loaded.cardholderName);
        setCardNumber(loaded.cardNumber);
        setExpiryDate(loaded.expiryDate);
        setCvv(loaded.cvv || "");
      } catch (error) {
        console.error(error);
        toast.error("Unable to load billing from database.");
      }
    };

    loadBilling();
  }, []);

  const saveBilling = async (nextBilling: BillingState) => {
    const res = await fetch("/api/account/billing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextBilling),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to save billing");
    }
  };

  const tabs = [
    { id: "profile", name: "Profile Details", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "billing", name: "Billing", icon: CreditCard },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium whitespace-nowrap
                    ${isActive 
                      ? "bg-primary-50 text-primary-700" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <tab.icon className={`h-4 w-4 ${isActive ? "text-primary-600" : ""}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Update your personal information and how others see you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                    <Input id="firstName" defaultValue={currentUser?.name?.split(/\s+/)[0] || "Traveler"} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                    <Input id="lastName" defaultValue={currentUser?.name?.split(/\s+/).slice(1).join(" ") || ""} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                  <Input id="email" type="email" defaultValue={currentUser?.email || "traveler@example.com"} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                  <textarea 
                    id="bio" 
                    rows={4}
                    className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue="Passionate traveler, food lover, and photography enthusiast."
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t border-border pt-6 flex justify-end">
                <Button onClick={() => toast.success('Profile details saved successfully!')}>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what you want to be notified about.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Simplified toggles for UI demonstration */}
                <div className="space-y-4">
                  {[
                    { title: "Trip Reminders", desc: "Get notified before your trip starts." },
                    { title: "Budget Alerts", desc: "Get notified when you exceed 90% of your budget." },
                    { title: "Marketing", desc: "Receive updates about new features." }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-sm text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <button className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${i < 2 ? 'bg-primary-600' : 'bg-muted'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${i < 2 ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t border-border pt-6 flex justify-end">
                <Button onClick={() => toast.success('Notification preferences updated!')}>
                  <Save className="mr-2 h-4 w-4" /> Save Preferences
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and account security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm New Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="pt-4 border-t border-border mt-6">
                  <h4 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <Button variant="destructive" size="sm" onClick={() => toast.error('Account deletion requested. Please check your email.')}>Delete Account</Button>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border pt-6 flex justify-end">
                <Button onClick={() => toast.success('Security settings updated successfully!')}>
                  <Save className="mr-2 h-4 w-4" /> Update Security
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "billing" && (
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>Manage your payment methods and subscription plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border border-border p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{billing.selectedPlan}</p>
                      <p className="text-sm text-muted-foreground">
                        {billing.subscriptionActive ? "₹9.99/month, renews on Oct 15, 2026" : "Subscription paused"}
                      </p>
                    </div>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      {billing.subscriptionActive ? "Active" : "Paused"}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const nextBilling = {
                          ...billing,
                          selectedPlan: billing.selectedPlan === 'Pro Plan' ? 'Premium Plan' : 'Pro Plan',
                          subscriptionActive: true,
                        };

                        try {
                          await saveBilling(nextBilling);
                          setBilling(nextBilling);
                          toast.success('Subscription plan updated successfully.');
                        } catch (error) {
                          console.error(error);
                          toast.error('Failed to update plan.');
                        }
                      }}
                    >
                      Change Plan
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={async () => {
                        const nextBilling = { ...billing, subscriptionActive: false };

                        try {
                          await saveBilling(nextBilling);
                          setBilling(nextBilling);
                          toast('Subscription cancelled successfully.');
                        } catch (error) {
                          console.error(error);
                          toast.error('Failed to cancel subscription.');
                        }
                      }}
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-3">Payment Method</h4>
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-12 bg-card border border-border rounded flex items-center justify-center font-bold text-xs">VISA</div>
                      <span className="text-sm text-foreground font-medium">•••• •••• •••• {billing.cardNumber.slice(-4)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Expires {billing.expiryDate}</span>
                  </div>
                  <Button variant="link" className="px-0 mt-2 text-primary-600" onClick={() => setShowPaymentModal(true)}>Add new payment method</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Modal */}
          {showPaymentModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-card w-full max-w-md rounded-xl shadow-elevated border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Add Payment Method</h3>
                  <button onClick={() => setShowPaymentModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cardholder Name</label>
                    <Input value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Card Number</label>
                    <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Expiry Date</label>
                      <Input type="month" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CVV</label>
                      <Input type="password" maxLength={3} value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" />
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                  <Button onClick={async () => {
                    const nextBilling = {
                      ...billing,
                      cardholderName,
                      cardNumber,
                      expiryDate,
                      cvv,
                    };

                    try {
                      await saveBilling(nextBilling);
                      setBilling(nextBilling);
                      toast.success("Payment method added successfully!");
                      setShowPaymentModal(false);
                    } catch (error) {
                      console.error(error);
                      toast.error("Failed to save payment method.");
                    }
                  }}>Save Card</Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
