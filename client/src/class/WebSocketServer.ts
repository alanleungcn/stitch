import { io, Socket } from 'socket.io-client';

export interface ServerToClientEvents {
  room_update: (room: Room, type: 'join' | 'leave') => void;
  room_delete: () => void;
  signal_in: (from: string, payload: SignalingPayload) => void;
}

export interface ClientToServerEvents {
  create_room: (roomId: string) => void;
  join_room: (roomId: string) => void;
  leave_room: () => void;
  signal_out: (to: string, payload: SignalingPayload) => void;
}

export interface Room {
  roomId: string;
  hostId: string;
  viewId: string[];
}

export interface SignalingPayload {
  candidate?: RTCIceCandidate | null;
  description?: RTCSessionDescription | null;
}

export class WebSocketServer {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  room: Room;

  constructor(
    wsURL: string,
    onRoomUpdate: (
      oldRoom: Room,
      newRoom: Room,
      type: 'join' | 'leave'
    ) => void,
    onRoomDelete: () => void,
    onSignalIn: (from: string, payload: SignalingPayload) => void
  ) {
    this.socket = io(wsURL, { transports: ['websocket'] });

    this.socket.on('connect_error', (err) => {
      console.error(err);
    });

    this.socket.on('room_update', (room, type) => {
      onRoomUpdate(this.room, room, type);
      this.room = room;
    });

    this.socket.on('room_delete', onRoomDelete);

    this.socket.on('signal_in', (from, payload) => {
      onSignalIn(from, payload);
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  createRoom(roomId: string): void {
    this.socket.emit('create_room', roomId);
  }

  joinRoom(roomId: string): void {
    this.socket.emit('join_room', roomId);
  }

  signal(to: string, payload: SignalingPayload): void {
    this.socket.emit('signal_out', to, payload);
  }
}
