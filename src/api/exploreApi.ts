const API_BASE = 'https://journal-backend-api.fly.dev';

export interface ExploreMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ExploreResponse {
  response: string;
  suggestions: string[];
  mood_detected: string | null;
  journal_references: any[];
  agent_used: string;
}

export const exploreApi = {
  // Chat with Sri
  async chat(
    message: string, 
    conversationHistory: ExploreMessage[] = [],
    contextMode: 'companion' | 'coach' | 'analyst' | 'explorer' = 'companion'
  ): Promise<ExploreResponse> {
    const response = await fetch(`${API_BASE}/api/explore/chat?user_id=demo_user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory,
        context_mode: contextMode,
        include_journal_context: true,
        user_id: 'default'
      })
    });
    if (!response.ok) throw new Error('Chat failed');
    return response.json();
  },

  // Get conversation starters
  async getPrompts(mode: string = 'companion'): Promise<{ prompts: string[] }> {
    const response = await fetch(`${API_BASE}/api/explore/prompts?mode=${mode}&user_id=demo_user`);
    return response.json();
  },

  // Get available modes
  async getModes() {
    const response = await fetch(`${API_BASE}/api/explore/modes?user_id=demo_user`);
    return response.json();
  },

  // Transcribe audio with Whisper
  async transcribeAudio(audioBlob: Blob): Promise<{ transcript: string }> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    
    const response = await fetch(`${API_BASE}/api/stt/transcribe?user_id=demo_user`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Transcription failed');
    return response.json();
  },

  // Detect mood from journal entry content
  async detectMood(content: string): Promise<{ mood: string | null }> {
    const response = await fetch(`${API_BASE}/api/analyze/mood?user_id=demo_user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Mood detection failed');
    return response.json();
  }
};
