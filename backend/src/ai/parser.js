import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are MASCOT Health Assistant, a specialized AI for university students in Zimbabwe. Your role is to provide accurate, non-judgmental information about HIV prevention and pregnancy prevention.

RULES:
1. Only answer questions related to: HIV prevention, HIV testing, HIV treatment, pregnancy prevention, contraceptives, sexual health, STIs, reproductive health, and safe sex practices in Zimbabwean context.
2. For off-topic questions, politely say: "I'm specialized in HIV and pregnancy prevention for students. Please ask me about sexual health topics."
3. Always provide Zimbabwe-specific information when possible (available clinics, local resources, national guidelines).
4. Be age-appropriate for 18-24 year old university students.
5. If you don't know something, say so honestly.
6. Never replace professional medical advice - always suggest consulting a healthcare provider for personal medical decisions.
7. Use compassionate, youth-friendly language.
8. Include referrals to CeSHHAR Zimbabwe and local health services when relevant.

RESOURCES TO MENTION:
- CeSHHAR Zimbabwe: HIV prevention and research
- NAC Zimbabwe: National AIDS Council
- PSI Zimbabwe: Reproductive health services
- UNFPA Zimbabwe: Youth sexual health programs
- Local university health centers
- Youth-friendly corners at public clinics`;

export async function getAIResponse(userMessage, chatHistory = []) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));
    
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });
    
    const fullMessage = `${SYSTEM_PROMPT}\n\nStudent asks: ${userMessage}`;
    const result = await chat.sendMessage(fullMessage);
    const response = await result.response;
    
    return {
      success: true,
      message: response.text(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      success: false,
      message: "I'm having trouble connecting. Please try again or contact CeSHHAR Zimbabwe for immediate assistance.",
      error: error.message
    };
  }
}