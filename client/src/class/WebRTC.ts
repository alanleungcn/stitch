import type { SignalingPayload } from './WebSocketServer';

type Signal = (to: string, payload: SignalingPayload) => void;

type OnTrack = (
  track: MediaStreamTrack,
  streams: ReadonlyArray<MediaStream>
) => void;

interface PeerConn extends RTCPeerConnection {
  dc?: RTCDataChannel;
}

interface Peer {
  to?: string;
  from?: string;
  sender?: RTCRtpSender;
  conn: PeerConn;
}

const config: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export class WebRTC {
  peers: Peer[];
  signal: Signal;
  onTrack: OnTrack;

  constructor(signal: Signal, onTrack: OnTrack) {
    this.peers = [];
    this.signal = signal;
    this.onTrack = onTrack;
  }

  replaceTrack(stream: MediaStream) {
    try {
      for (const track of stream.getTracks()) {
        this.peers.forEach((peer) => {
          if (peer.sender) peer.sender.replaceTrack(track);
          else peer.conn.addTrack(track);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  addTrack(stream: MediaStream) {
    const viewId: string[] = [];
    this.peers.forEach((p) => {
      p.conn.close();
      p.to && viewId.push(p.to);
    });
    this.peers = [];
    viewId.forEach((to) => {
      this.addPeer(to, stream);
    });
  }

  removePeer(socketId: string) {
    const idx = this.peers.findIndex((e) => e.to === socketId);
    this.peers[idx].conn.close();
    this.peers.splice(idx, 1);
  }

  addPeer(to: string, stream: MediaStream | null) {
    // const pc: PeerConn = new RTCPeerConnection(config);

    // pc.dc = pc.createDataChannel('channel');

    // pc.dc.onopen = () => console.log('DC OPEN');

    // pc.dc.onclose = () => console.log('DC CLOSE');

    // pc.onicecandidate = ({ candidate }) => {
    //   this.signal(to, { candidate });
    // };

    // pc.onnegotiationneeded = async () => {
    //   await pc.setLocalDescription(await pc.createOffer());
    //   this.signal(to, { description: pc.localDescription });
    // };

    // this.peers.push({ to, conn: pc });

    // if (stream) {
    //   const idx = this.peers.findIndex((e) => e.to === to);
    //   console.log(this.peers[idx]);
    //   try {
    //     for (const track of stream.getTracks()) {
    //       this.peers[idx].sender = pc.addTrack(track, stream);
    //     }
    //   } catch (err) {
    //     console.error(err);
    //   }
    // }
    const pc: PeerConn = new RTCPeerConnection(config);

    pc.dc = pc.createDataChannel('channel');

    this.peers.push({ to: to, conn: pc });

    pc.dc.onopen = () => console.log('DC OPEN');

    pc.dc.onclose = () => console.log('DC CLOSE');

    pc.onicecandidate = ({ candidate }) => this.signal(to, { candidate });

    pc.onnegotiationneeded = async () => {
      try {
        await pc.setLocalDescription();
        this.signal(to, { description: pc.localDescription });
      } catch (err) {
        console.error(err);
      }
    };

    if (stream) {
      const idx = this.peers.findIndex((e) => e.to === to);
      try {
        for (const track of stream.getTracks()) {
          this.peers[idx].sender = pc.addTrack(track, stream);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  async onSignalIn(from: string, { description, candidate }: SignalingPayload) {
    // // console.log('SIGNAL IN', from, description, candidate);

    // const peer = this.peers.find((p) => p.to === from);
    // let pc: PeerConn;

    // if (!peer) {
    //   // init peer for view
    //   pc = new RTCPeerConnection(config);

    //   this.peers.push({ from, conn: pc });

    //   pc.ondatachannel = (e) => {
    //     pc.dc = e.channel;

    //     pc.dc.onopen = () => console.log('DC OPEN');

    //     pc.dc.onclose = () => console.log('DC CLOSE');
    //   };

    //   pc.onicecandidate = ({ candidate }) => this.signal(from, { candidate });

    //   pc.ontrack = ({ track, streams }) => {
    //     this.onTrack(track, streams);
    //   };
    // } else {
    //   // use existing peer for host
    //   pc = peer.conn;
    // }

    // if (description) {
    //   await pc.setRemoteDescription(description);
    //   if (description.type == 'offer') {
    //     await pc.setLocalDescription(await pc.createAnswer());
    //     this.signal(from, { description: pc.localDescription });
    //   }
    // } else if (candidate) await pc.addIceCandidate(candidate);
    const peer = this.peers.find((p) => p.to === from);
    let pc: PeerConn;

    if (!peer) {
      // init peer for view
      pc = new RTCPeerConnection(config);

      this.peers.push({ from, conn: pc });

      pc.ondatachannel = (e) => {
        pc.dc = e.channel;

        pc.dc.onopen = () => {
          console.log('DC OPEN');
        };

        pc.dc.onclose = () => console.log('DC CLOSE');
      };

      pc.onicecandidate = ({ candidate }) => this.signal(from, { candidate });

      pc.ontrack = ({ track, streams }) => {
        this.onTrack(track, streams);
      };
    } else {
      // use existing peer for host
      pc = peer.conn;
    }

    try {
      if (description) {
        await pc.setRemoteDescription(description);
        if (description.type == 'offer') {
          await pc.setLocalDescription();
          this.signal(from, { description: pc.localDescription });
        }
      } else if (candidate) {
        await pc.addIceCandidate(candidate);
      }
    } catch (err) {
      console.error(err);
    }
  }
}
