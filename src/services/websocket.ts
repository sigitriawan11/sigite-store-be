import { Server as HttpServer } from "http";
import { IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";

interface WSMessage {
  type: string;
  ref_id: string;
  payload: any;
}

export class WSService {
  private static wss: WebSocketServer;
  private static initialized = false;

  



  static init(server: HttpServer) {
    if (this.initialized) return;
    this.initialized = true;

    this.wss = new WebSocketServer({ server, path: "/ws" });

    this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
      console.log(`[WS] Client connected from ${req.socket?.remoteAddress}`);

      
      
      ws.on("message", (raw: Buffer) => {
        try {
          const msg: WSMessage = JSON.parse(raw.toString());
          if (msg.type === "subscribe" && msg.ref_id) {
            
            (ws as any).subscribedRefId = msg.ref_id;
            console.log(`[WS] Client subscribed to ${msg.ref_id}`);
          }
        } catch {
          
        }
      });

      ws.on("close", () => {
        console.log("[WS] Client disconnected");
      });
    });

    console.log("[WS] WebSocket server initialized on /ws");
  }

  





  static broadcast(ref_id: string, data: { status: string; status_provider?: string | null; paid_at?: string | null }) {
    if (!this.wss) return;

    const message = JSON.stringify({ type: "update", ref_id, data });
    let sent = 0;

    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        const subscribed = (client as any).subscribedRefId;
        
        if (!subscribed || subscribed === ref_id) {
          client.send(message);
          sent++;
        }
      }
    });

    if (sent > 0) {
      console.log(`[WS] Broadcast to ${sent} clients for ${ref_id}`);
    }
  }
}