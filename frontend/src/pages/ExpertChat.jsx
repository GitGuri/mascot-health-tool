import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'https://mascot-backend.onrender.com';

const ExpertChat = () => {
  const [userId] = useState(`student_${Date.now()}`);
  const [roomId] = useState(`room_${Date.now()}`);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [expertJoined, setExpertJoined] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(API_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      // Announce this user as needing help
      socketRef.current.emit('authenticate', { userId, role: 'student' });
      socketRef.current.emit('request-conversation', {
        roomId,
        studentId: userId,
        topic: 'Health question'
      });
    });

    socketRef.current.on('disconnect', () => setConnected(false));

    socketRef.current.on('conversation-accepted', () => {
      setExpertJoined(true);
      setMessages(prev => [...prev, {
        id: 'system-joined',
        system: true,
        content: 'An expert has joined the chat.',
        timestamp: new Date().toISOString()
      }]);
    });

    socketRef.current.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.on('message-history', (history) => {
      setMessages(history);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: userId,
      senderRole: 'student',
      content: input,
      timestamp: new Date().toISOString()
    };

    socketRef.current.emit('send-message', {
      roomId,
      message: input,
      senderId: userId,
      senderRole: 'student'
    });

    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 32px rgba(4,52,44,0.10)',
        display: 'flex',
        flexDirection: 'column',
        height: '88vh',
        maxHeight: '700px',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: '#04342C',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px'
          }}>💬</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Health Expert Chat</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: connected ? (expertJoined ? '#4ade80' : '#fbbf24') : '#f87171',
                display: 'inline-block'
              }} />
              {connected ? (expertJoined ? 'Expert is with you' : 'Waiting for an expert…') : 'Connecting…'}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {messages.length === 0 && (
            <div style={{
              margin: 'auto',
              textAlign: 'center',
              color: '#aaa',
              fontSize: '14px',
              lineHeight: 1.7
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>👋</div>
              <strong style={{ color: '#555', display: 'block', marginBottom: '4px' }}>Ask a health question</strong>
              Type your message below and an expert will respond shortly.
            </div>
          )}

          {messages.map((msg, idx) => {
            if (msg.system) return (
              <div key={idx} style={{ textAlign: 'center' }}>
                <span style={{
                  fontSize: '11px', color: '#888',
                  background: '#f0f0ec', borderRadius: '20px',
                  padding: '4px 12px', display: 'inline-block'
                }}>{msg.content}</span>
              </div>
            );

            const isMe = msg.senderRole === 'student' || msg.sender === userId;
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '72%',
                  background: isMe ? '#04342C' : '#f0f0ec',
                  color: isMe ? '#fff' : '#222',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '10px 14px',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  <div>{msg.content}</div>
                  <div style={{ fontSize: '10px', opacity: 0.55, marginTop: '4px', textAlign: 'right' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #eee',
          background: '#fff',
          display: 'flex',
          gap: '8px'
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message…"
            style={{
              flex: 1,
              border: '1.5px solid #e0e0e0',
              borderRadius: '24px',
              padding: '10px 16px',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#04342C'}
            onBlur={e => e.target.style.borderColor = '#e0e0e0'}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{
              background: input.trim() ? '#04342C' : '#ddd',
              color: input.trim() ? '#fff' : '#aaa',
              border: 'none',
              borderRadius: '24px',
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: input.trim() ? 'pointer' : 'default',
              transition: 'background 0.2s',
              fontFamily: 'inherit'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpertChat;