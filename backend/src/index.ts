import express, { Response } from "express";
import http from "http";
import { Server as SockerServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectToDB from "./lib/db";
import router from "./controller";
import healthRouter from "./controller/health";
import { setupRoomSockets } from "./sockets";

dotenv.config();

const app = express();
const { PORT, MONGO_URI, FRONTEND_URL, NODE_ENV } = process.env;

const envOrigins = (FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const devOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];

const allowedOrigins = new Set<string>([
  ...envOrigins,
  ...(NODE_ENV === "production" ? [] : devOrigins),
]);

const isAllowedVercelPreviewOrigin = (origin: string): boolean => {
  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname.toLowerCase();

    // Allow this project's Vercel preview/prod style domains to avoid
    // CORS breakage whenever preview suffix changes.
    return (
      parsed.protocol === "https:" &&
      hostname.endsWith(".vercel.app") &&
      hostname.startsWith("code-clash-")
    );
  } catch {
    return false;
  }
};

const corsOriginValidator = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (
    !origin ||
    allowedOrigins.size === 0 ||
    allowedOrigins.has(origin) ||
    isAllowedVercelPreviewOrigin(origin)
  ) {
    callback(null, true);
    return;
  }

  callback(new Error("Origin not allowed by CORS"));
};

app.use(express.json());
app.use(
  cors({
    origin: corsOriginValidator,
    credentials: true,
  })
);

app.use("/api", router);
app.use("/health", healthRouter);

app.get("/ping", (_, res: Response) => {
  res.status(200).json({
    status: "ok",
    time: new Date().toISOString(),
  });
});

async function startServer() {
  await connectToDB(MONGO_URI!);

  const server = http.createServer(app);

  const io = new SockerServer(server, {
    cors: {
      origin: corsOriginValidator,
      credentials: true,
    },
  });

  setupRoomSockets(io);

  server.listen(Number(PORT), () =>
    console.log(`Server running on port ${PORT}`)
  );
}

startServer().catch((error) => console.error(error));
