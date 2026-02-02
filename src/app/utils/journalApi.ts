// Hybrid journal storage - uses API when available, falls back to localStorage
import { entriesApi, type Entry as ApiEntry, type ImageMetadata } from '@/services/entriesApi';
import { JournalEntry } from './journalStorage';

// Convert API entry to local JournalEntry format
function apiToLocal(apiEntry: ApiEntry): JournalEntry {
  return {
    id: apiEntry.id.toString(),
    title: apiEntry.title,
    date: new Date(apiEntry.created_at),
    content: apiEntry.content,
    preview: apiEntry.content.substring(0, 150).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    wordCount: apiEntry.content.split(/\s+/).length,
    images: apiEntry.images || [],
  };
}

// Convert local JournalEntry to API format
function localToApi(entry: JournalEntry): { title: string; content: string; images?: ImageMetadata[] } {
  return {
    title: entry.title,
    content: entry.content,
    images: entry.images || [],
  };
}

export const journalApi = {
  // Get all entries
  async getAllEntries(): Promise<JournalEntry[]> {
    try {
      const apiEntries = await entriesApi.getAll(0, 1000, 'demo_user');
      return apiEntries.map(apiToLocal).sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Failed to fetch entries from API:', error);
      throw error;
    }
  },

  // Save or update entry
  async saveEntry(entry: JournalEntry): Promise<JournalEntry> {
    try {
      const apiData = localToApi(entry);
      if (entry.id && !isNaN(Number(entry.id))) {
        // Update existing entry
        const updated = await entriesApi.update(Number(entry.id), apiData, 'demo_user');
        return apiToLocal(updated);
      } else {
        // Create new entry
        const created = await entriesApi.create(apiData, 'demo_user');
        return apiToLocal(created);
      }
    } catch (error) {
      console.error('Failed to save entry:', error);
      throw error;
    }
  },

  // Get entry by ID
  async getEntryById(id: string): Promise<JournalEntry | null> {
    try {
      const apiEntry = await entriesApi.getById(Number(id), 'demo_user');
      return apiToLocal(apiEntry);
    } catch (error) {
      console.error('Failed to fetch entry:', error);
      return null;
    }
  },

  // Get entry by date
  async getEntryByDate(date: Date): Promise<JournalEntry | null> {
    try {
      const entries = await this.getAllEntries(); // Already filtered by demo_user
      const dateKey = date.toISOString().split("T")[0];
      return entries.find((e) => {
        const entryDateKey = new Date(e.date).toISOString().split("T")[0];
        return entryDateKey === dateKey;
      }) || null;
    } catch (error) {
      console.error('Failed to fetch entry by date:', error);
      return null;
    }
  },

  // Delete entry
  async deleteEntry(id: string): Promise<void> {
    try {
      await entriesApi.delete(Number(id), 'demo_user');
    } catch (error) {
      console.error('Failed to delete entry:', error);
      throw error;
    }
  },

  // Search entries
  async searchEntries(query: string): Promise<JournalEntry[]> {
    try {
      const apiEntries = await entriesApi.search(query);
      return apiEntries.map(apiToLocal);
    } catch (error) {
      console.error('Failed to search entries:', error);
      throw error;
    }
  }
};
