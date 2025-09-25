import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import cors from 'cors';
import connectDB from './config/db.js';
import dotenv from 'dotenv';


dotenv.config({
    path: './.env'
})
// require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Basic route
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// WebSocket for real-time streams (e.g., stock updates)
io.on('connection', (socketIo) => {
  console.log('Client connected');
  socketIo.on('disconnect', () => console.log('Client disconnected'));
  // Emit processed data from Python (integrate later)
});

// Start server
// const PORT = process.env.PORT || 5000;
// server.listen
connectDB()
.then(() => {
   app.listen(process.env.PORT|| 5000, () => {
          console.log(`server is running at  ${process.env.PORT}`);
   })
})
.catch((err) => {
    console.log("mongodb connection failed : !!",err)
})