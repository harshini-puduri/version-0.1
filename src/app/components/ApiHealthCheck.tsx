// src/app/components/ApiHealthCheck.tsx
import { useState, useEffect } from 'react';
import { api, API_BASE_URL, type HealthCheckResponse } from '../../services/api';
import { backendMode } from '@/services/storageMode';
import { Button } from './ui/button';
import { Card } from './ui/card';
import BackendToggle from './StorageModeToggle';

export default function ApiHealthCheck() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.healthCheck();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      {/* Backend Toggle */}
      <BackendToggle />

      <h2 className="text-2xl font-bold mb-4">🔗 Backend API Status</h2>
      
      <Card className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-4">
        <p className="text-sm">
          <strong>Current API URL:</strong> <code className="ml-2 text-blue-600 dark:text-blue-400">{backendMode.getUrl()}</code>
        </p>
      </Card>

      {loading && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 rounded-lg text-blue-900 dark:text-blue-100">
          <p className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Checking backend connection...
          </p>
        </Card>
      )}

      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-400 rounded-lg text-red-900 dark:text-red-100">
          <strong className="block mb-2">❌ Connection Failed</strong>
          <p className="mb-3">{error}</p>
          <div className="mt-2 text-sm bg-gray-900 text-gray-100 p-3 rounded">
            <p className="mb-2">Make sure your backend is running:</p>
            <code className="block bg-black/50 p-2 rounded text-xs">
              cd /Users/harshinipuduri/Desktop/Sri_Backend
              <br />
              uvicorn backend.app.main:app --reload --port 8000
            </code>
          </div>
        </Card>
      )}

      {health && (
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-400 rounded-lg text-green-900 dark:text-green-100">
          <strong className="block mb-2">✅ Backend Connected!</strong>
          <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-auto text-sm mt-2">
            {JSON.stringify(health, null, 2)}
          </pre>
        </Card>
      )}

      <Button 
        onClick={checkHealth}
        className="mt-4 w-full sm:w-auto"
        disabled={loading}
      >
        {loading ? '⏳ Checking...' : '🔄 Refresh Connection'}
      </Button>
    </div>
  );
}
