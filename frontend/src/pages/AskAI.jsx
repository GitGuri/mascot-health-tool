import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaUser, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'https://mascot-backend.onrender.com' || 'http://localhost:5000';

const AskAI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat/ask`, {
        message: input,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting. Please check your connection or try again later. You can also reach out to CeSHHAR Zimbabwe directly for support.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-[#04342C] text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <FaRobot className="text-xl" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">MASCOT Health Assistant</h1>
            <p className="text-xs text-white/70">AI-powered HIV & Pregnancy support</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-[#04342C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaRobot className="text-4xl text-[#04342C]/40" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ask me anything</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              I'm here to answer your questions about HIV prevention, pregnancy, sexual health, and more - all in a safe, confidential space.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {["How can I prevent HIV?", "What contraceptives are available in Zimbabwe?", "Where can I get tested?"].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion)}
                  className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:border-[#04342C] hover:text-[#04342C] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((message, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-[#04342C]' : 'bg-gray-300'
                }`}>
                  {message.role === 'user' ? (
                    <FaUser className="text-white text-sm" />
                  ) : (
                    <FaRobot className="text-gray-600 text-sm" />
                  )}
                </div>
                <div className={`rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-[#04342C] text-white'
                    : message.isError
                    ? 'bg-red-100 text-red-700'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <FaRobot className="text-gray-600 text-sm" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
                <FaSpinner className="animate-spin text-[#04342C] text-lg" />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about HIV or pregnancy prevention..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#04342C] resize-none"
            rows="1"
            style={{ maxHeight: '100px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              !input.trim() || isLoading
                ? 'bg-gray-200 text-gray-400'
                : 'bg-[#04342C] text-white'
            }`}
          >
            <FaPaperPlane />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Your conversations are confidential and not saved
        </p>
      </div>
    </div>
  );
};

export default AskAI;