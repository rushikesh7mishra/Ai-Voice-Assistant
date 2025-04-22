// src/api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'https://ai-voice-assistant-k3d9.onrender.com' });

export const askQuestion = (question) => API.post('/api/ask', { question });
