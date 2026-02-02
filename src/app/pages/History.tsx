import { ArrowLeft, X, ChevronLeft, ChevronRight, Sparkles, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { journalApi } from "@/app/utils/journalApi";
import { JournalEntry } from "@/app/utils/journalStorage";
import { JournalMascot } from "@/app/components/JournalMascot";
import { backendMode } from "@/services/storageMode";
import { ensureDemoSeeded, getDemoUserId } from "@/app/utils/demoSeed";

const getApiUrl = () => backendMode.getUrl();

type Memory = {
  id: number;
  date: string;
  quote: string;
  image: string;
};

type AnalysisData = {
  totalEntries: number;
  totalWords: number;
  avgWords: number;
  mostProductiveMonth: string;
  longestStreak: number;
  daysSinceStart: number;
  topWords: string[];
  firstEntryDate: string;
  growthAreas: Array<{ theme: string; label: string; growth: number; insight: string }>;
  dominantEmotions: string[];
  hasEnoughData: boolean;
};

type TopMoment = {
  // Backend might not include "id" (your sample had rank/date/context etc).
  // We'll accept partial and normalize in UI.
  id?: string;
  date: string;
  quote?: string;
  image?: string;
  significance?: string;
  context?: string;
};

type ReflectionResponse = {
  // Your backend returns { insights: <dict>, generated_at: ... }
  // but your UI expects {content, insights[], recommendations[]}
  // We'll normalize to this shape:
  content: string;
  insights: string[];
  recommendations: string[];
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type TopMomentsPayload = { moments: TopMoment[]; total_found?: number; analysis_date?: string };
type LifeLessonsPayload = { lessons: string[]; total_found?: number; analysis_date?: string };
type ReflectionPayload = { question_type: string; insights: any; generated_at?: string }; // insights could be dict/string

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Normalizes whatever the backend "insights" is into the UI-friendly ReflectionResponse
function normalizeReflectionPayload(payload: ReflectionPayload): ReflectionResponse {
  const raw = payload?.insights;

  // If your service returns a dict like { content, insights, recommendations }
  if (raw && typeof raw === "object") {
    const content = typeof raw.content === "string" ? raw.content : "";
    const insightsArr = Array.isArray(raw.insights) ? raw.insights.filter((x: any) => typeof x === "string") : [];
    const recsArr = Array.isArray(raw.recommendations)
      ? raw.recommendations.filter((x: any) => typeof x === "string")
      : [];
    return { content, insights: insightsArr, recommendations: recsArr };
  }

  // If it returns a string blob
  if (typeof raw === "string") {
    return { content: raw, insights: [], recommendations: [] };
  }

  return { content: "", insights: [], recommendations: [] };
}

export default function History() {
      // DEMO memories fallback
      const DEMO_MEMORIES: Memory[] = [
        { id: 1, date: "15 days ago", quote: "Sunrise at the Lake: Captured the beautiful sunrise shimmering over the calm lake. Felt grateful for nature's wonders.", image: "https://amzn-ai-journal-0.1.s3.amazonaws.com/camera1.jpg" },
        { id: 2, date: "14 days ago", quote: "Coffee with Friends: Shared laughter and stories at our favorite café. The aroma of fresh coffee made the morning perfect.", image: "https://amzn-ai-journal-0.1.s3.amazonaws.com/camera2.jpg" },
        { id: 3, date: "13 days ago", quote: "City Lights: Walked downtown at night, mesmerized by the city lights and vibrant energy.", image: "https://amzn-ai-journal-0.1.s3.amazonaws.com/camera3.jpg" },
        { id: 4, date: "12 days ago", quote: "Rainy Day Reading: Spent the afternoon reading by the window as rain tapped gently on the glass.", image: "https://amzn-ai-journal-0.1.s3.amazonaws.com/camera4.jpg" },
        { id: 5, date: "11 days ago", quote: "Mountain Hike: Reached the summit after a challenging hike. The view was breathtaking and rewarding.", image: "https://amzn-ai-journal-0.1.s3.amazonaws.com/camera5.jpg" },
        { id: 6, date: "10 days ago", quote: "Family Picnic: Enjoyed a sunny day at the park with family, sharing food and laughter.", image: "https://amzn-ai-journal-0.1.s3.amazonaws.com/camera6.jpg" },
        { id: 7, date: "9 days ago", quote: "Art Gallery Visit: Discovered inspiring artwork and met local artists.", image: "https://amzn-ai-journal-0.1.s3.amazonaws.com/camera7.jpg" },
        { id: 8, date: "8 days ago", quote: "Cooking Night: Tried a new recipe and had fun experimenting in the kitchen.", image: "https://amzn-ai-journal-0.1.s3.amazonaws.com/camera8.jpg" },
        { id: 9, date: "7 days ago", quote: "Beach Walk: Strolled along the shore, collecting seashells and enjoying the breeze.", image: "https://amzn-ai-journal-0.1.s3.amazonaws.com/camera9.jpg" },
        { id: 10, date: "6 days ago", quote: "Board Game Night: Played games with friends, lots of laughter and friendly competition.", image: "https://amzn-ai-journal-0.1.s3.amazonaws.com/camera10.jpg" }
      ];
    // Seed demo data on load
    useEffect(() => {
      const apiUrl = getApiUrl();
      fetch(`${apiUrl}/api/demo/seed?user_id=demo_user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch((err) => {
        // Ignore errors, fallback logic will handle empty state
        console.error("Demo seed request failed:", err);
      });
    }, []);
  // State declarations must come first
  const navigate = useNavigate();

  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [showReflection, setShowReflection] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [topMoments, setTopMoments] = useState<TopMoment[]>([]);
  const [lifeLessons, setLifeLessons] = useState<string[]>([]);

  const [reflectionContent, setReflectionContent] = useState<Record<string, ReflectionResponse>>({});
  const [loadingReflection, setLoadingReflection] = useState(false);

  // only used to measure layout in your original; keeping ref for optional use later
  const itemRef = useRef<HTMLDivElement>(null);

  // ...existing code...

  const canCarouselAdvance = useMemo(() => {
    return !expandedCard && !showReflection && (topMoments.length > 0 || journalEntries.length > 0);
  }, [expandedCard, showReflection, topMoments.length, journalEntries.length]);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const userId = getDemoUserId();

      // Ensure demo seed before history endpoints
      await ensureDemoSeeded(signal);

      // 1) journal entries (local)
      const entries = await journalApi.getAllEntries();
      if (signal?.aborted) return;
      setJournalEntries(entries);

      // If there are no entries, don't call history endpoints
      if (entries.length === 0) {
        setAnalysisData(null);
        setTopMoments([]);
        setLifeLessons([]);
        return;
      }

      // 2) analysis
      const analysisEnvelope = await fetchJson<ApiEnvelope<AnalysisData>>(`${apiUrl}/api/history/analysis?user_id=${userId}`, signal);
      if (!signal?.aborted) setAnalysisData(analysisEnvelope.data);

      // 3) top moments
      const momentsEnvelope = await fetchJson<ApiEnvelope<TopMomentsPayload>>(`${apiUrl}/api/history/top-moments?user_id=${userId}`, signal);
      if (!signal?.aborted) setTopMoments(Array.isArray(momentsEnvelope.data?.moments) ? momentsEnvelope.data.moments : []);

      // 4) life lessons
      const lessonsEnvelope = await fetchJson<ApiEnvelope<LifeLessonsPayload>>(`${apiUrl}/api/history/life-lessons?user_id=${userId}`, signal);
      if (!signal?.aborted) setLifeLessons(Array.isArray(lessonsEnvelope.data?.lessons) ? lessonsEnvelope.data.lessons : []);
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        console.error("Failed to load data:", err);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const loadReflection = useCallback(
    async (type: string) => {
      if (reflectionContent[type] || loadingReflection) return;

      const controller = new AbortController();
      try {
        setLoadingReflection(true);
        const apiUrl = getApiUrl();

        const env = await fetchJson<ApiEnvelope<ReflectionPayload>>(`${apiUrl}/api/history/reflection/${type}?user_id=demo_user`, controller.signal);
        const normalized = normalizeReflectionPayload(env.data);

        setReflectionContent((prev) => ({ ...prev, [type]: normalized }));
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error(`Failed to load ${type} reflection:`, err);
        }
      } finally {
        setLoadingReflection(false);
      }

      return () => controller.abort();
    },
    [reflectionContent, loadingReflection]
  );

  // Use top moments from API or fallback to entries with images
  const memories: Memory[] = useMemo(() => {
    // 1) Use API top moments if present
    if (topMoments?.length) {
      const mapped = topMoments
        .map((m, idx) => ({
          id: idx + 1,
          date: m.date || "",
          quote: m.quote || m.significance || m.context || "",
          image: m.image || "",
        }))
        .filter((m) => m.image);
      if (mapped.length) return mapped;
    }

    // 2) Use local entries w/ images
    const fromEntries = journalEntries
      .filter((e: any) => (e.images?.length ?? 0) > 0)
      .slice(0, 10)
      .map((e: any, idx: number) => ({
        id: idx + 1,
        date: e.created_at ? safeFormatDate(e.created_at) : "",
        quote: (e.content || "").slice(0, 160),
        image: e.images?.[0]?.url ?? e.images?.[0] ?? "",
      }))
      .filter((m: Memory) => m.image);
    if (fromEntries.length) return fromEntries;

    // 3) Last resort demo
    return DEMO_MEMORIES;
  }, [topMoments, journalEntries]);

  // Keep currentIndex in range when memories change
  useEffect(() => {
    if (memories.length === 0) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex((prev) => Math.min(prev, memories.length - 1));
  }, [memories.length]);

  const handlePrevious = () => {
    if (memories.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);
  };

  const handleNext = () => {
    if (memories.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % memories.length);
  };

  const topLessons = useMemo(() => {
    if (lifeLessons.length > 0) return lifeLessons;

    // fallback: mock top lessons
    return [
      "Cherish the sunrise and new beginnings.",
      "Friendship and laughter are life's best gifts.",
      "Find beauty in everyday city lights.",
      "Quiet moments with a book bring peace.",
      "Challenge yourself—mountain views are worth the climb.",
      "Family time creates lasting memories.",
      "Art and creativity inspire growth.",
      "Trying new things brings joy.",
      "Nature walks refresh the soul.",
      "Play and fun are important too!"
    ];
  }, [lifeLessons]);

  const expandedMemory = useMemo(() => memories.find((m) => m.id === expandedCard) ?? null, [expandedCard, memories]);

  // Auto-advance (only when it makes sense)
  useEffect(() => {
    if (!canCarouselAdvance) return;
    if (memories.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % memories.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [canCarouselAdvance, memories.length]);

  const reflectionInsights = analysisData;
    // Fallback for StatCard values if analysisData is missing
    const reflectionStats = reflectionInsights || {
      totalEntries: 5,
      totalWords: 500,
      daysSinceStart: 15,
      avgWords: 100,
      longestStreak: 7,
      mostProductiveMonth: "January 2026"
    };
  // Fallback mock for reflection/explore content if backend is empty
  const mockReflection = {
    content: "Your journey is filled with growth, connection, and discovery. Keep exploring new horizons and cherishing the moments that matter.",
    insights: [
      "You value meaningful experiences and relationships.",
      "You find inspiration in nature and creativity.",
      "You embrace challenges and celebrate achievements."
    ],
    recommendations: [
      "Take time to reflect on your progress.",
      "Share your stories with friends.",
      "Set new goals for the coming months."
    ]
  };

  return (
    <>
      <div className="flex-1 flex flex-col items-center px-6 pb-32 pt-12 max-w-6xl mx-auto w-full">
        {/* Back button */}
        <div className="w-full mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Home</span>
          </Link>
        </div>

        {/* Header section */}
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl text-foreground/90">Story Of My Life</h1>
          <p className="text-muted-foreground text-lg italic">Moments that mattered to you</p>
        </div>

        {/* Loading / Empty states */}
        {loading && (
          <div className="w-full max-w-2xl text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your journey…</p>
          </div>
        )}

        {!loading && memories.length === 0 && (
          <div className="w-full max-w-2xl mx-auto mt-2 text-center bg-card/60 border border-primary/10 rounded-3xl p-10">
            <div className="mx-auto mb-6">
              <JournalMascot size={96} />
            </div>
            <h2 className="text-2xl text-foreground/90 mb-3">No memories yet</h2>
            <p className="text-muted-foreground mb-6">Add an entry with a photo to start building your story.</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-primary/10 rounded-full text-primary font-medium border border-primary/20 hover:bg-primary/20 transition-all"
              type="button"
            >
              Go write an entry
            </button>
          </div>
        )}

        {/* Carousel section */}
        {!loading && memories.length > 0 && (
          <>
            <div className="relative w-full mb-8 group">
              <div className="flex justify-center items-center py-8 md:py-12">
                <div className="w-full max-w-4xl px-4 md:px-16 relative h-80 md:h-96">
                  <div className="flex justify-center items-center h-full relative">
                    {memories.map((memory, index) => {
                      const isActive = index === currentIndex;
                      const len = memories.length;

                      const isPrev = index === (currentIndex - 1 + len) % len;
                      const isNext = index === (currentIndex + 1) % len;
                      const isPrevPrev = index === (currentIndex - 2 + len) % len;
                      const isNextNext = index === (currentIndex + 2) % len;

                      let positionClass = "absolute opacity-0 scale-50 pointer-events-none";
                      let zIndex = 0;

                      if (isActive) {
                        positionClass = "absolute opacity-100 scale-110 pointer-events-auto z-30";
                        zIndex = 30;
                      } else if (isPrev || isNext) {
                        positionClass = "absolute opacity-40 scale-75 md:scale-85 pointer-events-none z-10";
                        zIndex = 10;
                      } else if (isPrevPrev || isNextNext) {
                        positionClass = "absolute opacity-20 scale-60 md:scale-70 pointer-events-none z-5";
                        zIndex = 5;
                      }

                      const left = isActive ? "50%" : isPrev ? "20%" : isNext ? "80%" : isPrevPrev ? "2%" : isNextNext ? "98%" : "50%";
                      const top = isActive ? "48%" : isPrev || isNext ? "52%" : isPrevPrev || isNextNext ? "56%" : "50%";

                      return (
                        <div
                          key={`${memory.id}-${index}`}
                          ref={index === 0 ? itemRef : undefined}
                          className={`transition-all duration-500 ease-out ${positionClass}`}
                          style={{
                            zIndex,
                            top,
                            left,
                            transform: "translate(-50%, -50%)",
                            willChange: "transform",
                          }}
                        >
                          <div
                            className="w-64 h-80 md:w-80 md:h-96 bg-card rounded-3xl overflow-hidden shadow-xl border border-primary/10 cursor-pointer hover:shadow-2xl transition-shadow duration-300"
                            onClick={() => {
                              if (isActive) setExpandedCard(memory.id);
                            }}
                            role="button"
                            tabIndex={isActive ? 0 : -1}
                          >
                            <ImageWithFallback src={memory.image} alt={memory.quote} className="w-full h-full object-cover" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handlePrevious}
                    className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-primary/20 hover:bg-primary/30 backdrop-blur-sm transition-all opacity-70 md:opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg z-40"
                    aria-label="Previous"
                    type="button"
                  >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-primary/20 hover:bg-primary/30 backdrop-blur-sm transition-all opacity-70 md:opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg z-40"
                    aria-label="Next"
                    type="button"
                  >
                    <ChevronRight className="w-6 h-6 text-foreground" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-muted-foreground/60 text-sm mb-6">Tap a card to relive the moment</p>

            {!expandedCard && (
              <button
                onClick={() => setShowReflection(true)}
                className="mb-10 inline-flex items-center gap-2 px-8 py-3 bg-primary/15 hover:bg-primary/25 rounded-full border border-primary/20 text-primary transition-all hover:scale-105 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500"
                type="button"
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-medium text-sm">Reflect on Your Journey</span>
              </button>
            )}

            {!expandedCard && (
              <div className="w-full max-w-2xl mx-auto mt-2">
                <h2 className="text-3xl text-foreground/90 mb-8 text-center">Top Lessons</h2>
                <div className="space-y-4">
                  {lifeLessons.length > 0 ? (
                    lifeLessons.map((lesson, index) => (
                      <div key={index} className="p-6 rounded-2xl bg-card/60 border border-primary/10 backdrop-blur-sm">
                        <p className="text-foreground/80 text-lg leading-relaxed italic text-center">{lesson}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 rounded-2xl bg-card/60 border border-primary/10 backdrop-blur-sm text-center text-muted-foreground">
                      No lessons found yet. Keep journaling to discover your top lessons!
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Expanded overlay */}
      {expandedCard && expandedMemory && (
        <div
          className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-fadeIn"
          onClick={() => setExpandedCard(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl animate-scaleIn overflow-y-auto max-h-screen" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setExpandedCard(null)}
              className="fixed top-6 right-6 p-3 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-all hover:scale-110"
              aria-label="Close"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="bg-card rounded-[48px] overflow-hidden shadow-2xl border border-primary/10">
              <div className="relative h-96 group rounded-[48px] overflow-hidden">
                <ImageWithFallback src={expandedMemory.image} alt={expandedMemory.quote} className="w-full h-full object-cover rounded-[48px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                <div className="absolute top-6 left-6">
                  <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-2xl">
                    <p className="text-sm text-foreground/90 font-medium">{expandedMemory.date}</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-foreground/95 text-xl leading-relaxed italic font-medium">"{expandedMemory.quote}"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reflection Overlay */}
      {showReflection && (
        <div
          className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 p-6 animate-fadeIn overflow-y-auto"
          onClick={() => setShowReflection(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-4xl mx-auto my-8 animate-scaleIn min-h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowReflection(false)}
              className="fixed top-6 right-6 p-3 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-all hover:scale-110"
              aria-label="Close"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Only use analysisData and reflectionContent for overlay */}
            {!analysisData && (
              <div className="bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-primary/10 p-8 md:p-12 text-center">
                <div className="mx-auto mb-6">
                  <JournalMascot size={96} />
                </div>
                <h2 className="text-2xl text-primary mb-4">Your Journey Insights</h2>
                <p className="text-foreground/80 text-lg mb-6">{mockReflection.content}</p>
                <div className="mb-6">
                  <h3 className="text-lg text-primary mb-2">Insights</h3>
                  <ul className="list-disc list-inside text-foreground/80">
                    {mockReflection.insights.map((insight, idx) => (
                      <li key={idx}>{insight}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg text-primary mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside text-foreground/80">
                    {mockReflection.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setShowReflection(false)}
                  className="px-6 py-3 bg-primary/10 rounded-full text-primary font-medium border border-primary/20 hover:bg-primary/20 transition-all mt-8"
                  type="button"
                >
                  Close
                </button>
              </div>
            )}

            {analysisData && (
              <div className="bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-primary/10 p-8 md:p-12">
                <div className="flex flex-col items-center mb-12">
                  <div className="mb-6">
                    <JournalMascot size={96} />
                  </div>

                  {/* Only show prompt UI and answers from reflectionContent */}
                  {!activePrompt && (
                    <div className="relative max-w-2xl mb-8 w-full animate-fadeIn">
                      <div className="bg-background/80 rounded-3xl p-6 border border-primary/20 shadow-lg">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-background/80 border-l border-t border-primary/20 rotate-45" />
                        <p className="text-foreground/90 text-lg leading-relaxed text-center relative z-10">
                          Hey there! 👋 I&apos;d love to share some insights I noticed about your growth. What would you like to know?
                        </p>
                      </div>
                    </div>
                  )}

                  {activePrompt && (
                    <div className="relative max-w-3xl mb-8 w-full animate-scaleIn">
                      <div className="bg-gradient-to-br from-primary/15 to-primary/5 rounded-3xl p-8 border border-primary/25 shadow-lg">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-primary/15 to-primary/5 border-l border-t border-primary/25 rotate-45" />

                        <div className="space-y-4 relative z-10">
                          {loadingReflection && (
                            <div className="text-center py-8">
                              <div className="animate-spin w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-3" />
                              <p className="text-foreground/70">Analyzing your journey...</p>
                            </div>
                          )}

                          {!loadingReflection && reflectionContent[activePrompt] && (
                            <>
                              <h3 className="text-2xl font-semibold text-primary mb-4 text-center">
                                {activePrompt === "personality" && "How Your Personality Has Evolved"}
                                {activePrompt === "improvements" && "Areas Where You’re Growing Stronger"}
                                {activePrompt === "strengths" && "What You’re Already Doing Beautifully"}
                                {activePrompt === "patterns" && "Patterns I’ve Noticed"}
                              </h3>

                              <div className="prose prose-lg max-w-none">
                                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                  {reflectionContent[activePrompt].content || "No reflection text returned."}
                                </p>
                              </div>

                              {reflectionContent[activePrompt].insights.length > 0 && (
                                <div className="mt-6">
                                  <h4 className="text-lg font-semibold text-primary mb-3">Key Insights</h4>
                                  <ul className="space-y-2">
                                    {reflectionContent[activePrompt].insights.map((insight, index) => (
                                      <li key={index} className="flex items-start gap-3">
                                        <span className="text-primary text-xl flex-shrink-0">•</span>
                                        <span className="text-foreground/90">{insight}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          )}

                          {!loadingReflection && activePrompt && !reflectionContent[activePrompt] && (
                            <div className="text-center py-8">
                              <p className="text-foreground/70">Unable to load reflection data. Please try again.</p>
                            </div>
                          )}

                          <div className="flex items-center justify-center gap-3 mt-6">
                            <button
                              onClick={() => setActivePrompt(null)}
                              className="px-6 py-2.5 bg-background/60 hover:bg-background/80 border border-primary/20 hover:border-primary/30 rounded-full text-foreground/90 hover:text-primary transition-all hover:scale-105"
                              type="button"
                            >
                              <span className="text-sm font-medium">← Back</span>
                            </button>

                            <button
                              onClick={() => navigate("/explore")}
                              className="px-6 py-2.5 bg-gradient-to-r from-primary/20 to-primary/15 hover:from-primary/30 hover:to-primary/25 border border-primary/30 rounded-full text-primary transition-all hover:scale-105 hover:shadow-lg flex items-center gap-2"
                              type="button"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Chat more!</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!activePrompt && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                      {(["personality", "improvements", "strengths", "patterns"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setActivePrompt(type);
                            loadReflection(type);
                          }}
                          className="px-6 py-4 bg-background/60 hover:bg-background/80 border border-primary/20 hover:border-primary/40 rounded-2xl text-foreground/90 hover:text-primary transition-all hover:scale-105 hover:shadow-lg text-left"
                          type="button"
                        >
                          <div className="text-lg font-medium mb-1">
                            {type === "personality" && "How has my personality changed?"}
                            {type === "improvements" && "What are my areas of improvement?"}
                            {type === "strengths" && "What am I doing well?"}
                            {type === "patterns" && "What patterns do you notice?"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {type === "personality" && "See your transformation over time"}
                            {type === "improvements" && "Discover where you're growing"}
                            {type === "strengths" && "Celebrate your strengths"}
                            {type === "patterns" && "Uncover hidden insights"}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!activePrompt && (
                  <>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-10" />

                    <div className="text-center mb-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 mb-4">
                        <Sparkles className="w-8 h-8 text-primary" />
                      </div>
                      <h2 className="text-4xl text-foreground/90 mb-3">Your Journey So Far</h2>
                      <p className="text-muted-foreground text-lg italic">Looking back at how you&apos;ve grown</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                      <StatCard label="Entries Written" value={reflectionStats.totalEntries} />
                      <StatCard label="Total Words" value={reflectionStats.totalWords.toLocaleString()} />
                      <StatCard label="Days Journaling" value={reflectionStats.daysSinceStart} />
                      <StatCard label="Avg Words/Entry" value={reflectionStats.avgWords} />
                      <StatCard label="Day Streak" value={reflectionStats.longestStreak} />
                      <div className="bg-background/60 rounded-2xl p-6 border border-primary/10 text-center col-span-2 md:col-span-1">
                        <div className="text-lg font-semibold text-primary mb-1 truncate">
                          {reflectionStats.mostProductiveMonth?.split(" ")?.[0] || "—"}
                        </div>
                        <div className="text-sm text-muted-foreground">Most Active Month</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
    </>
  );
}

// StatCard component
const StatCard = ({ label, value }: { label: string; value: React.ReactNode }) => {
  return (
    <div className="bg-background/60 rounded-2xl p-6 border border-primary/10 text-center">
      <div className="text-3xl font-semibold text-primary mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};

// Date formatting helper
function safeFormatDate(input: string): string {
  const d = new Date(input);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  return input;
}
