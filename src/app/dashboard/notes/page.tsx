"use client";

import { useState } from "react";
import { Search, Filter, ArrowUpDown, Layers, Plus, FileText, MapPin, Calendar, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import toast from "react-hot-toast";

type Note = {
  id: number;
  title: string;
  content: string;
  date: string;
  type: string;
};

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      if (data.success) setNotes(data.notes);
    } catch (e) {
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  import { useEffect } from "react";
  
  useEffect(() => {
    fetchNotes();
  }, []);

  const handleAction = (action: string) => {
    toast.success(`${action} feature coming soon!`);
  };

  const handleSaveNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const type = formData.get("type") as string;
    const date = formData.get("date") as string;

    try {
      if (editingNote) {
        const res = await fetch('/api/notes', {
          method: 'PUT',
          body: JSON.stringify({ id: editingNote.id, title, content, type, date }),
        });
        if (res.ok) {
          toast.success('Note updated!');
          fetchNotes();
        }
      } else {
        const res = await fetch('/api/notes', {
          method: 'POST',
          body: JSON.stringify({ title, content, type, date }),
        });
        if (res.ok) {
          toast.success('Note added!');
          fetchNotes();
        }
      }
      setIsModalOpen(false);
      setEditingNote(null);
    } catch (e) {
      toast.error('Failed to save note');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Note deleted!');
        fetchNotes();
      }
    } catch (e) {
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Trip Notes</h1>
          <p className="mt-1 text-muted-foreground">Keep all your important reminders and details in one place.</p>
        </div>
        <Button onClick={() => { setEditingNote(null); setIsModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Note
        </Button>
      </div>

      {/* Wireframe-accurate search and filter bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full bg-card p-4 rounded-xl border border-border">
        <div className="w-full sm:w-64">
          <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <option>Trip: Paris & Rome Adventure</option>
            <option>Trip: Swiss Alps Budget</option>
          </select>
        </div>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search notes..." 
            className="pl-9 h-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => handleAction("Group By")} className="flex-1 sm:flex-none">
            <Layers className="mr-2 h-4 w-4 hidden sm:inline" /> Group by
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleAction("Filter")} className="flex-1 sm:flex-none">
            <Filter className="mr-2 h-4 w-4 hidden sm:inline" /> Filter
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleAction("Sort")} className="flex-1 sm:flex-none">
            <ArrowUpDown className="mr-2 h-4 w-4 hidden sm:inline" /> Sort by
          </Button>
        </div>
      </div>

      <div className="flex space-x-2">
        {["All", "By Day", "By stop"].map(filter => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            className={activeFilter === filter ? "rounded-full" : "rounded-full border-dashed"}
            onClick={() => setActiveFilter(filter)}
            size="sm"
          >
            {filter}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-muted-foreground">No notes found. Create your first note!</p>
        ) : notes.filter(note => {
          if (activeFilter === "All") return true;
          if (activeFilter === "By Day") return note.type === "day";
          if (activeFilter === "By stop") return note.type === "stop";
          return true;
        }).filter(note => note.title?.toLowerCase().includes(searchQuery.toLowerCase()) || note.content?.toLowerCase().includes(searchQuery.toLowerCase())).map((note) => (
          <Card key={note.id} className="border-border hover:border-primary-300 transition-colors">
            <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="mt-1 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{note.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{note.content}</p>
                  <div className="flex items-center text-xs text-muted-foreground font-medium">
                    {note.type === "day" ? <Calendar className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                    {note.date}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 self-end sm:self-start">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary-600" onClick={() => { setEditingNote(note); setIsModalOpen(true); }}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => handleDelete(note.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editingNote ? "Edit Note" : "Add Note"}</h2>
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input name="title" defaultValue={editingNote?.title} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Content</label>
                <Input name="content" defaultValue={editingNote?.content} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Type</label>
                  <select name="type" defaultValue={editingNote?.type || "day"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="day">By Day</option>
                    <option value="stop">By Stop</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Date / Stop Name</label>
                  <Input name="date" defaultValue={editingNote?.date} required placeholder="e.g. Day 1 or Rome" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); setEditingNote(null); }}>Cancel</Button>
                <Button type="submit">{editingNote ? "Save Changes" : "Add Note"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
