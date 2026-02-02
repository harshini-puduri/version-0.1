// Speech-to-Text API integration for AddEntry
import { backendMode } from './storageMode';

const getApiUrl = () => backendMode.getUrl();

export async function transcribeAudioBlob(audioBlob: Blob): Promise<string> {
  const apiUrl = getApiUrl();
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');

  const response = await fetch(`${apiUrl}/api/stt/transcribe?user_id=demo_user`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`STT API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  // Expecting { transcript: string }
  return data.transcript || '';
}
