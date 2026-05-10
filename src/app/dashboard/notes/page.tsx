"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, ArrowUpDown, Layers, Plus, FileText, MapPin, Calendar, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import toast from "react-hot-toast";

type Note = {
  id: number;
  trip_id: number | null;
  title: string;
  content: string;
  date: string;
  type: "day" | "stop" | "general";
  created_at: string;
};

type Trip = {
  id: number;
  title: string;
};

export function NotesContent({ fixedTripId }: { fixedTripId?: string }) {
  const searchParams = useSearchParams();
  const initialTripId = fixedTripId || searchParams.get("tripId") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortMode, setSortMode] = useState<"newest" | "oldest">("newest");
  const [groupMode, setGroupMode] = useState<"none" | "trip">("none");
  const [notes, setNotes] = useState<Note[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [saveError, setSaveError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedTripId, setSelectedTripId] = useState<string>(initialTripId);

  const fetchNotesAndTrips = async () => {
    try {
      const [notesRes, tripsRes] = await Promise.all([
        fetch(`/api/notes${selectedTripId !== 'all' ? `?tripId=${selectedTripId}` : ''}`),
        fetch('/api/trips')
      ]);
      const notesData = await notesRes.json();
      const tripsData = await tripsRes.json();
      
      if (notesData.success) {
        setNotes(notesData.notes);
      } else {
        toast.error(notesData.error || 'Failed to load notes');
      }
      
      if (tripsData.success) {
        setTrips(tripsData.trips);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesAndTrips();
  }, [selectedTripId]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'By Day') return note.type === 'day';
        if (activeFilter === 'By stop') return note.type === 'stop';
        return true;
      })
      .filter((note) => {
        const searchValue = searchQuery.toLowerCase();
        return (
          note.title.toLowerCase().includes(searchValue) ||
          note.content.toLowerCase().includes(searchValue) ||
          note.date.toLowerCase().includes(searchValue)
        );
      })
      .sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return sortMode === 'newest' ? bTime - aTime : aTime - bTime;
      });
  }, [activeFilter, notes, searchQuery, sortMode]);

  const groupedNotes = useMemo(() => {
    if (groupMode !== 'trip') {
      return [{ key: 'all', label: 'All Notes', items: filteredNotes }];
    }

    const groups = new Map<string, Note[]>();
    filteredNotes.forEach((note) => {
      const trip = trips.find((item) => item.id === note.trip_id);
      const label = trip ? trip.title : 'Ungrouped';
      const items = groups.get(label) || [];
      items.push(note);
      groups.set(label, items);
    });

    return Array.from(groups.entries()).map(([label, items]) => ({
      key: label,
      label,
      items,
    }));
  }, [filteredNotes, groupMode]);

  const handleSaveNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveError("");

    const formData = new FormData(e.currentTarget);
    const title = String(formData.get('title') || '').trim();
    const content = String(formData.get('content') || '').trim();
    const type = String(formData.get('type') || 'day');
    const date = String(formData.get('date') || '').trim();
    const tripIdRaw = String(formData.get('tripId') || '');
    const trip_id = tripIdRaw ? Number(tripIdRaw) : null;

    let succeeded = false;

    try {
      setIsSubmitting(true);
      if (editingNote) {
        const res = await fetch('/api/notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingNote.id, title, content, type, date }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success('Note updated!');
          succeeded = true;
        } else {
          setSaveError(data.error || 'Failed to update note');
        }
      } else {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, type, date, trip_id }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success('Note added!');
          succeeded = true;
        } else {
          setSaveError(data.error || 'Failed to save note');
        }
      }

      if (succeeded) {
        setIsModalOpen(false);
        setEditingNote(null);
        await fetchNotesAndTrips();
      }
    } catch {
      setSaveError('Failed to save note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Note deleted!');
        await fetchNotesAndTrips();
      } else {
        toast.error(data.error || 'Failed to delete note');
      }
    } catch {
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className={fixedTripId ? "space-y-6" : "space-y-6 pb-8"}>
      {!fixedTripId && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Travel Notes</h1>
            <p className="text-muted-foreground mt-1">Keep track of your ideas, bookings, and tips.</p>
          </div>
          <Button onClick={() => { setEditingNote(null); setIsModalOpen(true); }} className="bg-primary-600 text-white hover:bg-primary-700">
            <Plus className="mr-2 h-4 w-4" /> Add Note
          </Button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-center gap-3 w-full bg-card p-4 rounded-xl border border-border">
        {!fixedTripId && (
          <div className="w-full lg:w-64">
            <select 
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="all">All Trips</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>Trip: {trip.title}</option>
              ))}
            </select>
          </div>
        )}
        {fixedTripId && (
          <div className="flex-none">
            <Button onClick={() => { setEditingNote(null); setIsModalOpen(true); }} className="bg-primary-600 text-white hover:bg-primary-700">
              <Plus className="mr-2 h-4 w-4" /> Add Note
            </Button>
          </div>
        )}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-9 h-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap lg:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGroupMode(groupMode === 'trip' ? 'none' : 'trip')}
            className="flex-1 sm:flex-none"
          >
            <Layers className="mr-2 h-4 w-4 hidden sm:inline" /> {groupMode === 'trip' ? 'Ungroup' : 'Group by Trip'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setActiveFilter('All')} className="flex-1 sm:flex-none">
            <Filter className="mr-2 h-4 w-4 hidden sm:inline" /> All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortMode(sortMode === 'newest' ? 'oldest' : 'newest')}
            className="flex-1 sm:flex-none"
          >
            <ArrowUpDown className="mr-2 h-4 w-4 hidden sm:inline" /> {sortMode === 'newest' ? 'Newest first' : 'Oldest first'}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['All', 'By Day', 'By stop'].map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            className={activeFilter === filter ? 'rounded-full' : 'rounded-full border-dashed'}
            onClick={() => setActiveFilter(filter)}
            size="sm"
          >
            {filter}
          </Button>
        ))}
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <p className="text-muted-foreground">Loading notes...</p>
        ) : filteredNotes.length === 0 ? (
          <p className="text-muted-foreground">No notes found. Create your first note!</p>
        ) : (
          groupedNotes.map((group) => (
            <div key={group.key} className="space-y-3">
              {groupMode === 'trip' && (
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">{group.label}</h2>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{group.items.length} notes</span>
                </div>
              )}
              <div className="space-y-4">
                {group.items.map((note) => (
                  <Card key={note.id} className="border-border hover:border-primary-300 transition-colors">
                    <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-primary-600" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{note.title}</h3>
                            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {note.type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{note.content}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                            <span className="inline-flex items-center">
                              {note.type === 'day' ? <Calendar className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                              {note.date}
                            </span>
                            <span>Trip {note.trip_id ?? 'Unassigned'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 self-end sm:self-start">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary-600" onClick={() => { setEditingNote(note); setSaveError(""); setIsModalOpen(true); }}>
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
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editingNote ? 'Edit Note' : 'Add Note'}</h2>
            <form onSubmit={handleSaveNote} className="space-y-4">
              {saveError && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</div>}
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input name="title" defaultValue={editingNote?.title} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Content</label>
                <textarea
                  name="content"
                  defaultValue={editingNote?.content}
                  required
                  rows={4}
                  className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Trip</label>
                <select name="tripId" defaultValue={editingNote?.trip_id?.toString() || (selectedTripId !== 'all' ? selectedTripId : (trips.length > 0 ? trips[0].id.toString() : ''))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>{trip.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Type</label>
                  <select name="type" defaultValue={editingNote?.type || 'day'} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="day">By Day</option>
                    <option value="stop">By Stop</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Date / Stop Name</label>
                  <Input name="date" defaultValue={editingNote?.date} required placeholder="e.g. Day 1 or Rome" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); setEditingNote(null); }} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingNote ? 'Save Changes' : 'Add Note'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <NotesContent />
    </Suspense>
  );
}
