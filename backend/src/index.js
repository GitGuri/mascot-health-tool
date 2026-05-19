import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import chatRoutes from './routes/chat.js';
import clinicRoutes from './routes/clinics.js';
import resourceRoutes from './routes/resources.js';
import { setupExpertChat } from './socket/expertChat.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'https://*.onrender.com'],
    credentials: true
  }
});

// CORS configuration for API endpoints
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'https://*.onrender.com'],
  credentials: true
}));
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MASCOT Health Tool API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      debug: '/api/debug',
      chat: '/api/chat/ask',
      clinics: '/api/clinics',
      resources: '/api/resources'
    }
  });
});

app.use('/api/chat', chatRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/resources', resourceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint to verify API is working
app.get('/api/debug', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend is running and reachable',
    clientUrl: process.env.CLIENT_URL,
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

setupExpertChat(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});