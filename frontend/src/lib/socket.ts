import { getServerUrl } from "@/utils";
import { io, Socket } from "socket.io-client";

let socket: Socket;
let diagnosticsAttached = false;

type SocketConnectError = Error & {
  description?: unknown;
  context?: unknown;
  type?: string;
};

export const getSocket = () => {
  if (!socket) {
    const SERVER_URL = getServerUrl();
    if (!SERVER_URL) {
      throw new Error(
        "Backend URL is not configured. Set NEXT_PUBLIC_BACKEND_URL in your deployed frontend environment."
      );
    }

    socket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
    });

    if (!diagnosticsAttached) {
      diagnosticsAttached = true;

      socket.on("connect", () => {
        console.info("[socket] connected", {
          id: socket.id,
          url: SERVER_URL,
          transport: socket.io.engine.transport.name,
        });
      });

      socket.on("connect_error", (error: SocketConnectError) => {
        console.error("[socket] connect_error", {
          message: error.message,
          description: error.description,
          context: error.context,
          type: error.type,
          url: SERVER_URL,
        });
      });

      socket.on("disconnect", (reason) => {
        console.warn("[socket] disconnected", { reason });
      });
    }
  }

  return socket;
};
