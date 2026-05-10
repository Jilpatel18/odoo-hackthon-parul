"use client";

import { useState } from "react";
import { Search, Filter, ArrowUpDown, Layers, Heart, MessageSquare, Share2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import toast from "react-hot-toast";

const MOCK_COMMUNITY_POSTS = [
  {
    id: 1,
    user: "Sarah Jenkins",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    title: "10 Days exploring the Swiss Alps on a budget!",
    description: "Just got back from an amazing trip. We managed to keep costs down by staying in smaller villages and cooking our own meals. Here is my full itinerary and budget breakdown.",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=600&auto=format&fit=crop",
    tags: ["Budget", "Nature", "Europe"],
    likes: 124,
    comments: 18,
    timeAgo: "2 hours ago"
  },
  {
    id: 2,
    user: "Marcus Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    title: "Hidden gems in Tokyo's culinary scene",
    description: "Skip the tourist traps! I've compiled a list of the best local izakayas and ramen spots we discovered during our 2-week food tour.",
    image: "https://images.unsplash.com/photo-1542051812871-7575008240f8?q=80&w=600&auto=format&fit=crop",
    tags: ["Foodie", "Asia", "City"],
    likes: 342,
    comments: 45,
    timeAgo: "5 hours ago"
  },
  {
    id: 3,
    user: "Elena Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
    title: "Ultimate Guide to Backpacking South America",
    description: "Our 3-month itinerary covering Peru, Bolivia, Chile, and Argentina. Includes all transport details and border crossing tips.",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600&auto=format&fit=crop",
    tags: ["Backpacking", "Adventure", "Long-term"],
    likes: 89,
    comments: 12,
    timeAgo: "1 day ago"
  }
];

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleAction = (action: string) => {
    toast.success(`${action} feature coming soon!`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Community Hub</h1>
          <p className="mt-1 text-muted-foreground">Discover and share experiences with fellow travelers.</p>
        </div>
      </div>

      {/* Wireframe-accurate search and filter bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search trips, places, or users..." 
            className="pl-9 h-10 w-full bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <Button variant="outline" size="sm" onClick={() => handleAction("Group By")} className="whitespace-nowrap bg-card">
            <Layers className="mr-2 h-4 w-4" /> Group by
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleAction("Filter")} className="whitespace-nowrap bg-card">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleAction("Sort")} className="whitespace-nowrap bg-card">
            <ArrowUpDown className="mr-2 h-4 w-4" /> Sort by
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {MOCK_COMMUNITY_POSTS.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-medium transition-shadow border-border">
            <CardHeader className="p-4 sm:p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={post.avatar} alt={post.user} className="h-10 w-10 rounded-full object-cover border border-border" />
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{post.user}</h3>
                    <p className="text-xs text-muted-foreground">{post.timeAgo}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-primary-600 font-medium">Follow</Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-4">
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.description}</p>
              
              <div className="h-48 sm:h-64 w-full rounded-xl overflow-hidden mb-4">
                <img src={post.image} alt="Trip preview" className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    <MapPin className="mr-1 h-3 w-3" /> {tag}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-4 sm:px-6 border-t border-border bg-muted/20 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button onClick={() => handleAction("Like")} className="flex items-center space-x-1.5 text-sm text-muted-foreground hover:text-red-500 transition-colors">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes}</span>
                </button>
                <button onClick={() => handleAction("Comment")} className="flex items-center space-x-1.5 text-sm text-muted-foreground hover:text-blue-500 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments}</span>
                </button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleAction("Share")}>
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
