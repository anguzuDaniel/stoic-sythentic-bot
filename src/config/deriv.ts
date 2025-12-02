import WebSocket from "ws";

interface DerivConnectionOptions {
  apiToken: string;
  appId: string;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class DerivWebSocket {
  private ws: WebSocket | null = null;
  private options: DerivConnectionOptions;
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor(options: DerivConnectionOptions) {
    this.options = {
      reconnect: true,
      maxReconnectAttempts: 10,
      heartbeatInterval: 15000,
      ...options,
    };

    if (!options.apiToken) throw new Error("Deriv API token missing.");
    if (!options.appId) throw new Error("Deriv APP ID missing.");
  }

  connect() {
    const { appId } = this.options;

    this.ws = new WebSocket(`wss://ws.deriv.com/websockets/v3?app_id=${appId}`);

    this.ws.on("open", () => {
      console.log("🔗 Connected to Deriv WebSocket");

      // Authorize
      this.ws!.send(
        JSON.stringify({
          authorize: this.options.apiToken,
        })
      );

      // Reset reconnect attempts
      this.reconnectAttempts = 0;

      // Start heartbeat
      this.startHeartbeat();
    });

    this.ws.on("message", (msg) => {
      const data = JSON.parse(msg.toString());
      this.handleMessage(data);
    });

    this.ws.on("close", () => {
      console.log("⚠️ Connection closed.");

      // Stop heartbeat
      this.stopHeartbeat();

      if (this.options.reconnect) this.tryReconnect();
    });

    this.ws.on("error", (err) => {
      console.error("❌ WebSocket Error:", err);

      if (this.options.reconnect) this.tryReconnect();
    });
  }

  private tryReconnect() {
    const { maxReconnectAttempts } = this.options;

    if (this.reconnectAttempts >= maxReconnectAttempts!) {
      console.error("❌ Max reconnect attempts reached. Stopping.");
      return;
    }

    this.reconnectAttempts++;

    const delay = Math.min(5000 * this.reconnectAttempts, 20000);

    console.log(`🔄 Reconnecting in ${delay / 1000}s... (Attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat(); // clear previous heartbeat if any

    this.heartbeatTimer = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

      this.ws.ping(); // send heart beat
    }, this.options.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  private handleMessage(data: any) {
    if (data.msg_type === "ping") return;

    console.log("📩 Message:", data);
    // Add custom handlers here (authorize, ticks, proposals, open_positions, etc.)
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error("❌ Cannot send message. WebSocket is not open.");
    }
  }
}