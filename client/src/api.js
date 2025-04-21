// src/api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5050' });

export const askQuestion = (question) => API.post('/api/ask', { question });
