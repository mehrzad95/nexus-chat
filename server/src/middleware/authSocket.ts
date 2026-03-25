import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthPayload, ServerToClientEvents, ClientToServerEvents, SocketData } from '../types';

type AuthSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export const authSocketMiddleware = (
  socket: AuthSocket,

  next: (err?: Error) => void,
): void => {
  const token =
    socket.handshake.auth?.token as string | undefined ??
    (socket.handshake.headers.authorization?.split(' ')[1]);

  if (!token) {
    return next(new Error('AUTH_REQUIRED'));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
    socket.data.user = {
      id: payload.userId,
      username: payload.username,
    };
    next();
  } catch {
    next(new Error('AUTH_INVALID'));
  }
};