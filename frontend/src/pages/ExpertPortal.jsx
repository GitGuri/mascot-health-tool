import React, { useState, useEffect, useRef } from 'react';
import { FaUserMd, FaComments, FaSignOutAlt, FaReply, FaCheckCircle, FaClock, FaUser } from 'react-icons/fa';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'https://mascot-backend.onrender.com';

const ExpertPortal = () => {
  const [expertId] = useState(`expert_${Date.now()}`);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn) {
      connectSocket();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isLoggedIn]);

  const connectSocket = () => {
    socketRef.current = io(API_URL);
    
    socketRef.current.on('connect', () => {
      console.log('Expert connected');
      socketRef.current.emit('authenticate', { userId: expertId, role: 'expert' });
    });
    
    socketRef.current.on('new-conversation-request', (data) => {
      const newConv = {
        roomId: data.roomId,
        topic: data.topic,
        studentId: data.studentId,
        timestamp: data.timestamp,
        status: 'waiting',
        messages: []
      };
      setConversations(prev => [newConv, ...prev]);
    });
    
    socketRef.current.on('pending-conversations', (pending) => {
      const formatted = (pending || []).map(p => ({
        roomId: p.room_id,
        topic: p.topic,
        studentId: p.student_id,
        timestamp: p.created_at,
        status: p.status,
        messages: p.messages || []
      }));
      setConversations(formatted);
    });
    
    socketRef.current.on('message-history', (history) => {
      setMessages(history || []);
    });
    
    socketRef.current.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });
  };

  const acceptConversation = (roomId) => {
    socketRef.current.emit('accept-conversation', { roomId, expertId });
    setSelectedChat(roomId);
    setConversations(prev => prev.map(c => 
      c.roomId === roomId ? { ...c, status: 'active' } : c
    ));
  };

  const selectChat = (roomId) => {
    setSelectedChat(roomId);
    const conv = conversations.find(c => c.roomId === roomId);
    if (conv && conv.messages) {
      setMessages(conv.messages);
    } else {
      setMessages([]);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedChat) return;
    
    socketRef.current.emit('send-message', {
      roomId: selectedChat,
      message: input,
      senderId: expertId,
      senderRole: 'expert'
    });
    
    const newMessage = {
      id: Date.now(),
      sender: expertId,
      senderRole: 'expert',
      content: input,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      setIsLoggedIn(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#04342C] rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserMd className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Expert Portal</h1>
            <p className="text-gray-500 text-sm mt-2">Secure access for health professionals</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email address"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:border-[#04342C]"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-[#04342C]"
              required
            />
            <button
              type="submit"
              className="w-full bg-[#04342C] text-white py-3 rounded-lg font-medium"
            >
              Login to Dashboard
            </button>
          </form>
          
          <p className="text-xs text-gray-400 text-center mt-4">
            Demo credentials: any email/password works for testing
          </p>
        </div>
      </div>
    );
  }

  const waitingCount = conversations.filter(c => c.status === 'waiting').length;
  const activeCount = conversations.filter(c => c.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 bg-[#04342C] text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Expert Dashboard</h2>
              <p className="text-xs text-white/70">Health Professional</p>
            </div>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-white/70 hover:text-white"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-4 text-center">
            <div className="flex-1">
              <div className="text-2xl font-bold text-[#04342C]">{waitingCount}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-[#04342C]">{activeCount}</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
              <FaClock className="text-xs" /> Pending Requests
            </h3>
            {conversations.filter(c => c.status === 'waiting').length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No pending requests</p>
            ) : (
              conversations.filter(c => c.status === 'waiting').map(conv => (
                <div key={conv.roomId} className="bg-yellow-50 rounded-lg p-3 mb-2 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <FaUser className="text-xs text-gray-500" />
                    <p className="text-sm font-medium">Student #{conv.studentId?.slice(-6) || 'unknown'}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Topic: {conv.topic || 'Health question'}</p>
                  <button
                    onClick={() => acceptConversation(conv.roomId)}
                    className="mt-2 bg-[#04342C] text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 w-full justify-center"
                  >
                    <FaReply className="text-xs" /> Accept & Respond
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
              <FaComments className="text-xs" /> Active Chats
            </h3>
            {conversations.filter(c => c.status === 'active').length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No active chats</p>
            ) : (
              conversations.filter(c => c.status === 'active').map(conv => (
                <div
                  key={conv.roomId}
                  onClick={() => selectChat(conv.roomId)}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                    selectedChat === conv.roomId
                      ? 'bg-[#04342C]/10 border border-[#04342C]/20'
                      : 'hover:bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Student #{conv.studentId?.slice(-6) || 'unknown'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{conv.topic || 'General'}</p>
                    </div>
                    <FaCheckCircle className="text-green-500 text-xs" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800">Conversation</h3>
              <p className="text-xs text-gray-500 mt-1">
                Student #{conversations.find(c => c.roomId === selectedChat)?.studentId?.slice(-6) || 'unknown'}
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.senderRole === 'expert' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.senderRole === 'expert'
                      ? 'bg-[#04342C] text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your response..."
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#04342C]"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    !input.trim() ? 'bg-gray-200 text-gray-400' : 'bg-[#04342C] text-white'
                  }`}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">Select a conversation</h3>
              <p className="text-sm text-gray-400 mt-1">Choose an active chat to start responding</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertPortal;