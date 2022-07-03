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
  hostId: string;
  viewId: string[];
}

export interface SignalingPayload {
  candidate?: RTCIceCandidateInit | RTCIceCandidate;
  description?: RTCSessionDescriptionInit;
}
