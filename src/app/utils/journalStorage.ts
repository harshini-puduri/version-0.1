// Shared journal storage utilities

export interface ImageMetadata {
  s3_key: string;
  url: string;
  rag_processed?: boolean;
  rag_description?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  date: Date;
  content: string;
  preview: string;
  mood?: "calm" | "happy" | "thoughtful" | "stressed";
  wordCount: number;
  images?: ImageMetadata[];
}

const JOURNAL_ENTRIES_KEY = "journal-entries";

// Get all journal entries from localStorage
export function getAllEntries(): JournalEntry[] {
  try {
    const stored = localStorage.getItem(JOURNAL_ENTRIES_KEY);
    if (!stored) {
      // Initialize with dummy data
      initializeDummyData();
      return getDummyEntries();
    }
    
    const entries = JSON.parse(stored);
    // Convert date strings back to Date objects
    return entries.map((entry: any) => ({
      ...entry,
      date: new Date(entry.date),
    }));
  } catch (error) {
    console.error("Error loading journal entries:", error);
    return getDummyEntries();
  }
}

// Save or update a journal entry
export function saveEntry(entry: JournalEntry): void {
  try {
    const entries = getAllEntries();
    const existingIndex = entries.findIndex((e) => e.id === entry.id);
    
    if (existingIndex >= 0) {
      // Update existing entry
      entries[existingIndex] = entry;
    } else {
      // Add new entry
      entries.push(entry);
    }
    
    // Sort by date (newest first)
    entries.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error("Error saving journal entry:", error);
  }
}

// Get a specific entry by ID
export function getEntryById(id: string): JournalEntry | null {
  const entries = getAllEntries();
  return entries.find((e) => e.id === id) || null;
}

// Get entry for a specific date (for daily entry)
export function getEntryByDate(date: Date): JournalEntry | null {
  const entries = getAllEntries();
  const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
  return entries.find((e) => {
    const entryDateKey = new Date(e.date).toISOString().split("T")[0];
    return entryDateKey === dateKey;
  }) || null;
}

// Delete an entry
export function deleteEntry(id: string): void {
  try {
    const entries = getAllEntries();
    const filtered = entries.filter((e) => e.id !== id);
    localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting journal entry:", error);
  }
}

// Delete all entries
export function deleteAllEntries(): void {
  try {
    localStorage.removeItem(JOURNAL_ENTRIES_KEY);
  } catch (error) {
    console.error("Error deleting all entries:", error);
  }
}

// Generate preview text from HTML content
export function generatePreview(htmlContent: string, maxLength: number = 150): string {
  // Strip HTML tags
  const text = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Count words in HTML content
export function countWords(htmlContent: string): number {
  const text = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

// Generate a title from content (first line or first few words)
export function generateTitle(htmlContent: string): string {
  const text = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  
  if (!text) return "Untitled Entry";
  
  // Try to get first line/sentence
  const firstLine = text.split(/[.!?\n]/)[0].trim();
  
  if (firstLine.length > 50) {
    return firstLine.substring(0, 50) + "...";
  }
  
  return firstLine || "Untitled Entry";
}
// Dummy data functions
function getDummyEntries(): JournalEntry[] {
  const dummyEntries: JournalEntry[] = [];
  const moods: Array<"calm" | "happy" | "thoughtful" | "stressed"> = ["calm", "happy", "thoughtful", "stressed"];
  
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    dummyEntries.push({
      id: `entry-dummy-${i}`,
      title: `Day ${i + 1} Reflection`,
      date: date,
      content: `<p>Today was a wonderful day. I spent time reflecting on my journey and noticed how much I've grown.</p>`,
      preview: "Today was a wonderful day. I spent time reflecting on my journey...",
      mood: moods[i % moods.length],
      wordCount: 15,
    });
  }
  
  return dummyEntries;
}

function initializeDummyData(): void {
  const dummyEntries = getDummyEntries();
  localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(dummyEntries));
}