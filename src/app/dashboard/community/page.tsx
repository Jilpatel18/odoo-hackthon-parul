"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Filter, ArrowUpDown, Layers, Heart, MessageSquare, Share2, MapPin, Plus, Loader2, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { useDashboardUser } from "@/components/layout/DashboardLayout";

type CommunityPost = {
  id: number;
  userId: number;
  user: string;
  avatar: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  likes: number;
  comments: number;
  likedByMe: boolean;
  isFollowing: boolean;
  timeAgo: string;
};

type PostComment = {
  id: number;
  content: string;
  user: string;
  avatar: string;
  timeAgo: string;
};

export default function CommunityPage() {
  const currentUser = useDashboardUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postTripId, setPostTripId] = useState("1");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comments state
  const [commentsOpenPostId, setCommentsOpenPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await fetch("/api/community/posts", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch posts");
        }

        setPosts(data.posts);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load community posts from database.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleAction = (action: string) => {
    toast.success(`${action} feature coming soon!`);
  };

  const handleLike = async (postId: number) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to toggle like");
      }

      setPosts((current) => current.map((post) => (
        post.id === postId ? { ...post, likes: data.likes, likedByMe: data.liked } : post
      )));
    } catch (error) {
      console.error(error);
      toast.error("Failed to update like.");
    }
  };

  const handleFollow = async (post: CommunityPost) => {
    try {
      const res = await fetch("/api/community/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followeeId: post.userId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to toggle follow");
      }

      setPosts((current) => current.map((item) => (
        item.userId === post.userId ? { ...item, isFollowing: data.following } : item
      )));
      toast.success(data.following ? "Now following user." : "Unfollowed user.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update follow status.");
    }
  };

  const handleComment = async (postId: number) => {
    setCommentsOpenPostId(postId);
    setIsLoadingComments(true);
    setComments([]);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`);
      const data = await res.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      toast.error("Failed to load comments.");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentsOpenPostId || !newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const res = await fetch(`/api/community/posts/${commentsOpenPostId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setComments([...comments, data.comment]);
      setNewComment("");
      
      // Update post comment count locally
      setPosts(current => current.map(p => p.id === commentsOpenPostId ? { ...p, comments: p.comments + 1 } : p));
      toast.success("Comment posted!");
    } catch (error) {
      toast.error("Failed to post comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async (post: CommunityPost) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/shared/trip/${post.id}`);
      toast.success("Link copied to clipboard!");
    } catch (e) {
      toast.error("Failed to copy link");
    }
  };

  const handleCreatePost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle,
          description: postDescription,
          image: postImage,
          tags: ["Community", `Trip ${postTripId}`],
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create post");
      }

      setPosts((current) => [data.post, ...current]);
      setPostTitle("");
      setPostDescription("");
      setPostImage("");
      setIsCreateOpen(false);
      toast.success("Trip posted to the community!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const visiblePosts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return posts.filter((post) =>
      post.title.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      post.user.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Community Hub</h1>
          <p className="mt-1 text-muted-foreground">Discover and share experiences with fellow travelers.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Post
        </Button>
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
        {isLoading ? (
          <Card className="p-6 text-muted-foreground">Loading community posts...</Card>
        ) : visiblePosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-medium transition-shadow border-border">
            <CardHeader className="p-4 sm:p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ImageWithFallback src={post.avatar} alt={post.user} className="h-10 w-10 rounded-full object-cover border border-border" />
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{post.user}</h3>
                    <p className="text-xs text-muted-foreground">{post.timeAgo}</p>
                  </div>
                </div>
                {currentUser?.id !== post.userId && (
                  <Button variant="ghost" size="sm" className="h-8 text-primary-600 font-medium" onClick={() => handleFollow(post)}>
                    {post.isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-4">
              <Link href={`/shared/trip/${post.id}`} className="block group">
                <h2 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">{post.title}</h2>
              </Link>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.description}</p>
              
              <Link href={`/shared/trip/${post.id}`} className="block h-48 sm:h-64 w-full rounded-xl overflow-hidden mb-4 group">
                <ImageWithFallback src={post.image} alt="Trip preview" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
              </Link>

              <Link href={`/shared/trip/${post.id}`} className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors mb-4">
                View trip details
              </Link>

              <div className="flex flex-wrap gap-2 mb-1">
                {post.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    <MapPin className="mr-1 h-3 w-3" /> {tag}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-4 sm:px-6 border-t border-border bg-muted/20 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button onClick={() => handleLike(post.id)} className={`flex items-center space-x-1.5 text-sm transition-colors ${post.likedByMe ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}>
                  <Heart className="h-4 w-4" />
                  <span>{post.likes}</span>
                </button>
                <button onClick={() => handleComment(post.id)} className="flex items-center space-x-1.5 text-sm text-muted-foreground hover:text-blue-500 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments}</span>
                </button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleShare(post)}>
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-elevated overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-lg font-semibold text-foreground">Create Community Post</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-muted-foreground hover:text-foreground">×</button>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-4 p-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Title</label>
                <Input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Share your trip story" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  rows={4}
                  className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  placeholder="Tell the community what made your trip special"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Image</label>
                <ImageUpload value={postImage} onChange={setPostImage} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Trip</label>
                <select value={postTripId} onChange={(e) => setPostTripId(e.target.value)} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <option value="1">Summer in Kyoto</option>
                  <option value="2">Swiss Alps Adventure</option>
                  <option value="3">Rome Weekend</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-border mt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Posting..." : "Post"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {commentsOpenPostId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-elevated flex flex-col h-[80vh] max-h-[600px]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
              <h3 className="text-lg font-semibold text-foreground">Comments</h3>
              <button onClick={() => setCommentsOpenPostId(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {isLoadingComments ? (
                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : comments.length === 0 ? (
                <div className="text-center text-muted-foreground p-8">No comments yet. Be the first to comment!</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <ImageWithFallback src={comment.avatar} alt={comment.user} className="h-8 w-8 rounded-full object-cover shrink-0" />
                    <div className="bg-muted/30 rounded-xl p-3 flex-1">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-semibold text-foreground">{comment.user}</span>
                        <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                      </div>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-border shrink-0 bg-muted/10">
              <form onSubmit={submitComment} className="flex space-x-2">
                <Input 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  placeholder="Add a comment..." 
                  className="flex-1"
                  disabled={isSubmittingComment}
                />
                <Button type="submit" disabled={!newComment.trim() || isSubmittingComment}>
                  {isSubmittingComment ? "Posting..." : "Post"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
