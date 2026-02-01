import { useState } from "react";
import { ArrowLeft, Calendar, Clock, Search, Filter, Trash2, Edit3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getAllEntries, JournalEntry, deleteEntry } from "@/app/utils/journalStorage";

export default function AllEntries() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMood, setFilterMood] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Get real journal entries from localStorage
  const entries = getAllEntries();

  const moodColors = {
    calm: "from-blue-500/20 to-blue-600/10",
    happy: "from-yellow-500/20 to-amber-600/10",
    thoughtful: "from-purple-500/20 to-purple-600/10",
    stressed: "from-red-500/20 to-red-600/10",
  };

  const moodEmojis = {
    calm: "🌊",
    happy: "☀️",
    thoughtful: "🌙",
    stressed: "⚡",
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = filterMood === "all" || entry.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
    setDeleteConfirm(null);
    // Force re-render by triggering navigation
    window.location.reload();
  };

  const handleEditEntry = (entryDate: Date) => {
    // Navigate to AddEntry with the date as state
    navigate("/add", { state: { editDate: entryDate } });
  };

  return (
    <div className="flex-1 flex flex-col px-6 pb-24 pt-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 text-foreground/70" />
          </Link>
          <div>
            <h1 className="text-2xl text-foreground/90">Your Journal</h1>
            <p className="text-sm text-muted-foreground/70">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Search your entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-card/60 backdrop-blur-sm rounded-[20px] border border-primary/10 focus:border-primary/30 focus:outline-none text-foreground/90 placeholder:text-muted-foreground/50 transition-all duration-300"
          />
        </div>

        {/* Mood Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
          <select
            value={filterMood}
            onChange={(e) => setFilterMood(e.target.value)}
            className="pl-11 pr-8 py-3 bg-card/60 backdrop-blur-sm rounded-[20px] border border-primary/10 focus:border-primary/30 focus:outline-none text-foreground/90 transition-all duration-300 appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="all">All Moods</option>
            <option value="calm">🌊 Calm</option>
            <option value="happy">☀️ Happy</option>
            <option value="thoughtful">🌙 Thoughtful</option>
            <option value="stressed">⚡ Stressed</option>
          </select>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-primary/30" />
            </div>
            <h3 className="text-xl text-foreground/70 mb-2">No entries found</h3>
            <p className="text-muted-foreground/60">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          filteredEntries.map((entry, index) => (
            <div
              key={entry.id}
              className="bg-card/60 backdrop-blur-sm rounded-[28px] p-6 border border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer group animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => {
                // In a real app, navigate to the specific entry
                console.log("View entry:", entry.id);
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg text-foreground/90 mb-2 group-hover:text-primary transition-colors">
                    {entry.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {entry.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{entry.wordCount} words</span>
                    </div>
                  </div>
                </div>

                {/* Mood Badge */}
                {entry.mood && (
                  <div
                    className={`px-4 py-2 rounded-full bg-gradient-to-r ${
                      moodColors[entry.mood]
                    } backdrop-blur-sm text-sm`}
                  >
                    <span>{moodEmojis[entry.mood]}</span>
                  </div>
                )}
              </div>

              {/* Preview */}
              <p className="text-foreground/70 leading-relaxed line-clamp-2 text-sm">
                {entry.preview}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  className="flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-muted-foreground/90 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(entry.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  className="flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-muted-foreground/90 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditEntry(entry.date);
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div 
          className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-fadeIn"
          onClick={() => setDeleteConfirm(null)}
        >
          <div 
            className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md shadow-2xl border border-primary/15 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-red-500/80" />
            </div>
            <h3 className="text-2xl text-foreground/90 mb-3 text-center">Delete Entry?</h3>
            <p className="text-muted-foreground/70 mb-8 text-center leading-relaxed">
              This entry will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 px-6 py-3 bg-background/60 hover:bg-background/80 border border-primary/20 hover:border-primary/30 rounded-full text-foreground/90 transition-all hover:scale-105"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-full text-red-500 transition-all hover:scale-105 font-medium"
                onClick={() => handleDeleteEntry(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}