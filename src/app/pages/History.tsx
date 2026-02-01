import { ArrowLeft, X, ChevronLeft, ChevronRight, Sparkles, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { getAllEntries } from "@/app/utils/journalStorage";
import { JournalMascot } from "@/app/components/JournalMascot";

type Memory = {
  id: number;
  date: string;
  quote: string;
  image: string;
};

export default function History() {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  // Measure item width so the centered card is always truly centered (no magic numbers).
  const itemRef = useRef<HTMLDivElement>(null);
  const [itemWidth, setItemWidth] = useState(336); // fallback until measured

  // Get real journal entries
  const journalEntries = getAllEntries();

  // Mock memory entries for the carousel
  const memories: Memory[] = useMemo(
    () => [
      {
        id: 1,
        date: "May 12, 2024",
        quote: "Today I got my dog and named her Shero!! She's so cute!!!",
        image:
          "https://images.unsplash.com/photo-1646026907993-0df9003380a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZyUyMHB1cHB5JTIwY3V0ZXxlbnwxfHx8fDE3Njk4OTIzOTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      },
      {
        id: 2,
        date: "April 3, 2024",
        quote:
          "Watched the most beautiful sunset today. Sometimes we need to pause and appreciate the simple moments.",
        image:
          "https://images.unsplash.com/photo-1622489937280-af9291e62ccc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBiZWFjaCUyMHBlYWNlZnVsfGVufDF8fHx8MTc2OTg5MjM5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      },
      {
        id: 3,
        date: "March 15, 2024",
        quote: "Morning coffee by the window. This is what peace feels like.",
        image:
          "https://images.unsplash.com/photo-1689657657991-b3f55c8b9e83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBtb3JuaW5nJTIwY296eXxlbnwxfHx8fDE3Njk4OTIzOTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      },
      {
        id: 4,
        date: "February 28, 2024",
        quote:
          "Found a quiet spot in the forest. Nature has a way of making everything feel lighter.",
        image:
          "https://images.unsplash.com/photo-1730963782375-f40cffade823?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBmb3Jlc3QlMjBwZWFjZWZ1bHxlbnwxfHx8fDE3Njk4MDg0NjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      },
      {
        id: 5,
        date: "January 20, 2024",
        quote:
          "Laughed until my cheeks hurt with friends today. These are the moments I want to remember forever.",
        image:
          "https://images.unsplash.com/photo-1729105140067-00c3c435ccd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRzJTIwbGF1Z2hpbmclMjBoYXBweXxlbnwxfHx8fDE3Njk4OTIzOTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      },
      {
        id: 6,
        date: "December 10, 2023",
        quote: "Found my inner peace today. Everything feels clearer now.",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      },
      {
        id: 7,
        date: "November 5, 2023",
        quote: "A day spent in nature is a day well spent.",
        image:
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      },
      {
        id: 8,
        date: "October 15, 2023",
        quote: "Sometimes the best therapy is a good book and a warm drink.",
        image:
          "https://images.unsplash.com/photo-1507842072343-583f20270319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      },
      {
        id: 9,
        date: "September 8, 2023",
        quote: "Adventure awaits around every corner. Today I said yes to something new.",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnR1cmV8ZW58MXx8fHwxNzY5ODkyNDA0M3ww&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: 10,
        date: "August 20, 2023",
        quote: "Starry nights remind me that there's magic in the world.",
        image:
          "https://images.unsplash.com/photo-1502882657612-449c63e7cdc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFycyUyMG5pZ2h0fGVufDF8fHx8MTc2OTg5MjQwMzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      },
    ],
    []
  );

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % memories.length);
  };

  const topLessons = useMemo(
    () => [
      "Sometimes the smallest moments carry the biggest joys",
      "Peace isn't found—it's created in the quiet spaces between",
      "Love arrives when you least expect it, in forms you never imagined",
      "Nature whispers what the mind forgets to hear",
      "Laughter with friends is the soundtrack of a life well lived",
      "Growth happens in the uncomfortable silences, not the applause",
      "We collect memories, not things—and that's where true wealth lives",
      "The answer I was searching for was inside me all along, waiting patiently",
      "Today I learned that letting go isn't losing—it's making room for what's meant to stay",
      "Vulnerability isn't weakness; it's the bridge that connects us to each other",
    ],
    []
  );

  // Generate reflection insights from journal entries
  const reflectionInsights = useMemo(() => {
    if (journalEntries.length === 0) return null;

    // Calculate total words written
    const totalWords = journalEntries.reduce((sum, entry) => sum + entry.wordCount, 0);

    // Calculate average entry length
    const avgWords = Math.round(totalWords / journalEntries.length);

    // Find most productive month
    const monthCounts: Record<string, number> = {};
    journalEntries.forEach(entry => {
      const month = new Date(entry.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    const mostProductiveMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0];

    // Calculate journaling streak
    const sortedDates = journalEntries
      .map(e => new Date(e.date).toISOString().split('T')[0])
      .sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Days since first entry
    const firstEntry = new Date(Math.min(...journalEntries.map(e => new Date(e.date).getTime())));
    const daysSinceStart = Math.round((new Date().getTime() - firstEntry.getTime()) / (1000 * 60 * 60 * 24));

    // Common words (excluding common stopwords)
    const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);
    const wordFreq: Record<string, number> = {};
    
    journalEntries.forEach(entry => {
      const text = entry.content.replace(/<[^>]*>/g, ' ').toLowerCase();
      const words = text.match(/\b[a-z]{4,}\b/g) || [];
      words.forEach(word => {
        if (!stopwords.has(word)) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });
    });
    
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    // EMOTIONAL GROWTH ANALYSIS
    // Define emotional themes with keywords
    const emotionalThemes = {
      gratitude: ['grateful', 'thankful', 'blessed', 'appreciate', 'fortunate', 'lucky', 'thank'],
      confidence: ['confident', 'proud', 'strong', 'capable', 'believe', 'achieve', 'accomplished', 'success'],
      peace: ['peace', 'calm', 'serene', 'tranquil', 'quiet', 'still', 'centered', 'balanced'],
      joy: ['happy', 'joy', 'excited', 'wonderful', 'amazing', 'love', 'beautiful', 'delighted'],
      growth: ['learn', 'grow', 'improve', 'better', 'change', 'progress', 'develop', 'transform'],
      resilience: ['overcome', 'survived', 'stronger', 'persevere', 'endure', 'bounce', 'recover'],
      selfAwareness: ['realize', 'understand', 'notice', 'aware', 'recognize', 'discover', 'insight', 'reflection'],
      connection: ['connect', 'together', 'friend', 'family', 'support', 'community', 'belong', 'relationship'],
      courage: ['brave', 'courage', 'bold', 'risk', 'fearless', 'dare', 'attempt', 'try'],
      acceptance: ['accept', 'okay', 'enough', 'forgive', 'let go', 'release', 'peace with'],
    };

    // Analyze emotional themes over time
    const sortedEntries = [...journalEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Split entries into early and recent periods
    const midPoint = Math.floor(sortedEntries.length / 2);
    const earlyEntries = sortedEntries.slice(0, midPoint);
    const recentEntries = sortedEntries.slice(midPoint);

    const analyzeEmotions = (entries: typeof journalEntries) => {
      const themeCounts: Record<string, number> = {};
      
      entries.forEach(entry => {
        const text = entry.content.replace(/<[^>]*>/g, ' ').toLowerCase();
        
        Object.entries(emotionalThemes).forEach(([theme, keywords]) => {
          keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}`, 'gi');
            const matches = text.match(regex);
            if (matches) {
              themeCounts[theme] = (themeCounts[theme] || 0) + matches.length;
            }
          });
        });
      });

      return themeCounts;
    };

    const earlyEmotions = analyzeEmotions(earlyEntries);
    const recentEmotions = analyzeEmotions(recentEntries);

    // Calculate growth - themes that increased significantly
    const growthAreas: Array<{theme: string, label: string, growth: number, insight: string}> = [];
    
    const themeLabels: Record<string, string> = {
      gratitude: 'Gratitude',
      confidence: 'Confidence',
      peace: 'Inner Peace',
      joy: 'Joy & Positivity',
      growth: 'Personal Growth',
      resilience: 'Resilience',
      selfAwareness: 'Self-Awareness',
      connection: 'Connection',
      courage: 'Courage',
      acceptance: 'Self-Acceptance',
    };

    const themeInsights: Record<string, string> = {
      gratitude: "You're expressing more appreciation for the good things in your life",
      confidence: "You're believing in yourself more and celebrating your strengths",
      peace: "You're finding more moments of calm and centeredness",
      joy: "You're experiencing and noticing more positive emotions",
      growth: "You're actively working on becoming a better version of yourself",
      resilience: "You're bouncing back stronger from challenges",
      selfAwareness: "You're developing deeper understanding of your thoughts and feelings",
      connection: "You're nurturing relationships and feeling more connected to others",
      courage: "You're taking more brave steps outside your comfort zone",
      acceptance: "You're becoming more compassionate and accepting toward yourself",
    };

    Object.entries(recentEmotions).forEach(([theme, recentCount]) => {
      const earlyCount = earlyEmotions[theme] || 0;
      const growth = recentCount - earlyCount;
      
      // Only include themes with significant positive growth
      if (growth > 0 && recentCount > 1) {
        const growthPercentage = earlyCount > 0 
          ? Math.round((growth / earlyCount) * 100)
          : 100;
        
        growthAreas.push({
          theme,
          label: themeLabels[theme] || theme,
          growth: growthPercentage,
          insight: themeInsights[theme] || "You're showing more of this quality in your recent entries",
        });
      }
    });

    // Sort by growth percentage
    growthAreas.sort((a, b) => b.growth - a.growth);

    // Find dominant emotions in recent entries
    const dominantEmotions = Object.entries(recentEmotions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([theme]) => themeLabels[theme] || theme);

    return {
      totalEntries: journalEntries.length,
      totalWords,
      avgWords,
      mostProductiveMonth: mostProductiveMonth ? mostProductiveMonth[0] : 'N/A',
      longestStreak,
      daysSinceStart,
      topWords,
      firstEntryDate: firstEntry.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      growthAreas: growthAreas.slice(0, 5), // Top 5 growth areas
      dominantEmotions,
      hasEnoughData: journalEntries.length >= 3, // Need at least 3 entries for meaningful comparison
    };
  }, [journalEntries]);

  const expandedMemory = useMemo(
    () => memories.find((m) => m.id === expandedCard),
    [expandedCard, memories]
  );

  // Measure the actual width of one carousel "slot" (card + wrapper padding).
  useLayoutEffect(() => {
    const el = itemRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      // guard: if something is off, keep fallback
      if (rect.width > 0) setItemWidth(rect.width);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Auto-advance (pause on hover or when expanded)
  useEffect(() => {
    if (isPaused || expandedCard || showReflection) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % memories.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [isPaused, expandedCard, showReflection, memories.length]);

  const getDistance = (actualIndex: number) => {
    const len = memories.length;
    const raw = Math.abs(actualIndex - currentIndex);
    return Math.min(raw, len - raw);
  };

  return (
    <>
      <div className="flex-1 flex flex-col items-center px-6 pb-32 pt-12 max-w-6xl mx-auto w-full">
        {/* Back button */}
        <div className="w-full mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Home</span>
          </Link>
        </div>

        {/* Header section */}
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl text-foreground/90">Story Of My Life</h1>
          <p className="text-muted-foreground text-lg italic">
            Moments that mattered to you
          </p>
        </div>

        {/* Carousel section */}
        <div className="relative w-full mb-8 group">
          <div className="flex justify-center items-center py-8 md:py-12">
            <div className="w-full max-w-4xl px-4 md:px-16 relative h-80 md:h-96">
              {/* Cards container with smooth transitions */}
              <div className="flex justify-center items-center h-full relative">
                {memories.map((memory, index) => {
                  const isActive = index === currentIndex;
                  const isPrev = index === (currentIndex - 1 + memories.length) % memories.length;
                  const isNext = index === (currentIndex + 1) % memories.length;
                  const isPrevPrev = index === (currentIndex - 2 + memories.length) % memories.length;
                  const isNextNext = index === (currentIndex + 2) % memories.length;

                  let positionClass = "absolute opacity-0 scale-50 pointer-events-none";
                  let zIndex = 0;

                  if (isActive) {
                    positionClass = "absolute opacity-100 scale-110 pointer-events-auto z-30";
                    zIndex = 30;
                  } else if (isPrev) {
                    positionClass = "absolute opacity-40 scale-75 md:scale-85 pointer-events-none z-10";
                    zIndex = 10;
                  } else if (isNext) {
                    positionClass = "absolute opacity-40 scale-75 md:scale-85 pointer-events-none z-10";
                    zIndex = 10;
                  } else if (isPrevPrev) {
                    positionClass = "absolute opacity-20 scale-60 md:scale-70 pointer-events-none z-5";
                    zIndex = 5;
                  } else if (isNextNext) {
                    positionClass = "absolute opacity-20 scale-60 md:scale-70 pointer-events-none z-5";
                    zIndex = 5;
                  }

                  return (
                    <div
                      key={`${memory.id}-${index}`}
                      ref={index === 0 ? itemRef : undefined}
                      className={`transition-all duration-500 ease-out ${positionClass}`}
                      style={{
                        zIndex,
                        top: isActive ? "48%" : isPrev || isNext ? "52%" : isPrevPrev || isNextNext ? "56%" : "50%",
                        left: isActive ? "50%" : isPrev ? "20%" : isNext ? "80%" : isPrevPrev ? "2%" : isNextNext ? "98%" : "50%",
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
                        <ImageWithFallback
                          src={memory.image}
                          alt={memory.quote}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation arrows */}
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

        {/* Instruction text */}
        <p className="text-center text-muted-foreground/60 text-sm mb-6">
          Tap a card to relive the moment
        </p>

        {/* Reflect Button */}
        {journalEntries.length > 7 && !expandedCard && (
          <button
            onClick={() => setShowReflection(true)}
            className="mb-10 inline-flex items-center gap-2 px-8 py-3 bg-primary/15 hover:bg-primary/25 rounded-full border border-primary/20 text-primary transition-all hover:scale-105 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500"
            type="button"
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-medium text-sm">Reflect on Your Journey</span>
          </button>
        )}

        {/* Top Lessons: visible in collapsed view only */}
        {!expandedCard && (
          <div className="w-full max-w-2xl mx-auto mt-2">
            <h2 className="text-3xl text-foreground/90 mb-8 text-center">
              Top Lessons
            </h2>
            <div className="space-y-4">
              {topLessons.map((lesson, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-card/60 border border-primary/10 backdrop-blur-sm"
                >
                  <p className="text-foreground/80 text-lg leading-relaxed italic text-center">
                    {lesson}
                  </p>
                </div>
              ))}
            </div>
          </div>
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
          <div
            className="w-full max-w-2xl animate-scaleIn overflow-y-auto max-h-screen"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setExpandedCard(null)}
              className="fixed top-6 right-6 p-3 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-all hover:scale-110"
              aria-label="Close"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Expanded card */}
            <div className="bg-card rounded-[48px] overflow-hidden shadow-2xl border border-primary/10">
              {/* Image with quote overlay */}
              <div className="relative h-96 group rounded-[48px] overflow-hidden">
                <ImageWithFallback
                  src={expandedMemory.image}
                  alt={expandedMemory.quote}
                  className="w-full h-full object-cover rounded-[48px]"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                
                {/* Date badge - top left */}
                <div className="absolute top-6 left-6">
                  <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-2xl">
                    <p className="text-sm text-foreground/90 font-medium">
                      {expandedMemory.date}
                    </p>
                  </div>
                </div>

                {/* Quote overlay - bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-foreground/95 text-xl leading-relaxed italic font-medium">
                    "{expandedMemory.quote}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reflection Overlay */}
      {showReflection && reflectionInsights && (
        <div
          className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 p-6 animate-fadeIn overflow-y-auto"
          onClick={() => setShowReflection(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-4xl mx-auto my-8 animate-scaleIn min-h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowReflection(false)}
              className="fixed top-6 right-6 p-3 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-all hover:scale-110"
              aria-label="Close"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Reflection Content */}
            <div className="bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-primary/10 p-8 md:p-12">
              {/* Mascot Section */}
              <div className="flex flex-col items-center mb-12">
                {/* Mascot Avatar */}
                <div className="mb-6">
                  <JournalMascot size={96} />
                </div>

                {/* Mascot Speech Bubble */}
                {!activePrompt && (
                  <div className="relative max-w-2xl mb-8 w-full animate-fadeIn">
                    <div className="bg-background/80 rounded-3xl p-6 border border-primary/20 shadow-lg">
                      {/* Speech bubble pointer */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-background/80 border-l border-t border-primary/20 rotate-45" />
                      
                      <p className="text-foreground/90 text-lg leading-relaxed text-center relative z-10">
                        Hey there! 👋 I've been reading through your journal entries, and I'm amazed by your journey. 
                        I'd love to share some insights I've noticed about your growth. What would you like to know?
                      </p>
                    </div>
                  </div>
                )}

                {/* Active Prompt Response */}
                {activePrompt && (
                  <div className="relative max-w-3xl mb-8 w-full animate-scaleIn">
                    <div className="bg-gradient-to-br from-primary/15 to-primary/5 rounded-3xl p-8 border border-primary/25 shadow-lg">
                      {/* Speech bubble pointer */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-primary/15 to-primary/5 border-l border-t border-primary/25 rotate-45" />
                      
                      <div className="space-y-4 relative z-10">
                        {activePrompt === 'personality' && reflectionInsights.hasEnoughData && (
                          <>
                            <h3 className="text-2xl font-semibold text-primary mb-4 text-center">How Your Personality Has Evolved</h3>
                            <p className="text-foreground/90 leading-relaxed">
                              I've noticed some beautiful shifts in who you're becoming! When you first started journaling, 
                              you were finding your voice. Now, I see someone who is {reflectionInsights.growthAreas[0]?.label === 'Confidence' ? 'more confident and self-assured' : 'growing into themselves with grace'}.
                            </p>
                            {reflectionInsights.growthAreas.length > 0 && (
                              <>
                                <p className="text-foreground/90 leading-relaxed">
                                  The biggest transformation I've witnessed is in your <span className="font-semibold text-primary">{reflectionInsights.growthAreas[0]?.label.toLowerCase()}</span> — 
                                  it's grown by <span className="font-semibold text-primary">{reflectionInsights.growthAreas[0]?.growth}%</span>! 
                                  {reflectionInsights.growthAreas[0]?.theme === 'confidence' && " You're standing taller in your truth."}
                                  {reflectionInsights.growthAreas[0]?.theme === 'gratitude' && " You're seeing beauty in places you once overlooked."}
                                  {reflectionInsights.growthAreas[0]?.theme === 'peace' && " You're finding calm even in the storms."}
                                  {reflectionInsights.growthAreas[0]?.theme === 'resilience' && " You're bouncing back with more strength each time."}
                                </p>
                                {reflectionInsights.growthAreas[1] && (
                                  <p className="text-foreground/90 leading-relaxed">
                                    Another shift? Your <span className="font-semibold text-primary">{reflectionInsights.growthAreas[1]?.label.toLowerCase()}</span> has blossomed too. 
                                    You're not the same person who wrote that first entry — you're evolving into someone even more remarkable. ✨
                                  </p>
                                )}
                              </>
                            )}
                          </>
                        )}

                        {activePrompt === 'personality' && !reflectionInsights.hasEnoughData && (
                          <>
                            <h3 className="text-2xl font-semibold text-primary mb-4 text-center">Your Personality Journey</h3>
                            <p className="text-foreground/90 leading-relaxed text-center">
                              You're just getting started, and that's beautiful! I need a bit more time to understand your patterns 
                              and personality shifts. Keep writing — every entry helps me see the real you emerging. I promise, 
                              the insights will be worth it! 🌱
                            </p>
                          </>
                        )}

                        {activePrompt === 'improvements' && reflectionInsights.hasEnoughData && (
                          <>
                            <h3 className="text-2xl font-semibold text-primary mb-4 text-center">Areas Where You're Growing Stronger</h3>
                            <p className="text-foreground/90 leading-relaxed">
                              Here's what I love about your journey — you're not standing still. You're actively working on yourself, 
                              and it shows! Let me highlight where you're making real progress:
                            </p>
                            <ul className="space-y-3 mt-4">
                              {reflectionInsights.growthAreas.slice(0, 3).map((area, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <span className="text-primary text-xl flex-shrink-0">•</span>
                                  <span className="text-foreground/90">
                                    <span className="font-semibold text-primary">{area.label}</span> — {area.insight.toLowerCase()}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            <p className="text-foreground/90 leading-relaxed mt-4">
                              Keep nurturing these areas. Growth isn't always linear, but you're on a beautiful path. 🌟
                            </p>
                          </>
                        )}

                        {activePrompt === 'improvements' && !reflectionInsights.hasEnoughData && (
                          <>
                            <h3 className="text-2xl font-semibold text-primary mb-4 text-center">Your Growth Areas</h3>
                            <p className="text-foreground/90 leading-relaxed text-center">
                              I can already see you're someone who wants to grow and improve — that awareness alone is powerful! 
                              As you write more entries, I'll be able to show you specific patterns and areas where you're making progress. 
                              Trust the process! 💫
                            </p>
                          </>
                        )}

                        {activePrompt === 'strengths' && (
                          <>
                            <h3 className="text-2xl font-semibold text-primary mb-4 text-center">What You're Already Doing Beautifully</h3>
                            <p className="text-foreground/90 leading-relaxed">
                              First of all, you're here. You're <span className="font-semibold text-primary">showing up for yourself</span> by journaling 
                              — that takes courage and commitment! You've written <span className="font-semibold text-primary">{reflectionInsights.totalEntries} entries</span> and 
                              captured <span className="font-semibold text-primary">{reflectionInsights.totalWords.toLocaleString()} words</span> of your inner world.
                            </p>
                            {reflectionInsights.longestStreak > 1 && (
                              <p className="text-foreground/90 leading-relaxed">
                                Your consistency is impressive — a <span className="font-semibold text-primary">{reflectionInsights.longestStreak}-day streak</span> shows 
                                real dedication to self-reflection. Not everyone has that discipline!
                              </p>
                            )}
                            {reflectionInsights.dominantEmotions.length > 0 && (
                              <p className="text-foreground/90 leading-relaxed">
                                Right now, your entries radiate <span className="font-semibold text-primary">{reflectionInsights.dominantEmotions.join(', ')}</span>. 
                                That's the energy you're cultivating in your life, and it's beautiful to witness. Keep shining! ✨
                              </p>
                            )}
                          </>
                        )}

                        {activePrompt === 'patterns' && (
                          <>
                            <h3 className="text-2xl font-semibold text-primary mb-4 text-center">Patterns I've Noticed</h3>
                            <p className="text-foreground/90 leading-relaxed">
                              Here's something fascinating — your journal reveals patterns you might not even realize! 
                            </p>
                            {reflectionInsights.topWords.length > 0 && (
                              <div className="my-4">
                                <p className="text-foreground/90 leading-relaxed mb-3">
                                  The words you return to most often are: <span className="font-semibold text-primary">{reflectionInsights.topWords.join(', ')}</span>. 
                                  These aren't random — they reveal what's truly important to you right now.
                                </p>
                              </div>
                            )}
                            {reflectionInsights.mostProductiveMonth !== 'N/A' && (
                              <p className="text-foreground/90 leading-relaxed">
                                You wrote the most during <span className="font-semibold text-primary">{reflectionInsights.mostProductiveMonth}</span> — 
                                something was calling you to process and reflect more deeply during that time.
                              </p>
                            )}
                            {reflectionInsights.hasEnoughData && reflectionInsights.growthAreas.length > 0 && (
                              <p className="text-foreground/90 leading-relaxed">
                                I've also noticed a clear pattern of growth: you started with one mindset, and you're gradually shifting toward 
                                more <span className="font-semibold text-primary">{reflectionInsights.growthAreas[0]?.label.toLowerCase()}</span> and 
                                <span className="font-semibold text-primary"> {reflectionInsights.growthAreas[1]?.label.toLowerCase()}</span>. 
                                That's not accidental — that's intentional evolution! 🌿
                              </p>
                            )}
                          </>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-center gap-3 mt-6">
                          <button
                            onClick={() => setActivePrompt(null)}
                            className="px-6 py-2.5 bg-background/60 hover:bg-background/80 border border-primary/20 hover:border-primary/30 rounded-full text-foreground/90 hover:text-primary transition-all hover:scale-105"
                            type="button"
                          >
                            <span className="text-sm font-medium">← Back</span>
                          </button>
                          
                          <button
                            onClick={() => navigate('/explore')}
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

                {/* Prompt Buttons */}
                {!activePrompt && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                    <button
                      onClick={() => setActivePrompt('personality')}
                      className="px-6 py-4 bg-background/60 hover:bg-background/80 border border-primary/20 hover:border-primary/40 rounded-2xl text-foreground/90 hover:text-primary transition-all hover:scale-105 hover:shadow-lg text-left"
                      type="button"
                    >
                      <div className="text-lg font-medium mb-1">How has my personality changed?</div>
                      <div className="text-sm text-muted-foreground">See your transformation over time</div>
                    </button>

                    <button
                      onClick={() => setActivePrompt('improvements')}
                      className="px-6 py-4 bg-background/60 hover:bg-background/80 border border-primary/20 hover:border-primary/40 rounded-2xl text-foreground/90 hover:text-primary transition-all hover:scale-105 hover:shadow-lg text-left"
                      type="button"
                    >
                      <div className="text-lg font-medium mb-1">What are my areas of improvement?</div>
                      <div className="text-sm text-muted-foreground">Discover where you're growing</div>
                    </button>

                    <button
                      onClick={() => setActivePrompt('strengths')}
                      className="px-6 py-4 bg-background/60 hover:bg-background/80 border border-primary/20 hover:border-primary/40 rounded-2xl text-foreground/90 hover:text-primary transition-all hover:scale-105 hover:shadow-lg text-left"
                      type="button"
                    >
                      <div className="text-lg font-medium mb-1">What am I doing well?</div>
                      <div className="text-sm text-muted-foreground">Celebrate your strengths</div>
                    </button>

                    <button
                      onClick={() => setActivePrompt('patterns')}
                      className="px-6 py-4 bg-background/60 hover:bg-background/80 border border-primary/20 hover:border-primary/40 rounded-2xl text-foreground/90 hover:text-primary transition-all hover:scale-105 hover:shadow-lg text-left"
                      type="button"
                    >
                      <div className="text-lg font-medium mb-1">What patterns do you notice?</div>
                      <div className="text-sm text-muted-foreground">Uncover hidden insights</div>
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              {!activePrompt && (
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-10" />
              )}

              {/* Header */}
              {!activePrompt && (
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-4xl text-foreground/90 mb-3">Your Journey So Far</h2>
                  <p className="text-muted-foreground text-lg italic">
                    Looking back at how you've grown
                  </p>
                </div>
              )}

              {/* Only show stats and growth sections when no prompt is active */}
              {!activePrompt && (
                <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-background/60 rounded-2xl p-6 border border-primary/10 text-center">
                  <div className="text-3xl font-semibold text-primary mb-1">
                    {reflectionInsights.totalEntries}
                  </div>
                  <div className="text-sm text-muted-foreground">Entries Written</div>
                </div>

                <div className="bg-background/60 rounded-2xl p-6 border border-primary/10 text-center">
                  <div className="text-3xl font-semibold text-primary mb-1">
                    {reflectionInsights.totalWords.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Words</div>
                </div>

                <div className="bg-background/60 rounded-2xl p-6 border border-primary/10 text-center">
                  <div className="text-3xl font-semibold text-primary mb-1">
                    {reflectionInsights.daysSinceStart}
                  </div>
                  <div className="text-sm text-muted-foreground">Days Journaling</div>
                </div>

                <div className="bg-background/60 rounded-2xl p-6 border border-primary/10 text-center">
                  <div className="text-3xl font-semibold text-primary mb-1">
                    {reflectionInsights.avgWords}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Words/Entry</div>
                </div>

                <div className="bg-background/60 rounded-2xl p-6 border border-primary/10 text-center">
                  <div className="text-3xl font-semibold text-primary mb-1">
                    {reflectionInsights.longestStreak}
                  </div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>

                <div className="bg-background/60 rounded-2xl p-6 border border-primary/10 text-center col-span-2 md:col-span-1">
                  <div className="text-lg font-semibold text-primary mb-1 truncate">
                    {reflectionInsights.mostProductiveMonth.split(' ')[0]}
                  </div>
                  <div className="text-sm text-muted-foreground">Most Active Month</div>
                </div>
              </div>

              {/* Journey Milestones */}
              <div className="space-y-6 mb-10">
                <h3 className="text-2xl text-foreground/90 text-center mb-6">Journey Milestones</h3>
                
                <div className="bg-background/60 rounded-2xl p-6 border border-primary/10">
                  <p className="text-foreground/80 leading-relaxed text-center">
                    You started your journaling journey on <span className="font-semibold text-primary">{reflectionInsights.firstEntryDate}</span>. 
                    Since then, you've written <span className="font-semibold text-primary">{reflectionInsights.totalEntries} entries</span>, 
                    capturing <span className="font-semibold text-primary">{reflectionInsights.totalWords.toLocaleString()} words</span> of your thoughts and experiences.
                  </p>
                </div>

                {reflectionInsights.longestStreak > 1 && (
                  <div className="bg-background/60 rounded-2xl p-6 border border-primary/10">
                    <p className="text-foreground/80 leading-relaxed text-center">
                      Your longest journaling streak was <span className="font-semibold text-primary">{reflectionInsights.longestStreak} consecutive days</span>. 
                      That's dedication to understanding yourself better!
                    </p>
                  </div>
                )}

                {reflectionInsights.topWords.length > 0 && (
                  <div className="bg-background/60 rounded-2xl p-6 border border-primary/10">
                    <p className="text-foreground/80 leading-relaxed text-center mb-4">
                      The words that appear most often in your journal reveal what's been on your mind:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {reflectionInsights.topWords.map((word, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-primary/10 rounded-full text-primary font-medium border border-primary/20"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Emotional Growth */}
              {reflectionInsights.hasEnoughData && reflectionInsights.growthAreas.length > 0 && (
                <div className="space-y-6 mb-10">
                  <div className="text-center mb-6">
                    <h3 className="text-3xl text-foreground/90 mb-2">Where You've Grown</h3>
                    <p className="text-muted-foreground italic">
                      Comparing your earlier entries to your recent ones
                    </p>
                  </div>
                  
                  {/* Growth Areas - Detailed Cards */}
                  <div className="space-y-4">
                    {reflectionInsights.growthAreas.map((area, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-primary/5 to-transparent rounded-2xl p-6 border border-primary/15 hover:border-primary/25 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-xl font-semibold text-primary">
                                {area.label}
                              </h4>
                              <span className="px-3 py-1 bg-primary/15 rounded-full text-sm font-medium text-primary border border-primary/20">
                                +{area.growth}%
                              </span>
                            </div>
                            <p className="text-foreground/80 leading-relaxed">
                              {area.insight}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <Sparkles className="w-6 h-6 text-primary/60" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Current Emotional State */}
                  {reflectionInsights.dominantEmotions.length > 0 && (
                    <div className="bg-background/60 rounded-2xl p-6 border border-primary/10 mt-6">
                      <p className="text-foreground/80 leading-relaxed text-center mb-4">
                        Right now, your entries most reflect these qualities:
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center">
                        {reflectionInsights.dominantEmotions.map((emotion, index) => (
                          <div
                            key={index}
                            className="px-5 py-2.5 bg-gradient-to-r from-primary/15 to-primary/10 rounded-full text-primary font-medium border border-primary/25 text-lg"
                          >
                            {emotion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message for new journalers */}
              {!reflectionInsights.hasEnoughData && (
                <div className="bg-background/60 rounded-2xl p-8 border border-primary/10 mb-10 text-center">
                  <Sparkles className="w-12 h-12 text-primary/60 mx-auto mb-4" />
                  <h3 className="text-xl text-foreground/90 mb-3">Keep Writing!</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We need a few more entries to show you meaningful emotional growth patterns. 
                    Keep journaling, and we'll reveal how you've been evolving emotionally.
                  </p>
                </div>
              )}

              {/* Reflection Message */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 text-center">
                <p className="text-foreground/90 text-xl leading-relaxed italic">
                  "Every entry is a step forward. Keep writing, keep reflecting, keep growing."
                </p>
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}