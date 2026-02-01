import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/app/pages/Home";
import History from "@/app/pages/History";
import AddEntry from "@/app/pages/AddEntry";
import Explore from "@/app/pages/Explore";
import AllEntries from "@/app/pages/AllEntries";
import PrivacySettings from "@/app/pages/PrivacySettings";
import PersonalizeMascot from "@/app/pages/PersonalizeMascot";
import Navigation from "@/app/components/Navigation";
import { MascotColorsProvider } from "@/app/contexts/MascotColorsContext";

export default function App() {
  return (
    <MascotColorsProvider>
      <BrowserRouter>
        <div className="size-full flex flex-col relative bg-background">
          {/* background */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-secondary/10 -z-10" />

          {/* Main content area */}
          <div className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/add" element={<AddEntry />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/all-entries" element={<AllEntries />} />
            <Route path="/privacy-settings" element={<PrivacySettings />} />
            <Route path="/personalize-mascot" element={<PersonalizeMascot />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Bottom navigation bar */}
          <Navigation />
        </div>
      </BrowserRouter>
    </MascotColorsProvider>
  );
}