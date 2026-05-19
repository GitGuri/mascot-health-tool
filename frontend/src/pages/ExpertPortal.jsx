import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'https://mascot-backend.onrender.com';

const ExpertPortal = () => {
  const [expertId] = useState(`expert_${Date.now()}`);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeConversations, setActiveConversations] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(API_URL, {
      reconnection: true,
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      socketRef.current.emit('authenticate', { userId: expertId, role: 'expert' });
    });

    socketRef.current.on('disconnect', () => setConnected(false));

    socketRef.current.on('new-conversation-request', (request) => {
      setPendingRequests(prev => [...prev, { ...request, status: 'pending' }]);
    });

    socketRef.current.on('pending-conversations', (conversations) => {
      setPendingRequests(conversations);
    });

    socketRef.current.on('message-history', (history) => {
      setMessages(history);
    });

    socketRef.current.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [expertId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const acceptConversation = (roomId) => {
    socketRef.current.emit('accept-conversation', { roomId, expertId });
    
    // Move from pending to active
    const request = pendingRequests.find(r => r.roomId === roomId);
    setPendingRequests(prev => prev.filter(r => r.roomId !== roomId));
    setActiveConversations(prev => [...prev, { ...request, expertId, status: 'active' }]);
    setSelectedRoom(roomId);
  };

  const selectConversation = (roomId) => {
    setSelectedRoom(roomId);
    socketRef.current.emit('join-room', { roomId, expertId });
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedRoom) return;

    socketRef.current.emit('send-message', {
      roomId: selectedRoom,
      message: input,
      senderId: expertId,
      senderRole: 'expert'
    });

    setInput('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a2e',
      display: 'flex',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '300px',
        background: '#16213e',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #0f3460'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #0f3460' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Expert Portal</h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.7 }}>MASCOT Health Professional</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: connected ? '#4ade80' : '#f87171',
              display: 'inline-block'
            }} />
            <span style={{ fontSize: '11px' }}>{connected ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Pending Requests */}
        <div style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '12px' }}>
            Pending Requests ({pendingRequests.length})
          </h3>
          {pendingRequests.map(req => (
            <div key={req.roomId} style={{
              background: '#0f3460',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '8px',
              cursor: 'pointer'
            }} onClick={() => acceptConversation(req.roomId)}>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>Student #{req.studentId?.slice(-6)}</div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>Topic: {req.topic}</div>
              <button style={{
                marginTop: '8px',
                background: '#e94560',
                border: 'none',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}>Accept →</button>
            </div>
          ))}
        </div>

        {/* Active Conversations */}
        <div style={{ padding: '0 16px 16px' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '12px' }}>
            Active ({activeConversations.length})
          </h3>
          {activeConversations.map(conv => (
            <div key={conv.roomId} style={{
              background: selectedRoom === conv.roomId ? '#e94560' : '#0f3460',
              borderRadius: '8px',
              padding: '10px',
              marginBottom: '8px',
              cursor: 'pointer'
            }} onClick={() => selectConversation(conv.roomId)}>
              <div style={{ fontSize: '12px', fontWeight: 500 }}>Room: {conv.roomId?.slice(-8)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f5f0' }}>
        {!selectedRoom ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
              <p>Select a conversation to start helping a student</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{
              background: '#04342C',
              padding: '16px 24px',
              color: '#fff'
            }}>
              <div style={{ fontWeight: 600 }}>Conversation {selectedRoom?.slice(-8)}</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Student request</div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {messages.map((msg, idx) => {
                const isMe = msg.senderRole === 'expert';
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%',
                      background: isMe ? '#04342C' : '#fff',
                      color: isMe ? '#fff' : '#222',
                      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      padding: '10px 14px',
                      fontSize: '14px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
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
                placeholder="Type your response…"
                style={{
                  flex: 1,
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '24px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  outline: 'none'
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
                  cursor: input.trim() ? 'pointer' : 'default'
                }}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExpertPortal;