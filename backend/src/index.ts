import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Keep a reference to io to use it across the app
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Socket.io handlers
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

import { seedDatabase } from './utils/seed';
import { MongoMemoryServer } from 'mongodb-memory-server';

const PORT = process.env.PORT || 5000;

async function startServer() {
  let MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    const mongoServer = await MongoMemoryServer.create();
    MONGODB_URI = mongoServer.getUri();
    console.log('Using in-memory MongoDB:', MONGODB_URI);
  }

  mongoose.connect(MONGODB_URI).then(async () => {
    console.log('Connected to MongoDB');
    await seedDatabase();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch((err) => {
    console.error('MongoDB connection error:', err);
  });
}

startServer();
