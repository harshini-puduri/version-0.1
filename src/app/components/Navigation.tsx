import { BookOpen, Plus, Compass } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-2xl border-t border-primary/5">
      <nav className="max-w-lg mx-auto px-12 py-4">
        <div className="flex items-center justify-between">
          {/* History */}
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

          {/* Add button */}
          <Link
            to="/add"
            className={`p-5 rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 ${
              location.pathname === "/add"
                ? "bg-primary text-primary-foreground"
                : "bg-primary/90 hover:bg-primary text-primary-foreground"
            }`}
            aria-label="Add new journal entry"
          >
            <Plus className="w-7 h-7" strokeWidth={2} />
          </Link>

          {/* Explore */}
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
        </div>
      </nav>
    </div>
  );
}
