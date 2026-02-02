// src/services/entriesApi.ts
import { backendMode } from './storageMode';

const getApiUrl = () => {
  return backendMode.getUrl();
};

export interface ImageMetadata {
  s3_key: string;
  url: string;
  rag_processed?: boolean;
  rag_description?: string;
}

export interface Entry {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string | null;
  images?: ImageMetadata[];
  mood?: string | null;
}

export interface EntryCreate {
  title: string;
  content: string;
  images?: ImageMetadata[];
  mood?: string | null;
}

export const entriesApi = {
  // Get all entries with pagination
  async getAll(skip: number = 0, limit: number = 1000, userId: string = 'demo_user'): Promise<Entry[]> {
    const response = await fetch(`${getApiUrl()}/api/entries/?skip=${skip}&limit=${limit}&user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch entries');
    return response.json();
  },

  // Get single entry by ID
  async getById(id: number, userId: string = 'demo_user'): Promise<Entry> {
    const response = await fetch(`${getApiUrl()}/api/entries/${id}?user_id=${userId}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error('Entry not found');
      throw new Error('Failed to fetch entry');
    }
    return response.json();
  },

  // Create new entry
  async create(entry: EntryCreate, userId: string = 'demo_user'): Promise<Entry> {
    const response = await fetch(`${getApiUrl()}/api/entries/?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (!response.ok) throw new Error('Failed to create entry');
    return response.json();
  },

  // Update existing entry
  async update(id: number, entry: Partial<EntryCreate>, userId: string = 'demo_user'): Promise<Entry> {
    const response = await fetch(`${getApiUrl()}/api/entries/${id}?user_id=${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (!response.ok) {
      if (response.status === 404) throw new Error('Entry not found');
      throw new Error('Failed to update entry');
    }
    return response.json();
  },

  // Delete entry
  async delete(id: number, userId: string = 'demo_user'): Promise<void> {
    const response = await fetch(`${getApiUrl()}/api/entries/${id}?user_id=${userId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      if (response.status === 404) throw new Error('Entry not found');
      throw new Error('Failed to delete entry');
    }
  },

  // Get entries for a specific date
  async getByDate(date: string, userId: string = 'demo_user'): Promise<Entry[]> {
    const allEntries = await this.getAll(0, 1000, userId);
    return allEntries.filter(entry => {
      const entryDate = new Date(entry.created_at).toDateString();
      const targetDate = new Date(date).toDateString();
      return entryDate === targetDate;
    });
  },

  // Search entries by content or title
  async search(query: string): Promise<Entry[]> {
    const allEntries = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return allEntries.filter(entry => 
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.content.toLowerCase().includes(lowerQuery)
    );
  }
};
