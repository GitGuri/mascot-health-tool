import { getSupabase } from '../supabaseClient.js';

const supabase = () => getSupabase();

const activeExperts = new Map();
const activeStudents = new Map();
const rooms = new Map();

export function setupExpertChat(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('authenticate', async (data) => {
      const { userId, role } = data;
      
      socket.userId = userId;
      socket.role = role;
      
      if (role === 'expert') {
        activeExperts.set(userId, socket.id);
        socket.join('expert-room');
        console.log(`Expert ${userId} connected`);
        
        await sendPendingConversations(socket, userId);
      } else if (role === 'student') {
        activeStudents.set(userId, socket.id);
        console.log(`Student ${userId} connected`);
      }
    });
    
    socket.on('start-conversation', async (data) => {
      const { studentId, topic, initialMessage } = data;
      
      const roomId = `room_${Date.now()}_${studentId}`;
      
      rooms.set(roomId, {
        id: roomId,
        studentId,
        expertId: null,
        topic,
        status: 'waiting',
        createdAt: new Date().toISOString(),
        messages: [{
          id: Date.now(),
          sender: studentId,
          senderRole: 'student',
          content: initialMessage,
          timestamp: new Date().toISOString()
        }]
      });
      
      const { error } = await supabase()
        .from('conversations')
        .insert({
          room_id: roomId,
          student_id: studentId,
          topic,
          status: 'waiting',
          messages: rooms.get(roomId).messages
        });
      
      if (error) console.error('Error saving conversation:', error);
      
      socket.join(roomId);
      
      io.to('expert-room').emit('new-conversation-request', {
        roomId,
        topic,
        studentId,
        timestamp: new Date().toISOString()
      });
      
      socket.emit('conversation-started', { roomId, status: 'waiting' });
    });
    
    socket.on('accept-conversation', async (data) => {
      const { roomId, expertId } = data;
      const room = rooms.get(roomId);
      
      if (room && room.status === 'waiting') {
        room.expertId = expertId;
        room.status = 'active';
        room.expertJoinedAt = new Date().toISOString();
        
        socket.join(roomId);
        
        await supabase()
          .from('conversations')
          .update({ 
            expert_id: expertId, 
            status: 'active',
            expert_joined_at: new Date().toISOString()
          })
          .eq('room_id', roomId);
        
        io.to(roomId).emit('conversation-accepted', {
          roomId,
          expertId,
          message: "An expert has joined the conversation"
        });
        
        io.to(roomId).emit('message-history', room.messages);
      }
    });
    
    socket.on('send-message', async (data) => {
      const { roomId, message, senderId, senderRole } = data;
      const room = rooms.get(roomId);
      
      if (room && room.status === 'active') {
        const newMessage = {
          id: Date.now(),
          sender: senderId,
          senderRole,
          content: message,
          timestamp: new Date().toISOString()
        };
        
        room.messages.push(newMessage);
        
        await supabase()
          .from('conversations')
          .update({ messages: room.messages })
          .eq('room_id', roomId);
        
        io.to(roomId).emit('new-message', newMessage);
      }
    });
    
    socket.on('typing', (data) => {
      const { roomId, isTyping, userName } = data;
      socket.to(roomId).emit('user-typing', { isTyping, userName });
    });
    
    socket.on('end-conversation', async (data) => {
      const { roomId } = data;
      const room = rooms.get(roomId);
      
      if (room) {
        room.status = 'closed';
        room.endedAt = new Date().toISOString();
        
        await supabase()
          .from('conversations')
          .update({ status: 'closed', ended_at: new Date().toISOString() })
          .eq('room_id', roomId);
        
        io.to(roomId).emit('conversation-ended', { message: "Conversation has ended" });
        rooms.delete(roomId);
      }
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      for (const [userId, socketId] of activeExperts) {
        if (socketId === socket.id) activeExperts.delete(userId);
      }
      for (const [userId, socketId] of activeStudents) {
        if (socketId === socket.id) activeStudents.delete(userId);
      }
    });
  });
}

async function sendPendingConversations(socket, expertId) {
  const { data, error } = await supabase()
    .from('conversations')
    .select('*')
    .eq('status', 'waiting')
    .order('created_at', { ascending: false });
  
  if (data && !error) {
    socket.emit('pending-conversations', data);
  }
}