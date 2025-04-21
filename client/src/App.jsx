import { useState, useRef, useEffect } from 'react';
import { askQuestion } from './api'; // Assuming this is your API call
import './index.css';

function App() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Select voice based on availability
    const preferredVoices = voices.filter(voice =>
      voice.name.toLowerCase().includes('daniel') || voice.name.toLowerCase().includes('english')
    );
    utterance.voice = preferredVoices.length > 0 ? preferredVoices[0] : voices[0];
    
    utterance.pitch = 1.1;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  recognition.onstart = () => {
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
    clearTimeout(timeoutRef.current);
    const result = event.results[0][0].transcript;
    setTranscript(result);
    setStatus('');
    
    // Call backend AI for response
    const res = await askQuestion(result); // Call to your backend API
    setResponse(res.data.answer);
    speak(res.data.answer); // AI response spoken out loud
    setListening(false);
  };

  recognition.onerror = (event) => {
    clearTimeout(timeoutRef.current);
    setStatus(`⚠️ Error: ${event.error}`);
    setListening(false);
  };

  const handleListen = () => {
    setTranscript('');
    setResponse('');
    setStatus('');
    setListening(true);
    recognition.start();
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

        <button
          onClick={handleListen}
          disabled={listening}
          className={`px-6 sm:px-8 py-3 rounded-full text-base sm:text-lg font-semibold shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 ${
            listening
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
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
            <span className="text-blue-400">{response || '---'}</span>
          </p>
        </div>
      </div>

      <p className="text-xs sm:text-sm mt-10 opacity-70 tracking-wider animate-pulse text-center">
        🚀 Powered by Web Rushikesh Mishra
      </p>
    </div>
  );
}

export default App;
