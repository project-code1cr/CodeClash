import axios from "axios";

const DEFAULT_BACKEND_URL = "http://localhost:3001";

export function getServerUrl() {
  const SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();

  if (!SERVER_URL || SERVER_URL === "undefined") {
    const isLocalHost =
      typeof window === "undefined" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isLocalHost) {
      return DEFAULT_BACKEND_URL;
    }

    return "";
  }

  return SERVER_URL.replace(/\/+$/, "");
}

export async function bootupBackend() {
  if (sessionStorage.getItem("backend_warmed")) return;

  try {
    const SERVER_URL = getServerUrl();
    if (!SERVER_URL) {
      console.error(
        "NEXT_PUBLIC_BACKEND_URL is missing in production. Configure your deployed frontend to point to the deployed backend."
      );
      return;
    }
    await axios.get(`${SERVER_URL}/health/ping`);
    sessionStorage.setItem("backend_warmed", "true");
  } catch {}
}
