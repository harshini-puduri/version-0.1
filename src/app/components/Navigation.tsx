import { BookOpen, Plus, Compass } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-2xl border-t border-primary/5">
      <nav className="max-w-lg mx-auto px-6 md:px-12 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* History */}
          <div className="relative group">
            <Link
              to="/history"
              className={`p-4 transition-all hover:scale-110 ${
                location.pathname === "/history"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Reflection history"
            >
              <BookOpen className="w-6 h-6" strokeWidth={1.5} />
            </Link>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-12 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">
              Story
            </span>
          </div>

          {/* Add button */}
          <Link
            to="/add"
            className={`p-5 rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 ${
              location.pathname === "/add"
                ? "bg-primary text-primary-foreground"
                : "bg-primary/90 hover:bg-primary text-primary-foreground"
            }`}
            aria-label="Add new journal entry"
            title="New Entry"
          >
            <Plus className="w-7 h-7" strokeWidth={2} />
          </Link>

          {/* Explore */}
          <div className="relative group">
            <Link
              to="/explore"
              className={`p-4 transition-all hover:scale-110 ${
                location.pathname === "/explore"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Explore"
            >
              <Compass className="w-6 h-6" strokeWidth={1.5} />
            </Link>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-12 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">
              Discover
            </span>
          </div>
        </div>
      </nav>
    </div>
  );
}
