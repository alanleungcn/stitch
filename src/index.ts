// @ts-ignore
import { handler } from '../client/build/handler.js';
import { Room, ClientToServerEvents, ServerToClientEvents } from './index.d';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
// import { createServer as createHttpsServer } from 'https';
// import fs from 'fs';
// import path from 'path';
import { Server, Socket } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

const app = express();

app.use(cors());
app.use(bodyParser.json());

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

instrument(io, {
  auth: false,
});

let rooms = new Map<string, Room>();

function addRoom(roomId: string, socketId: string) {
  rooms.set(roomId, { hostId: socketId, viewId: [] });
}

function joinRoom(roomId: string, socketId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  rooms.set(roomId, { ...room, viewId: [...room.viewId, socketId] });
}

function emitUpdateRoom(roomId: string, type: 'join' | 'leave') {
  const room = rooms.get(roomId);
  if (!room) return;
  io.to(roomId).emit('room_update', room, type);
}

function disconnectHandler(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
) {
  const roomId = [...socket.rooms][1];
  const room = rooms.get(roomId);
  if (!room) return;
  socket.leave(roomId);
  if (room.hostId === socket.id) {
    io.to(roomId).emit('room_delete');
    rooms.delete(roomId);
  } else if (room.viewId.includes(socket.id)) {
    const idx = room.viewId.indexOf(socket.id);
    room.viewId.splice(idx, 1);
    rooms.set(roomId, room);
    emitUpdateRoom(roomId, 'leave');
  }
}

io.on('connection', (socket) => {
  socket.on('disconnecting', () => {
    disconnectHandler(socket);
  });

  socket.on('create_room', (roomId) => {
    socket.join(roomId);
    addRoom(roomId, socket.id);
    emitUpdateRoom(roomId, 'join');
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    joinRoom(roomId, socket.id);
    emitUpdateRoom(roomId, 'join');
  });

  socket.on('signal_out', (to, payload) => {
    io.to(to).emit('signal_in', socket.id, payload);
  });
});

app.post('/roomexist', (req, res) => {
  res.json({ exist: rooms.has(req.body.roomId) });
});

app.use(handler);

httpServer.listen(8000);
// httpsServer.listen(8000);

setInterval(() => {
  console.log(rooms);
}, 1000);
