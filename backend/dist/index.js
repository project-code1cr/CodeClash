"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./lib/db"));
const controller_1 = __importDefault(require("./controller"));
const health_1 = __importDefault(require("./controller/health"));
const sockets_1 = require("./sockets");
dotenv_1.default.config();
const app = (0, express_1.default)();
const { PORT, MONGO_URI, FRONTEND_URL, NODE_ENV } = process.env;
const envOrigins = (FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const devOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
const allowedOrigins = new Set([
    ...envOrigins,
    ...(NODE_ENV === "production" ? [] : devOrigins),
]);
const isAllowedVercelPreviewOrigin = (origin) => {
    try {
        const parsed = new URL(origin);
        const hostname = parsed.hostname.toLowerCase();
        // Allow this project's Vercel preview/prod style domains to avoid
        // CORS breakage whenever preview suffix changes.
        return (parsed.protocol === "https:" &&
            hostname.endsWith(".vercel.app") &&
            hostname.startsWith("code-clash-"));
    }
    catch {
        return false;
    }
};
const corsOriginValidator = (origin, callback) => {
    if (!origin ||
        allowedOrigins.size === 0 ||
        allowedOrigins.has(origin) ||
        isAllowedVercelPreviewOrigin(origin)) {
        callback(null, true);
        return;
    }
    callback(new Error("Origin not allowed by CORS"));
};
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: corsOriginValidator,
    credentials: true,
}));
app.use("/api", controller_1.default);
app.use("/health", health_1.default);
app.get("/ping", (_, res) => {
    res.status(200).json({
        status: "ok",
        time: new Date().toISOString(),
    });
});
async function startServer() {
    await (0, db_1.default)(MONGO_URI);
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: corsOriginValidator,
            credentials: true,
        },
    });
    (0, sockets_1.setupRoomSockets)(io);
    server.listen(Number(PORT), () => console.log(`Server running on port ${PORT}`));
}
startServer().catch((error) => console.error(error));
//# sourceMappingURL=index.js.map