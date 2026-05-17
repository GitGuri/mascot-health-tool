import express from 'express';

const router = express.Router();

router.post('/ask', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    // Simple response for testing
    const responses = {
      "hiv": "HIV can be prevented by using condoms consistently, taking PrEP medication, getting tested regularly, and avoiding sharing needles. Would you like more details about any of these methods?",
      "pregnancy": "Pregnancy can be prevented using various contraception methods including condoms, birth control pills, implants, IUDs, and emergency contraception. In Zimbabwe, these are available at clinics like CeSHHAR and local health centers.",
      "test": "You can get tested for HIV at any public health facility, CeSHHAR centers, or during community outreach programs. Testing is confidential and often free.",
      "default": `Thank you for your question about "${message}". The MASCOT Health Assistant provides information about HIV prevention and pregnancy prevention for university students in Zimbabwe. Please ask me about sexual health, HIV testing, contraception, or where to find health services.`
    };
    
    let response = responses.default;
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hiv')) response = responses.hiv;
    else if (lowerMessage.includes('pregn') || lowerMessage.includes('contracept')) response = responses.pregnancy;
    else if (lowerMessage.includes('test') || lowerMessage.includes('where')) response = responses.test;
    
    res.json({
      response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: "Chat route is working!" });
});

export default router;