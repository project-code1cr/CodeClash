import axios from "axios";

const DEFAULT_BACKEND_URL = "http://localhost:3001";

export function getServerUrl() {
  const SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();

  if (!SERVER_URL || SERVER_URL === "undefined") {
    if (typeof window !== "undefined") {
      const isLocalHost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (!isLocalHost) {
        console.warn(
          "NEXT_PUBLIC_BACKEND_URL is missing. Falling back to localhost, which will fail for shared/deployed links."
        );
      }
    }

    return DEFAULT_BACKEND_URL;
  }

  return SERVER_URL.replace(/\/+$/, "");
}

export async function bootupBackend() {
  if (sessionStorage.getItem("backend_warmed")) return;

  try {
    const SERVER_URL = getServerUrl();
    await axios.get(`${SERVER_URL}/health/ping`);
    sessionStorage.setItem("backend_warmed", "true");
  } catch {}
}
