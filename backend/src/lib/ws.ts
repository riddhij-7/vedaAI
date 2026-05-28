import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import type { WSMessage } from '../types';

class WSManager {
  private wss: WebSocketServer | null = null;
  private subs = new Map<string, Set<WebSocket>>();

  init(server: import('http').Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.type === 'subscribe' && msg.assignmentId) {
            this.subscribe(msg.assignmentId, ws);
          }
        } catch {}
      });

      ws.on('close', () => this.unsubscribe(ws));
    });
  }

  subscribe(assignmentId: string, ws: WebSocket) {
    if (!this.subs.has(assignmentId)) this.subs.set(assignmentId, new Set());
    this.subs.get(assignmentId)!.add(ws);
  }

  unsubscribe(ws: WebSocket) {
    this.subs.forEach((sockets) => sockets.delete(ws));
  }

  broadcast(assignmentId: string, msg: WSMessage) {
    const sockets = this.subs.get(assignmentId);
    if (!sockets) return;
    const payload = JSON.stringify(msg);
    sockets.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(payload);
    });
  }
}

export const wsManager = new WSManager();
