import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config/env';
import { redisService } from './services/redis';
import { authSocketMiddleware } from './middleware/authSocket';
import { registerSocketHandlers } from './socket/handlers';
import authRouter from './routes/auth';

const bootstrap = async (): Promise<void> => {
    // ── Express ──────────────────────────────────────────────────────
    const app = express();
    app.use(cors({ origin: config.clientUrl, credentials: true }));
    app.use(express.json());

    app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
    app.use('/api/auth', authRouter);

    // ── HTTP + Socket.io ──────────────────────────────────────────────
    const httpServer = createServer(app);

    const io = new Server(httpServer, {
        cors: { origin: config.clientUrl, methods: ['GET', 'POST'], credentials: true },
        transports: ['websocket', 'polling'],
    });

    // ── Middleware ────────────────────────────────────────────────────
    io.use(authSocketMiddleware as any);

    // ── Socket handlers ───────────────────────────────────────────────
    io.on('connection', (socket) => registerSocketHandlers(io as any, socket as any));

    // ── Redis ─────────────────────────────────────────────────────────
    await redisService.connect();

    // ── Start ─────────────────────────────────────────────────────────
    httpServer.listen(config.port, () => {
        console.log(`[Server] Running on http://localhost:${config.port}`);
        console.log(`[Server] Accepting connections from ${config.clientUrl}`);
    });

    // ── Graceful shutdown ─────────────────────────────────────────────
    const shutdown = async (signal: string): Promise<void> => {
        console.log(`\n[Server] ${signal} received — shutting down gracefully`);
        await redisService.disconnect();
        httpServer.close(() => {
            console.log('[Server] HTTP server closed');
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};

bootstrap().catch((err) => {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
});