import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Bug, Trash2, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DiagnosticInfo {
  apiKeys: {
    skillTree: boolean;
    lesson: boolean;
    quiz: boolean;
    assessment: boolean;
  };
  cache: {
    version: number | null;
    itemCount: number;
    size: string;
  };
  apiCalls: Array<{
    timestamp: string;
    type: string;
    status: 'success' | 'error';
    message: string;
  }>;
  errors: Array<{
    timestamp: string;
    message: string;
    stack?: string;
  }>;
}

export const DiagnosticPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [info, setInfo] = useState<DiagnosticInfo | null>(null);

  const collectDiagnostics = () => {
    // Check API keys
    const apiKeys = {
      skillTree: !!import.meta.env.VITE_GROQ_API_KEY_1,
      lesson: !!import.meta.env.VITE_GROQ_API_KEY_2,
      quiz: !!import.meta.env.VITE_GROQ_API_KEY_3,
      assessment: !!import.meta.env.VITE_GROQ_API_KEY_4,
    };

    // Check cache
    let cache = { version: null, itemCount: 0, size: '0 KB' };
    try {
      const cacheKey = Object.keys(localStorage).find(key => key.includes('content_cache'));
      if (cacheKey) {
        const cacheData = localStorage.getItem(cacheKey);
        if (cacheData) {
          const parsed = JSON.parse(cacheData);
          cache = {
            version: parsed.version || null,
            itemCount: Object.keys(parsed).length - 1, // -1 for version key
            size: `${(cacheData.length / 1024).toFixed(2)} KB`,
          };
        }
      }
    } catch (error) {
      console.error('Failed to read cache:', error);
    }

    // Get API call history from console logs (if available)
    const apiCalls: DiagnosticInfo['apiCalls'] = [];
    const errors: DiagnosticInfo['errors'] = [];

    setInfo({ apiKeys, cache, apiCalls, errors });
  };

  useEffect(() => {
    if (isOpen) {
      collectDiagnostics();
    }
  }, [isOpen]);

  const clearCache = () => {
    try {
      const cacheKey = Object.keys(localStorage).find(key => key.includes('content_cache'));
      if (cacheKey) {
        localStorage.removeItem(cacheKey);
        alert('✅ Cache cleared! Please refresh the page.');
        collectDiagnostics();
      }
    } catch (error) {
      alert('❌ Failed to clear cache: ' + error);
    }
  };

  const clearAllStorage = () => {
    if (confirm('⚠️ This will clear ALL localStorage data. Continue?')) {
      localStorage.clear();
      alert('✅ All storage cleared! Please refresh the page.');
    }
  };

  const testAPIKeys = async () => {
    const testTopic = 'Test Topic for API Verification';
    
    try {
      console.log('🧪 Testing Groq API keys...');
      console.log('📝 Test topic:', testTopic);
      
      const { generateSkillTree } = await import('@/services/groqService');
      const result = await generateSkillTree(testTopic);
      
      console.log('✅ API test successful!', result);
      alert('✅ API Test Successful!\n\nGroq API is working correctly.\nCheck console for details.');
      collectDiagnostics();
    } catch (error: any) {
      console.error('❌ API test failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        type: error.error?.type,
        stack: error.stack,
      });
      
      alert(
        '❌ API Test Failed!\n\n' +
        'Error: ' + error.message + '\n\n' +
        'Possible causes:\n' +
        '1. API keys are missing or invalid\n' +
        '2. API keys have no credits left\n' +
        '3. Network connection issue\n' +
        '4. Rate limit exceeded\n\n' +
        'Check browser console (F12) for detailed error information.'
      );
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
        title="Open Diagnostics"
      >
        <Bug className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-bold">Diagnostic Panel</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* API Keys Status */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              🔑 API Keys Status
            </h3>
            <div className="space-y-1 text-sm">
              {info && Object.entries(info.apiKeys).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  {value ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="capitalize">{key}:</span>
                  <span className={value ? 'text-green-500' : 'text-red-500'}>
                    {value ? 'Configured' : 'MISSING'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cache Status */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              💾 Cache Status
            </h3>
            {info && (
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {info.cache.version === 2 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span>Version: {info.cache.version || 'Unknown'}</span>
                  {info.cache.version !== 2 && (
                    <span className="text-yellow-500">(Should be 2)</span>
                  )}
                </div>
                <div>Items: {info.cache.itemCount}</div>
                <div>Size: {info.cache.size}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <h3 className="font-semibold">🛠️ Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={collectDiagnostics}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Info
              </Button>
              <Button
                onClick={testAPIKeys}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Bug className="h-4 w-4" />
                Test API Keys
              </Button>
              <Button
                onClick={clearCache}
                variant="outline"
                size="sm"
                className="gap-2 text-yellow-500 border-yellow-500"
              >
                <Trash2 className="h-4 w-4" />
                Clear Cache
              </Button>
              <Button
                onClick={clearAllStorage}
                variant="outline"
                size="sm"
                className="gap-2 text-red-500 border-red-500"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Storage
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold">📋 Troubleshooting Steps</h3>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>
                <strong>Check API Keys:</strong> All 4 should show "Configured"
                {info && !Object.values(info.apiKeys).every(v => v) && (
                  <span className="text-red-500 block ml-6">
                    ❌ Some API keys are missing! Check your .env file.
                  </span>
                )}
              </li>
              <li>
                <strong>Check Cache Version:</strong> Should be version 2
                {info && info.cache.version !== 2 && (
                  <span className="text-yellow-500 block ml-6">
                    ⚠️ Old cache detected! Click "Clear Cache" button.
                  </span>
                )}
              </li>
              <li>
                <strong>Test API:</strong> Click "Test API Keys" to verify they work
              </li>
              <li>
                <strong>Clear Cache:</strong> If seeing mock data, clear cache
              </li>
              <li>
                <strong>Refresh Page:</strong> After clearing cache, refresh the page
              </li>
              <li>
                <strong>Generate New Tree:</strong> Create a NEW skill tree (don't use old ones)
              </li>
            </ol>
          </div>

          {/* Console Instructions */}
          <div className="space-y-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="font-semibold text-blue-400">🔍 Check Browser Console</h3>
            <p className="text-sm">
              Press <kbd className="px-2 py-1 bg-muted rounded">F12</kbd> to open DevTools, then check the Console tab.
            </p>
            <p className="text-sm">You should see:</p>
            <ul className="text-sm space-y-1 list-disc list-inside ml-4">
              <li>🔑 Groq API Keys Status</li>
              <li>🌳 Generating skill tree for: "..."</li>
              <li>🚀 Calling Groq API with model: llama-3.1-8b-instant</li>
              <li>✅ Skill tree generated successfully</li>
            </ul>
            <p className="text-sm text-yellow-400 mt-2">
              If you see ❌ errors, that's the problem we need to fix!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
