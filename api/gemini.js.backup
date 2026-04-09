import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const { prompt, history = [], imageBase64, systemInstruction } = req.body;

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction || undefined
    });

    const parts = [{ text: prompt }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      });
    }

    // Build conversation history
    const contents = [];
    
    // Add system instruction if provided
    if (systemInstruction) {
      contents.push({
        role: 'user',
        parts: [{ text: systemInstruction }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'I understand my role and will follow these instructions.' }]
      });
    }

    // Add conversation history
    history.forEach(item => {
      contents.push(item);
    });

    // Add current user message
    contents.push({
      role: 'user',
      parts
    });

    const result = await model.generateContent({
      contents
    });

    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Failed to get response from Gemini' });
  }
}