import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/ask', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // System prompt for MASCOT Health Tool
    const systemPrompt = `You are MASCOT Health Assistant, an AI providing health information for university students in Zimbabwe.
You specialize in:
- HIV prevention and testing information
- Pregnancy prevention and contraception options available in Zimbabwe
- Sexual health education
- Directing users to health services in Zimbabwe (CeSHHAR, hospitals, clinics)

Always provide accurate, evidence-based information in a supportive and non-judgmental tone.
Keep responses concise and relevant to the user's question.
For sensitive topics, emphasize confidentiality and encourage seeking professional help from health centers.`;

    // Build conversation history for Gemini
    const conversationHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add current message
    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });

    // Send message with system prompt
    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`);
    const responseText = result.response.text();

    res.json({
      response: responseText,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ error: error.message || "Failed to get response from AI" });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: "Chat route is working!" });
});

export default router;