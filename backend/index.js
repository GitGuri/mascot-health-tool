import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';
import clinicRoutes from './routes/clinics.js';
import resourceRoutes from './routes/resources.js';
import { setupExpertChat } from './socket/expertChat.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'https://*.onrender.com'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/resources', resourceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

setupExpertChat(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});