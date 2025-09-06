import React, { useState, useEffect } from 'react';
import { ApiKeySetup } from './components/ApiKeySetup';
import { ChatInterface } from './components/ChatInterface';

function App() {
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeySet = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini-api-key', key);
  };

  const handleResetApiKey = () => {
    setApiKey('');
    localStorage.removeItem('gemini-api-key');
  };

  if (!apiKey) {
    return <ApiKeySetup onApiKeySet={handleApiKeySet} />;
  }

  return <ChatInterface onResetApiKey={handleResetApiKey} />;
}

export default App;
