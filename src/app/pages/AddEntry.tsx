import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Mic, 
  Paperclip,
  Bold,
  Italic,
  Underline,
  Palette,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Calendar as CalendarIcon
} from "lucide-react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import UnderlineExtension from '@tiptap/extension-underline';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { ResizableImage } from "@/app/components/ResizableImage";
import { generateTitle, generatePreview, countWords } from "@/app/utils/journalStorage";
import { journalApi } from "@/app/utils/journalApi";
import { s3Upload, type ImageMetadata } from "@/services/s3Upload";
import { JournalMascot } from "@/app/components/JournalMascot";
import { useVoiceRecording } from "@/app/hooks/useVoiceRecording";
import { Toast } from "@/app/components/Toast";

export default function AddEntry() {
  const location = useLocation();
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPermissionError, setShowPermissionError] = useState(false);
  const [permissionErrorMessage, setPermissionErrorMessage] = useState("");
  
  // Handle date from navigation state (when editing from AllEntries)
  const editDate = (location.state as { editDate?: Date })?.editDate;
  const initialDate = editDate ? new Date(editDate) : new Date();
  const [currentDate, setCurrentDate] = useState(initialDate);
  
  const [hasExistingEntry, setHasExistingEntry] = useState(false);
  const [showNewEntryPrompt, setShowNewEntryPrompt] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ImageMetadata[]>([]);
  const uploadedImageMapRef = useRef<Map<string, ImageMetadata>>(new Map());
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use currentDate for storage key instead of always today
  const todayKey = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  const storageKey = `journal-entry-${todayKey}`;

  // Format display date
  const displayDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Mock AI chatbot question (this will be dynamic with AI integration)
  // HARDCODED CHATBOT MESSAGES - Easy to replace with real AI integration later
  const chatbotMessages = [
    "How did yesterday feel for you?",
    "What's something you're grateful for today?",
    "Tell me about a moment that made you smile recently.",
  ];

  // Currently showing message index
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const syncUploadedImages = useCallback((editorInstance: TiptapEditor) => {
    const imageUrls: string[] = [];

    editorInstance.state.doc.descendants((node) => {
      if (node.type.name === 'resizableImage' && node.attrs.src) {
        if (!imageUrls.includes(node.attrs.src)) {
          imageUrls.push(node.attrs.src);
        }
      }
    });

    setUploadedImages((prev) => {
      const next = imageUrls.map((url) => {
        const existing = uploadedImageMapRef.current.get(url);
        return existing ?? { url, s3_key: '' };
      });

      if (
        prev.length === next.length &&
        prev.every((item, index) => item.url === next[index]?.url && item.s3_key === next[index]?.s3_key)
      ) {
        return prev;
      }

      return next;
    });
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ResizableImage,
      Placeholder.configure({
        placeholder: 'Start writing your thoughts...',
      }),
      TextStyle,
      Color,
      UnderlineExtension,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[calc(100vh-400px)] text-foreground/90 leading-relaxed',
      },
    },
    content: '',
    onUpdate: ({ editor }) => {
      // Debounced autosave
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setIsSaving(true);
      syncUploadedImages(editor);
      
      saveTimeoutRef.current = setTimeout(() => {
        const content = editor.getJSON();
        localStorage.setItem(storageKey, JSON.stringify(content));
        setLastSaved(new Date());
        setIsSaving(false);
      }, 1000); // Save 1 second after user stops typing
    },
  });

  // Load saved content on mount
  useEffect(() => {
    async function loadContent() {
      if (editor) {
        uploadedImageMapRef.current.clear();
        setUploadedImages([]);
        const savedContent = localStorage.getItem(storageKey);
        if (savedContent) {
          try {
            const content = JSON.parse(savedContent);
            editor.commands.setContent(content);
            setLastSaved(new Date());
            setHasExistingEntry(true);
            syncUploadedImages(editor);
          } catch (error) {
            console.error('Failed to load saved content:', error);
          }
        } else {
          // No draft, check if there's a saved entry in the journal
          try {
            const existingEntry = await journalApi.getEntryByDate(currentDate);
            if (existingEntry) {
              editor.commands.setContent(existingEntry.content);
              setHasExistingEntry(true);
              setLastSaved(new Date());
              const existingImages = existingEntry.images || [];
              setUploadedImages(existingImages);
              existingImages.forEach((image) => {
                uploadedImageMapRef.current.set(image.url, image);
              });
              syncUploadedImages(editor);
            } else {
              setHasExistingEntry(false);
            }
          } catch (error) {
            console.error('Failed to load existing entry:', error);
            setHasExistingEntry(false);
          }
        }
      }
    }
    
    loadContent();
  }, [editor, storageKey, currentDate, syncUploadedImages]);

  // Save to journal entries when leaving the page or content changes significantly
  useEffect(() => {
    const saveToJournal = async () => {
      if (editor && editor.getText().trim()) {
        const htmlContent = editor.getHTML();
        
        // Generate entry ID based on today's date
        const entryId = `entry-${todayKey}`;
        
        const entry = {
          id: entryId,
          title: generateTitle(htmlContent),
          date: new Date(currentDate),
          content: htmlContent,
          preview: generatePreview(htmlContent),
          wordCount: countWords(htmlContent),
          images: uploadedImages,
        };
        
        try {
          // Save entry first
          const savedEntry = await journalApi.saveEntry(entry);
          
          // Detect mood asynchronously (non-blocking)
          if (htmlContent.length > 50) {
            import('@/api/exploreApi').then(({ exploreApi }) => {
              exploreApi.detectMood(htmlContent)
                .then(({ mood }) => {
                  if (mood && savedEntry.id) {
                    // Update entry with detected mood
                    journalApi.saveEntry({ ...savedEntry, mood } as any);
                  }
                })
                .catch(err => console.log('Mood detection skipped:', err));
            });
          }
        } catch (error) {
          console.error('Failed to save entry to API:', error);
        }
      }
    };

    // Save when component unmounts (user leaves page)
    return () => {
      saveToJournal();
    };
  }, [editor, todayKey, uploadedImages]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      setUploadingImages(true);
      try {
        console.log('Starting image upload:', file.name, file.type, file.size);
        
        // Upload to S3
        const imageMetadata = await s3Upload.uploadImage(file);
        console.log('Image uploaded successfully:', imageMetadata);

        uploadedImageMapRef.current.set(imageMetadata.url, imageMetadata);
        setUploadedImages((prev) => {
          if (prev.some((img) => img.url === imageMetadata.url)) {
            return prev;
          }
          return [...prev, imageMetadata];
        });
        
        // Add to uploaded images list
        // Insert image into editor using the S3 URL with default width
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: 'resizableImage',
              attrs: { 
                src: imageMetadata.url,
                width: 400 // Default width for better initial size
              },
            },
            {
              type: 'paragraph',
            },
          ])
          .run();
        syncUploadedImages(editor);
      } catch (error) {
        console.error('Image upload failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to upload image: ${errorMessage}\n\nPlease check:\n1. Backend is running\n2. AWS credentials are configured\n3. S3 bucket exists\n\nCheck console for details.`);
      } finally {
        setUploadingImages(false);
      }
    }
    // Reset file input
    event.target.value = '';
  };

  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
  
  const setColor = (color: string) => {
    editor?.chain().focus().setColor(color).run();
  };

  const colors = [
    "#000000", // black
    "#6B7280", // gray
    "#EF4444", // red
    "#F59E0B", // amber
    "#10B981", // green
    "#3B82F6", // blue
    "#8B5CF6", // purple
    "#EC4899", // pink
  ];

  // Handle creating a fresh entry
  const startNewEntry = () => {
    if (editor) {
      editor.commands.clearContent();
      // Clear the draft from localStorage
      localStorage.removeItem(storageKey);
      setHasExistingEntry(false);
      setShowNewEntryPrompt(false);
      setLastSaved(null);
      uploadedImageMapRef.current.clear();
      setUploadedImages([]);
    }
  };

  // Handle date change and save entry for new date
  const handleDateChange = async (newDate: Date) => {
    // Save current entry before changing date
    if (editor && editor.getText().trim()) {
      const htmlContent = editor.getHTML();
      const entryId = `entry-${todayKey}`;
      const entry = {
        id: entryId,
        title: generateTitle(htmlContent),
        date: new Date(currentDate),
        content: htmlContent,
        preview: generatePreview(htmlContent),
        wordCount: countWords(htmlContent),
        images: uploadedImages,
      };
      try {
        await journalApi.saveEntry(entry);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to save entry before date change:', error);
      }
    }
    setCurrentDate(newDate);
    setShowDatePicker(false);
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setCurrentDate(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Voice recording functionality
  const { isRecording, toggleRecording } = useVoiceRecording({
    onTranscript: (transcript) => {
      if (editor) {
        // Insert the transcribed text at the current cursor position
        editor.chain().focus().insertContent(transcript + ' ').run();
      }
    },
    continuous: true,
    onError: (errorType) => {
      // Only show error toast for permission denial (skip aborted/no-speech which are normal)
      if (errorType === 'not-allowed') {
        setPermissionErrorMessage('🎤 Microphone access needed. Click the 🔒 or ⓘ icon in your address bar, find "Microphone" under permissions, select "Allow", then try again.');
        setShowPermissionError(true);
      } else if (errorType === 'audio-capture') {
        setPermissionErrorMessage('🎤 No microphone found. Please connect a microphone and try again.');
        setShowPermissionError(true);
      } else if (errorType === 'not-supported') {
        setPermissionErrorMessage('🎤 Microphone access is not supported. Please use HTTPS or check your browser settings.');
        setShowPermissionError(true);
      } else if (errorType === 'network') {
        setPermissionErrorMessage('📡 Network error. Speech recognition requires an internet connection.');
        setShowPermissionError(true);
      }
      // Skip showing toast for 'no-speech' and 'aborted' errors (these are normal)
    },
  });

  return (
    <div className="flex-1 flex flex-col relative bg-background">
      {/* Date Picker Modal */}
      {showDatePicker && (
        <div 
          className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-fadeIn"
          onClick={() => setShowDatePicker(false)}
        >
          <div 
            className="bg-card/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-8 w-full max-w-sm md:max-w-md shadow-2xl border border-primary/15 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl text-foreground/90">Select Date</h3>
              <button
                onClick={() => setShowDatePicker(false)}
                className="p-2 rounded-full hover:bg-background/60 transition-colors"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Manual Date Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground/70 mb-2">
                  Pick a date
                </label>
                <input
                  type="date"
                  value={currentDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value + 'T00:00:00');
                    setCurrentDate(newDate);
                  }}
                  className="w-full px-4 py-3 bg-background/60 rounded-[20px] border border-primary/10 focus:border-primary/30 focus:outline-none text-foreground/90 text-base"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    goToPreviousDay();
                    setShowDatePicker(false);
                  }}
                  className="flex-1 px-4 py-3 bg-background/60 hover:bg-background/80 border border-primary/20 hover:border-primary/30 rounded-full text-foreground/90 text-sm transition-all hover:scale-105"
                >
                  ← Previous Day
                </button>
                <button
                  onClick={() => {
                    goToNextDay();
                    setShowDatePicker(false);
                  }}
                  className="flex-1 px-4 py-3 bg-background/60 hover:bg-background/80 border border-primary/20 hover:border-primary/30 rounded-full text-foreground/90 text-sm transition-all hover:scale-105"
                >
                  Next Day →
                </button>
              </div>

              <button
                onClick={() => {
                  goToToday();
                  setShowDatePicker(false);
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 rounded-full border border-primary/30 text-primary font-medium transition-all hover:scale-105"
              >
                Jump to Today
              </button>

              <button
                onClick={() => handleDateChange(currentDate)}
                className="w-full px-6 py-3 bg-primary/90 hover:bg-primary rounded-full text-primary-foreground font-medium transition-all hover:scale-105"
              >
                Confirm Date
              </button>
            </div>

            {/* Current Selection Preview */}
            <div className="mt-6 p-4 bg-primary/5 rounded-[20px] border border-primary/10">
              <p className="text-sm text-muted-foreground/70 mb-1">Selected date:</p>
              <p className="text-foreground/90 font-medium">
                {currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar with Back Button and Date */}
      <div className="w-full pt-8 md:pt-12 pb-6 md:pb-8 px-4 md:px-6">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-6 md:mb-8 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Home</span>
            </Link>

            {/* Autosave Indicator */}
            <div className="flex items-center gap-2 text-sm">
              {isSaving ? (
                <span className="text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"></span>
                  Saving...
                </span>
              ) : lastSaved ? (
                <span className="text-muted-foreground/70 flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary/60" />
                  Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              ) : null}
            </div>
          </div>
          
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-4xl text-foreground/90">{displayDate}</h1>
              
              {/* Date Picker Button (for testing) */}
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="p-2 rounded-full bg-card/60 backdrop-blur-sm border border-primary/10 hover:bg-card hover:border-primary/20 transition-all"
                title="Change date (for testing)"
                type="button"
              >
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <p className="text-muted-foreground text-lg italic">
              What's on your mind today?
            </p>

            {/* New Entry Button - Shows when there's existing content */}
            {hasExistingEntry && !showNewEntryPrompt && (
              <button
                onClick={() => setShowNewEntryPrompt(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/15 rounded-[16px] border border-primary/20 text-primary transition-all animate-in fade-in slide-in-from-top-2 duration-300"
                type="button"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Start Fresh Entry</span>
              </button>
            )}

            {/* Confirmation Dialog for New Entry */}
            {showNewEntryPrompt && (
              <div className="bg-card/80 backdrop-blur-sm rounded-[20px] border border-primary/15 p-4 max-w-md mx-auto animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm text-muted-foreground/80 mb-3">
                  You have an existing entry for today. Starting a fresh entry will replace it. Continue?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNewEntryPrompt(false)}
                    className="flex-1 px-4 py-2 bg-background/60 hover:bg-background rounded-[12px] text-sm text-foreground/80 transition-colors"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startNewEntry}
                    className="flex-1 px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-[12px] text-sm text-primary font-medium transition-colors"
                    type="button"
                  >
                    Start Fresh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto pb-32 relative">
          {/* Fixed AI Companion Dialog - stays visible during scroll */}
          <div className="hidden md:block fixed top-46 left-6 md:left-12 z-10 animate-fadeIn">
            <div className="flex items-start gap-3 md:gap-4 max-w-xs md:max-w-md">
              {/* Mascot Avatar */}
              <div className="flex-shrink-0">
                <JournalMascot size={56} />
              </div>

              {/* Speech Bubble - HARDCODED for now, easy to replace with real AI */}
              <div className="relative">
                {/* Speech bubble tail */}
                <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-card/95"></div>
                
                {/* Speech bubble content */}
                <div className="bg-card/95 backdrop-blur-xl rounded-3xl px-6 py-4 shadow-2xl border border-primary/10">
                  <p className="text-foreground/85 text-base leading-relaxed">
                    {chatbotMessages[currentMessageIndex]}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`w-full py-6 md:py-8 transition-all duration-300 ${isToolsPanelOpen ? 'pl-6 md:pl-12 pr-16 md:pr-24' : 'px-4 md:px-12'}`}>
            {/* Rich Text Editor - Notion-like Experience */}
            <div className="min-h-screen">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Right Tools Panel */}
        <div className={`
          fixed right-0 top-24 bottom-0 transition-all duration-300 ease-out
          ${isToolsPanelOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="h-full flex items-center">
            {/* Toggle Button */}
            <button
              onClick={() => setIsToolsPanelOpen(!isToolsPanelOpen)}
              className="absolute -left-10 top-1/2 -translate-y-1/2 p-3 rounded-l-2xl bg-card/80 backdrop-blur-sm border border-r-0 border-primary/10 hover:bg-card transition-all shadow-lg"
              aria-label={isToolsPanelOpen ? "Close tools panel" : "Open tools panel"}
              type="button"
            >
              {isToolsPanelOpen ? (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* Tools Panel Content */}
            <div className="h-full w-20 bg-card/80 backdrop-blur-sm border-l border-primary/10 flex flex-col items-center py-8 gap-4">
              {/* Text Formatting */}
              <div className="flex flex-col gap-2 pb-4 border-b border-primary/10 w-full items-center">
                <button
                  onClick={toggleBold}
                  className={`p-3 rounded-xl transition-all hover:bg-background/60 ${
                    editor?.isActive('bold') ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
                  }`}
                  title="Bold"
                  type="button"
                >
                  <Bold className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleItalic}
                  className={`p-3 rounded-xl transition-all hover:bg-background/60 ${
                    editor?.isActive('italic') ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
                  }`}
                  title="Italic"
                  type="button"
                >
                  <Italic className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleUnderline}
                  className={`p-3 rounded-xl transition-all hover:bg-background/60 ${
                    editor?.isActive('underline') ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
                  }`}
                  title="Underline"
                  type="button"
                >
                  <Underline className="w-5 h-5" />
                </button>
              </div>

              {/* Color Palette */}
              <div className="flex flex-col gap-2 pb-4 border-b border-primary/10 w-full items-center">
                <Palette className="w-5 h-5 text-muted-foreground mb-1" />
                <div className="grid grid-cols-2 gap-1.5">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setColor(color)}
                      className="w-6 h-6 rounded-lg border border-primary/20 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={`Color: ${color}`}
                      type="button"
                    />
                  ))}
                </div>
              </div>

              {/* Media Tools */}
              <div className="flex flex-col gap-2 w-full items-center">
                <button
                  onClick={addImage}
                  disabled={uploadingImages}
                  className={`p-3 rounded-xl transition-all ${
                    uploadingImages 
                      ? 'bg-primary/10 text-primary/60 cursor-wait' 
                      : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
                  }`}
                  title={uploadingImages ? "Uploading..." : "Add image"}
                  type="button"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-xl transition-all ${
                    isRecording 
                      ? 'bg-red-500/20 text-red-500 animate-pulse' 
                      : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
                  }`}
                  title={isRecording ? "Stop recording" : "Start voice recording"}
                  type="button"
                >
                  <Mic className="w-5 h-5" />
                </button>
                {isRecording && (
                  <div className="flex items-center gap-2 mt-2 animate-pulse">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-xs text-red-500">Recording… Speak now!</span>
                  </div>
                )}
                <button
                  className="p-3 rounded-xl text-muted-foreground hover:bg-background/60 hover:text-foreground transition-all"
                  title="Attach file"
                  type="button"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* TipTap Editor Styles */}
      <style>{`
        .ProseMirror {
          padding: 2rem 0;
          font-size: 1.125rem;
          line-height: 1.8;
          color: inherit;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgb(156 163 175 / 0.4);
          pointer-events: none;
          height: 0;
        }

        .ProseMirror:focus {
          outline: none;
        }

        .ProseMirror h1 {
          font-size: 2.5rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .ProseMirror h2 {
          font-size: 2rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }

        .ProseMirror h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .ProseMirror p {
          margin-bottom: 1rem;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .ProseMirror li {
          margin-bottom: 0.5rem;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 1rem;
          margin: 1.5rem 0;
          cursor: move;
        }

        .resizable-image-wrapper {
          margin: 1.5rem 0;
          display: block;
        }

        .resizable-image-wrapper img {
          cursor: pointer !important;
          user-select: none;
        }

        .ProseMirror blockquote {
          border-left: 4px solid rgb(var(--primary) / 0.3);
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: rgb(var(--foreground) / 0.8);
        }

        .ProseMirror code {
          background-color: rgb(var(--card));
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.9em;
          font-family: 'Courier New', monospace;
        }

        .ProseMirror pre {
          background-color: rgb(var(--card));
          padding: 1rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .ProseMirror pre code {
          background: none;
          padding: 0;
        }

        .ProseMirror strong {
          font-weight: 600;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror u {
          text-decoration: underline;
        }
      `}</style>

      {/* Upload Loading Overlay */}
      {uploadingImages && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center min-h-screen">
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-primary/20 flex flex-col items-center gap-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-40">
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-foreground/80 font-medium">Uploading image...</p>
          </div>
        </div>
      )}

      {/* Permission Error Toast */}
      {showPermissionError && (
        <Toast
          type="error"
          message={permissionErrorMessage}
          onClose={() => setShowPermissionError(false)}
        />
      )}
    </div>
  );
}