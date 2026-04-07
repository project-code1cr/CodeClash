import { getServerUrl } from "@/utils";
import { io, Socket } from "socket.io-client";

let socket: Socket;

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
  }

  return socket;
};
