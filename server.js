import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Gemini API proxy
app.post('/api/gemini/live', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const ai = new GoogleGenerativeAI({ apiKey });
    const liveSession = ai.live.connect({
      model: req.body.model || 'gemini-3.1-flash-live-preview',
      config: req.body.config
    });

    // Handle WebSocket upgrade for live session
    // This is a simplified version - in production you'd handle WebSocket properly
    res.status(200).json({ sessionId: 'proxy-session', status: 'connected' });

  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Failed to connect to Gemini API' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API proxy server running on port ${PORT}`);
});