"use client";

import { useEffect, useRef, useState } from "react";
import { User, MapPin, Map, Award, Camera, Settings as SettingsIcon, X, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import toast from 'react-hot-toast';
import { useDashboardUser } from "@/components/layout/DashboardLayout";

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  bio: string;
  coverUrl: string;
  avatarUrl: string;
};

const buildDefaultProfile = (displayName: string | undefined, email: string | undefined): ProfileData => {
  const nameParts = (displayName || "Traveler").trim().split(/\s+/);

  return {
    firstName: nameParts[0] || "Traveler",
    lastName: nameParts.slice(1).join(" ") || "",
    email: email || "traveler@example.com",
    location: "San Francisco, CA",
    bio: "Passionate traveler, food lover, and photography enthusiast.",
    coverUrl: "https://images.unsplash.com/photo-1506744626753-1fa44df14c28?q=80&w=2000&auto=format&fit=crop",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
  };
};

export default function ProfilePage() {
  const currentUser = useDashboardUser();
  const initialProfile = buildDefaultProfile(currentUser?.name, currentUser?.email);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [firstName, setFirstName] = useState(initialProfile.firstName);
  const [lastName, setLastName] = useState(initialProfile.lastName);
  const [email, setEmail] = useState(initialProfile.email);
  const [location, setLocation] = useState(initialProfile.location);
  const [bio, setBio] = useState(initialProfile.bio);
  const [coverUrl, setCoverUrl] = useState(initialProfile.coverUrl);
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl);
  const [tempUrl, setTempUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/account/profile", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load profile");
        }

        const profile = data.profile as ProfileData;
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setEmail(profile.email);
        setLocation(profile.location);
        setBio(profile.bio);
        setCoverUrl(profile.coverUrl);
        setAvatarUrl(profile.avatarUrl);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load profile from database.");
      }
    };

    loadProfile();
  }, []);

  const persistProfile = async (nextValues?: Partial<ProfileData>) => {
    const payload: ProfileData = {
      firstName,
      lastName,
      email,
      location,
      bio,
      coverUrl,
      avatarUrl,
      ...nextValues,
    };

    const res = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to save profile");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      await persistProfile();
      toast.success("Personal information updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save profile updates.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCover = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tempUrl) return;

    try {
      setCoverUrl(tempUrl);
      await persistProfile({ coverUrl: tempUrl });
      toast.success("Cover image updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update cover image.");
    }

    setShowCoverModal(false);
    setTempUrl("");
    setIsDragging(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const objectUrl = URL.createObjectURL(file);
      setTempUrl(objectUrl);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setTempUrl(objectUrl);
    }
  };

  const handleSaveAvatar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tempUrl) return;

    try {
      setAvatarUrl(tempUrl);
      await persistProfile({ avatarUrl: tempUrl });
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile picture.");
    }

    setShowAvatarModal(false);
    setTempUrl("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* Profile Header */}
      <div 
        className="relative h-48 rounded-3xl overflow-hidden bg-primary-900 mb-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${coverUrl})` }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <Button 
          size="sm" 
          variant="outline" 
          className="absolute top-4 right-4 bg-white/10 text-white border-white/20 backdrop-blur-md hover:bg-white/20 z-10" 
          onClick={() => {
            setTempUrl("");
            setShowCoverModal(true);
          }}
        >
          <Camera className="mr-2 h-4 w-4" /> Edit Cover
        </Button>
      </div>

      <div className="px-6 sm:px-10 relative">
        <div className="absolute -top-24 flex items-end space-x-6 z-10">
          <div className="relative h-32 w-32 rounded-full border-4 border-background overflow-hidden bg-muted group cursor-pointer">
            <img 
              src={avatarUrl} 
              alt={`${firstName} ${lastName}`.trim() || "Traveler"}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <button 
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" 
              onClick={() => {
                setTempUrl("");
                setShowAvatarModal(true);
              }}
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="pb-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{firstName} {lastName}</h1>
            <p className="text-muted-foreground flex items-center mt-1 text-sm font-medium">
              <MapPin className="mr-1 h-4 w-4" /> {location}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 pb-8">
          <Link href="/dashboard/settings">
            <Button variant="outline">
              <SettingsIcon className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">About Me</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {bio} Always looking for the next hidden gem and an excuse to pack my bags.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-sm">
                    <Map className="h-4 w-4 text-muted-foreground mr-3" />
                    <span>Member since 2026</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 text-muted-foreground mr-3" />
                    <span>14 Followers • 28 Following</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
                <form className="space-y-4" onSubmit={handleSaveProfile}>
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
                  </div>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email address" />
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  />
                  <Button type="submit" className="w-full" disabled={isSaving}>{isSaving ? "Saving..." : "Save Profile"}</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 text-foreground">Travel Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground font-medium">World Explored</span>
                      <span className="font-bold">12%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full w-[12%]"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 rounded-xl bg-muted/50 border border-border">
                      <p className="text-2xl font-bold text-foreground">24</p>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Countries</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-muted/50 border border-border">
                      <p className="text-2xl font-bold text-foreground">58</p>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Cities</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h3 className="font-semibold text-xl text-foreground">Achievements</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Card className="bg-linear-to-br from-amber-50 to-amber-100/50 border-amber-200 shadow-none">
                <CardContent className="p-5 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                  <h4 className="font-semibold text-amber-900 text-sm">Globe Trotter</h4>
                  <p className="text-xs text-amber-700/80 mt-1">Visited 20+ countries</p>
                </CardContent>
              </Card>
              <Card className="bg-linear-to-br from-blue-50 to-blue-100/50 border-blue-200 shadow-none">
                <CardContent className="p-5 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <Map className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-900 text-sm">Planner Pro</h4>
                  <p className="text-xs text-blue-700/80 mt-1">Created 10+ itineraries</p>
                </CardContent>
              </Card>
              <Card className="bg-linear-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 shadow-none">
                <CardContent className="p-5 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                    <Award className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-emerald-900 text-sm">Budget Master</h4>
                  <p className="text-xs text-emerald-700/80 mt-1">Stayed under budget 5 times</p>
                </CardContent>
              </Card>
            </div>

            <h3 className="font-semibold text-xl text-foreground mt-8 mb-4">Past Trips map</h3>
            <Card className="overflow-hidden border-border h-75">
              <iframe
                title="Past Trips Map"
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=Kyoto%2C%20Japan&z=10&output=embed"
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Cover Image Modal */}
      {showCoverModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-elevated border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="font-semibold text-lg text-foreground">Update Cover Image</h3>
              <button onClick={() => setShowCoverModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCover}>
              <div className="p-6">
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragging ? "border-primary-500 bg-primary-50" : "border-border hover:bg-muted/50"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  {tempUrl ? (
                    <div className="space-y-4">
                      <div className="h-32 w-full rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${tempUrl})` }}></div>
                      <p className="text-sm font-medium text-primary-600">Image selected! Click to change.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 cursor-pointer flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/30">
                <Button type="button" variant="outline" onClick={() => {
                  setShowCoverModal(false);
                  setTempUrl("");
                }}>Cancel</Button>
                <Button type="submit" disabled={!tempUrl}>Save Cover</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Avatar Image Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-elevated border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="font-semibold text-lg text-foreground">Update Profile Picture</h3>
              <button onClick={() => setShowAvatarModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAvatar}>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Image URL</label>
                  <Input 
                    placeholder="https://example.com/avatar.jpg" 
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">Paste a direct link to an image. Make sure it&apos;s square!</p>
                </div>
              </div>
              <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/30">
                <Button type="button" variant="outline" onClick={() => setShowAvatarModal(false)}>Cancel</Button>
                <Button type="submit">Save Avatar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
