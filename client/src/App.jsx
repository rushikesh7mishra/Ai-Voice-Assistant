import { useState, useRef, useEffect } from 'react';
import { askQuestion } from './api';
import './index.css';

function App() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [usageCount, setUsageCount] = useState(0);
  const [showDevTools, setShowDevTools] = useState(false);
  const timeoutRef = useRef(null);

  // Load usage count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('usageCount');
    if (savedCount) {
      setUsageCount(parseInt(savedCount));
    }
  }, []);

  // Developer tools (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDevTools(!showDevTools);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDevTools]);

  // Dark mode handler
  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  // Speech recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';

  const speak = (text) => {
    if (usageCount >= 3) return; // No speaking after 3 trials
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = voices.filter(voice =>
      voice.name.toLowerCase().includes('daniel') || voice.name.toLowerCase().includes('english')
    );
    utterance.voice = preferredVoices.length > 0 ? preferredVoices[0] : voices[0];
    utterance.pitch = 1.1;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  recognition.onstart = () => {
    if (usageCount >= 3) {
      recognition.stop();
      return;
    }
    setStatus('🎤 Listening...');
    timeoutRef.current = setTimeout(() => {
      recognition.stop();
      const noInputMsg = 'No input received!';
      setStatus(noInputMsg);
      speak(noInputMsg);
      setListening(false);
    }, 10000);
  };

  recognition.onresult = async (event) => {
    if (usageCount >= 3) return;
    
    clearTimeout(timeoutRef.current);
    const result = event.results[0][0].transcript;
    setTranscript(result);
    setStatus('');
    
    const res = await askQuestion(result);
    setResponse(res.data.answer);
    speak(res.data.answer);
    setListening(false);
    
    // Increment usage count
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('usageCount', newCount.toString());
  };

  recognition.onerror = (event) => {
    clearTimeout(timeoutRef.current);
    setStatus(`⚠️ Error: ${event.error}`);
    setListening(false);
  };

  const handleListen = () => {
    if (usageCount >= 3) {
      setResponse('You have used all 3 free trials. No more access available.');
      return;
    }
    
    setTranscript('');
    setResponse('');
    setStatus('');
    setListening(true);
    recognition.start();
  };

  // Developer tools
  const resetApp = () => {
    setUsageCount(0);
    localStorage.setItem('usageCount', '0');
    setResponse('Developer: App reset');
    setTranscript('');
    setStatus('');
  };

  const simulateUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('usageCount', newCount.toString());
    setResponse(`Developer: Simulated usage (${newCount}/3)`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 md:px-10 py-8 transition-all duration-500">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="toggle fixed top-4 right-4 text-xl p-2 rounded-full hover:scale-110 transition-transform z-10"
        title="Toggle Theme"
      >
        {darkMode ? '🌞' : '🌙'}
      </button>

      <div className="card shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-md sm:max-w-xl text-center border backdrop-blur-lg transition-all duration-500 scale-95 hover:scale-100 animate-fade-in-down">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 tracking-tight">
          🎙️ AI Voice Assistant
        </h1>

        {usageCount >= 3 && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 rounded-lg">
            <p className="font-bold text-red-800 dark:text-red-200">Access Denied</p>
            <p className="mb-3">You've used all 3 free trials. Premium option available for $1.</p>
            <button
              className="px-6 py-2 bg-gray-400 text-gray-700 rounded-full cursor-not-allowed"
              disabled
            >
              Service Ended
            </button>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Free trials remaining: {Math.max(0, 3 - usageCount)}/3
          </p>
        </div>

        <button
          onClick={handleListen}
          disabled={listening || usageCount >= 3}
          className={`px-6 sm:px-8 py-3 rounded-full text-base sm:text-lg font-semibold shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 ${
            listening
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : usageCount >= 3
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 glow pulse-ring'
          }`}
        >
          {listening ? 'Listening...' : 'Start Talking'}
        </button>

        <div className="mt-8 text-left space-y-4 text-sm sm:text-base">
          <p>
            <span className="font-semibold">Status:</span>{' '}
            <span className="text-yellow-500">{status}</span>
          </p>
          <p>
            <span className="font-semibold">You said:</span>{' '}
            <span className="text-green-400">{transcript || '---'}</span>
          </p>
          <p>
            <span className="font-semibold">Assistant:</span>{' '}
            <span className="text-blue-400 whitespace-pre-line">{response || '---'}</span>
          </p>
        </div>
      </div>

      {showDevTools && (
        <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-xl z-50">
          <h3 className="font-bold mb-2">👨‍💻 Developer Tools</h3>
          <div className="flex gap-2 mb-2">
            <button 
              onClick={resetApp}
              className="px-3 py-1 bg-blue-500 rounded text-sm"
            >
              Reset App
            </button>
            <button 
              onClick={simulateUsage}
              className="px-3 py-1 bg-purple-500 rounded text-sm"
            >
              Simulate Usage
            </button>
          </div>
          <p className="text-xs">Usage Count: {usageCount}/3</p>
          <p className="text-xs mt-1">Press Ctrl+Shift+D to toggle</p>
        </div>
      )}

      <p className="text-xs sm:text-sm mt-10 opacity-70 tracking-wider animate-pulse text-center">
        🚀 Powered by Web Rushikesh Mishra
      </p>
    </div>
  );
}

export default App;
