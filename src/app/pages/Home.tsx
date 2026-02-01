import { useState } from "react";
import { Lock, FileText, User, Shield, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllEntries } from "@/app/utils/journalStorage";
import { getUserSettings } from "@/app/utils/userSettings";
import { JournalMascotExcited } from "@/app/components/JournalMascotExcited";

export default function Home() {
  const settings = getUserSettings();
  const username = settings.username;
  const entries = getAllEntries();
  const navigate = useNavigate();
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  
  // Dynamic AI messages based on user's journaling
  const getAIMessage = () => {
    if (entries.length === 0) {
      return "Welcome! I'm here to help you start your journaling journey. Would you like to capture how you're feeling today?";
    }
    
    const lastEntry = entries[0]; // Most recent entry
    const daysSinceLastEntry = Math.floor((new Date().getTime() - lastEntry.date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastEntry === 0) {
      return `Great to see you again today! You've been really consistent with your journaling. How are you feeling right now?`;
    } else if (daysSinceLastEntry === 1) {
      return `Welcome back! It's been a day since your last entry. Would you like to reflect on what happened yesterday?`;
    } else if (daysSinceLastEntry > 7) {
      return `It's been ${daysSinceLastEntry} days since your last entry. No pressure—I'm here whenever you're ready to write. What's been on your mind?`;
    } else {
      return `Hey! It's been ${daysSinceLastEntry} days. Sometimes life gets busy—that's okay. Want to take a moment to check in with yourself?`;
    }
  };
  
  const aiMessage = getAIMessage();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 w-full relative">
      {/* Vault Button - Top Right */}
      <div className="absolute top-8 right-6 md:right-12 z-10">
        <button
          onClick={() => setIsVaultOpen(!isVaultOpen)}
          className="flex items-center gap-2 px-5 py-3 bg-card/80 backdrop-blur-sm rounded-[20px] shadow-md border border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group"
        >
          <Lock className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" />
          <span className="text-foreground/80 text-sm font-medium">Vault</span>
          <ChevronDown 
            className={`w-4 h-4 text-muted-foreground/60 transition-transform duration-300 ${
              isVaultOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {/* Dropdown Menu */}
        {isVaultOpen && (
          <div className="absolute top-full right-0 mt-3 w-64 bg-card/95 backdrop-blur-xl rounded-[24px] shadow-2xl border border-primary/15 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="p-2">
              {/* View All Journal Entries */}
              <button 
                onClick={() => {
                  navigate("/all-entries");
                  setIsVaultOpen(false);
                }}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-[18px] hover:bg-primary/8 transition-all duration-300 group text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <FileText className="w-5 h-5 text-primary/70" />
                </div>
                <div className="flex-1">
                  <div className="text-foreground/90 text-sm font-medium">All Journal Entries</div>
                  <div className="text-muted-foreground/60 text-xs mt-0.5">View your history</div>
                </div>
              </button>

              {/* Personalize */}
              <button 
                onClick={() => {
                  navigate("/personalize-mascot");
                  setIsVaultOpen(false);
                }}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-[18px] hover:bg-primary/8 transition-all duration-300 group text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <User className="w-5 h-5 text-primary/70" />
                </div>
                <div className="flex-1">
                  <div className="text-foreground/90 text-sm font-medium">Personalize</div>
                  <div className="text-muted-foreground/60 text-xs mt-0.5">Customize your experience</div>
                </div>
              </button>

              {/* Privacy Settings */}
              <button 
                onClick={() => {
                  navigate("/privacy-settings");
                  setIsVaultOpen(false);
                }}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-[18px] hover:bg-primary/8 transition-all duration-300 group text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Shield className="w-5 h-5 text-primary/70" />
                </div>
                <div className="flex-1">
                  <div className="text-foreground/90 text-sm font-medium">Privacy Settings</div>
                  <div className="text-muted-foreground/60 text-xs mt-0.5">Manage your data</div>
                </div>
              </button>
            </div>

            {/* Divider and Footer */}
            <div className="border-t border-primary/10 px-5 py-3 bg-background/20">
              <p className="text-xs text-muted-foreground/50 text-center">
                Your vault is private & secure
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content Wrapper */}
      <div className="flex flex-col items-center gap-12 w-full max-w-xl">
        {/* Header section */}
        <div className="text-center space-y-2 pt-24 md:pt-36">
          <h1 className="text-3xl md:text-4xl text-foreground/90">
            Welcome back, {username}
          </h1>
          <p className="text-muted-foreground text-base">
            Take a moment to reflect and breathe
          </p>
        </div>

        {/* AI Assistant Section */}
        <div className="w-full space-y-8">
          {/* Mascot */}
          <div className="flex justify-center">
          <JournalMascotExcited size={window.innerWidth < 768 ? 144 : 192} />
          </div>

          {/* AI Message Card */}
          <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-primary/8 hover:shadow-md hover:border-primary/12 transition-all duration-300">
            <p className="text-foreground/90 text-base md:text-lg leading-relaxed">
              {aiMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}