import { Heart, Moon, Coffee, Sun, Cloud, Star, ArrowLeft, Send, Mic, MicOff } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { useState, useRef, useEffect } from "react";
import { Toast } from "@/app/components/Toast";
import { JournalMascot } from "@/app/components/JournalMascot";

type Message = {
  id: number;
  sender: "user" | "mascot";
  text: string;
  timestamp: Date;
};

export default function Explore() {
  const location = useLocation();
  const prefilledMessage = (location.state as { prefilledMessage?: string })?.prefilledMessage || "";
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "mascot",
      text: "Our top goals this week must be:\n\n• Deep breaths for 10 minutes when you feel overwhelmed so it won't drive you crazy.\n\n• If you can't control it, don't waste your energy.\n\n• Get out of the table if someone doesn't respect you.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isGoalsExpanded, setIsGoalsExpanded] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle prefilled message from navigation state
  useEffect(() => {
    if (prefilledMessage) {
      setInputValue(prefilledMessage);
      setShowToast(true);
      // Focus the input after a short delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [prefilledMessage]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        setInputValue((prev) => {
          const withoutInterim = prev.replace(/\s*\[listening...\]\s*$/, "");
          if (finalTranscript) {
            return withoutInterim + finalTranscript;
          }
          return withoutInterim + (interimTranscript ? ` [listening...]` : "");
        });
      };

      recognitionInstance.onerror = (event: any) => {
        // Suppress console error for permission denial and aborted (expected behavior)
        if (event.error !== 'not-allowed' && event.error !== 'aborted') {
          console.error("Speech recognition error:", event.error);
        }
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
        setInputValue((prev) => prev.replace(/\s*\[listening...\]\s*$/, ""));
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Mark that user has interacted
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }

    const newMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    // Mock AI response (can be replaced with real AI integration)
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        sender: "mascot",
        text: "I'm here to listen and support you. How are you feeling about this?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartRecording = () => {
    if (recognition) {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col px-4 md:px-6 pb-32 pt-8 md:pt-12 max-w-4xl mx-auto w-full">
      {/* Back button */}
      <div className="w-full mb-6 md:mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Home</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8 md:mb-12 space-y-2 md:space-y-3">
        <h1 className="text-3xl md:text-4xl text-foreground/90">Chat with Your Guide</h1>
        <p className="text-muted-foreground text-base md:text-lg italic">
          Ask anything, share your thoughts
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-card/30 to-card/50 backdrop-blur-xl rounded-3xl md:rounded-[32px] overflow-hidden shadow-2xl shadow-primary/5">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          {!hasUserInteracted ? (
            // Initial Full Curated Welcome Screen
            <div className="flex flex-col items-center justify-center min-h-full space-y-10 animate-in fade-in duration-1000">
              {/* Mascot Avatar - Large and centered */}
              <div className="w-32 h-32">
                <JournalMascot size={128} />
              </div>

              {/* Welcome message */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl text-foreground/90">Your Weekly Goals</h2>
                <p className="text-muted-foreground/70 text-sm">
                  Let's focus on what matters this week
                </p>
              </div>

              {/* Curated Goals List */}
              <div className="w-full max-w-xl space-y-4">
                {messages[0].text
                  .split("\n\n")
                  .slice(1)
                  .map((goal, index) => {
                    const cleanGoal = goal.replace(/^•\s*/, "");
                    return (
                      <div
                        key={index}
                        className="bg-card/60 backdrop-blur-sm rounded-[24px] p-6 shadow-lg border border-primary/10 transition-all duration-500 hover:shadow-xl hover:scale-[1.02] animate-in slide-in-from-bottom-8 fade-in"
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {index === 0 && <Heart className="w-5 h-5 text-primary/60" />}
                            {index === 1 && <Cloud className="w-5 h-5 text-primary/60" />}
                            {index === 2 && <Star className="w-5 h-5 text-primary/60" />}
                          </div>
                          <p className="text-foreground/85 leading-[1.8] text-base flex-1">
                            {cleanGoal}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Soft call-to-action */}
              <p className="text-muted-foreground/50 text-sm italic mt-6">
                Type below to share your thoughts or ask anything
              </p>
            </div>
          ) : (
            // Chat Mode - Compact goals + messages
            <div className="space-y-8">
              {/* Compact Collapsible Goals Header */}
              <div className="bg-card/40 backdrop-blur-sm rounded-[24px] p-5 border border-primary/10 shadow-lg animate-in fade-in duration-700">
                <button
                  onClick={() => setIsGoalsExpanded(!isGoalsExpanded)}
                  className="w-full flex items-center gap-4 transition-all duration-300 hover:opacity-80"
                >
                  {/* Small Mascot Avatar */}
                  <div className="w-12 h-12">
                    <JournalMascot size={48} />
                  </div>
                  
                  {/* Title and Toggle Indicator */}
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-foreground/85 text-sm font-medium">Your Weekly Goals</span>
                    <div className={`transition-transform duration-300 ${isGoalsExpanded ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expandable Goals Content */}
                {isGoalsExpanded && (
                  <div className="mt-5 space-y-3 animate-in slide-in-from-top-4 fade-in duration-500">
                    {messages[0].text
                      .split("\n\n")
                      .slice(1)
                      .map((goal, index) => {
                        const cleanGoal = goal.replace(/^•\s*/, "");
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-[16px] bg-background/30 backdrop-blur-sm hover:bg-background/40 transition-all duration-300"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {index === 0 && <Heart className="w-4 h-4 text-primary/60" />}
                              {index === 1 && <Cloud className="w-4 h-4 text-primary/60" />}
                              {index === 2 && <Star className="w-4 h-4 text-primary/60" />}
                            </div>
                            <p className="text-foreground/75 leading-[1.7] text-sm flex-1">
                              {cleanGoal}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Chat Messages */}
              <div className="space-y-8">
                {messages.slice(1).map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 ${
                      message.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Avatar */}
                    {message.sender === "mascot" && (
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14">
                          <JournalMascot size={56} />
                        </div>
                      </div>
                    )}

                    {message.sender === "user" && (
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary/15 to-accent/15 shadow-lg ring-1 ring-secondary/20 flex items-center justify-center">
                          <span className="text-base text-foreground/60">You</span>
                        </div>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`flex-1 max-w-[70%] ${
                        message.sender === "user" ? "flex justify-end" : ""
                      }`}
                    >
                      <div
                        className={`rounded-[28px] px-7 py-5 shadow-lg transition-all duration-300 hover:shadow-xl ${
                          message.sender === "mascot"
                            ? "bg-card/90 backdrop-blur-sm"
                            : "bg-gradient-to-br from-primary/12 to-primary/8 backdrop-blur-sm"
                        }`}
                      >
                        <p className="text-foreground/85 leading-[1.8] whitespace-pre-line text-base">
                          {message.text}
                        </p>
                        <p className="text-xs text-muted-foreground/50 mt-3">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-card/70 backdrop-blur-xl p-4 md:p-6 lg:p-8 border-t border-primary/5">
          <div className="flex items-center gap-2 md:gap-4">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 bg-background/40 backdrop-blur-sm rounded-2xl md:rounded-[24px] px-4 py-3 md:px-6 md:py-4 text-sm md:text-base text-foreground/85 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background/60 transition-all duration-300 resize-none min-h-[48px] md:min-h-[56px] max-h-[200px] leading-relaxed shadow-inner"
              rows={1}
              style={{
                height: "auto",
                minHeight: window.innerWidth < 768 ? "48px" : "56px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 200) + "px";
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="flex-shrink-0 h-[48px] w-[48px] md:h-[56px] md:w-[56px] flex items-center justify-center bg-gradient-to-br from-primary/15 to-primary/10 hover:from-primary/25 hover:to-primary/15 rounded-full transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:hover:scale-100"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5 text-primary/80" />
            </button>
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`flex-shrink-0 h-[48px] w-[48px] md:h-[56px] md:w-[56px] flex items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                isRecording
                  ? "bg-gradient-to-br from-red-500/20 to-red-400/15 animate-pulse"
                  : "bg-gradient-to-br from-primary/15 to-primary/10 hover:from-primary/25 hover:to-primary/15"
              }`}
            >
              {isRecording ? (
                <MicOff className="w-5 h-5 text-red-500/90" />
              ) : (
                <Mic className="w-5 h-5 text-primary/80" />
              )}
            </button>
          </div>
          {isRecording && (
            <p className="text-xs text-red-500/70 mt-3 text-center animate-pulse">
              🎙️ Listening...
            </p>
          )}
          <p className="text-xs text-muted-foreground/50 mt-5 text-center">
            This is a safe space · Share your thoughts freely
          </p>
        </div>
      </div>
      {showToast && (
        <Toast
          message="Your message has been prefilled for you."
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}