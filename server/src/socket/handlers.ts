import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { redisService } from '../services/redis';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
  Message,
  AckResponse,
} from '../types';

type IoServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

const MAX_MESSAGE_LENGTH = 2000;

const emitRoomMembers = async (io: IoServer, roomId: string): Promise<void> => {
  const members = await redisService.getRoomMembers(roomId);
  io.to(roomId).emit('room:members', members);
};

export const registerSocketHandlers = (io: IoServer, socket: AppSocket): void => {
  const { user } = socket.data;
  console.log(`[Socket] Connected: ${user.username} (${socket.id})`);

  socket.on('room:join', async (roomId, callback) => {
    try {
      await socket.join(roomId);
      await redisService.setUserOnline(roomId, user.id, user.username);
      await redisService.subscribeToRoom(roomId, (message: Message) => {
        socket.to(roomId).emit('message:new', message);
      });

      const history = await redisService.getMessageHistory(roomId);
      socket.emit('message:history', history);

      io.to(roomId).emit('user:joined', user);
      await emitRoomMembers(io, roomId);

      const ack: AckResponse = { success: true };
      callback(ack);
    } catch (err) {
      console.error('[Socket] room:join error:', err);
      const ack: AckResponse = { success: false, error: 'Failed to join room' };
      callback(ack);
    }
  });

  socket.on('room:leave', async (roomId) => {
    await socket.leave(roomId);
    await redisService.removeUserFromRoom(roomId, user.id);
    await redisService.unsubscribeFromRoom(roomId);
    io.to(roomId).emit('user:left', user);
    await emitRoomMembers(io, roomId);
  });

  socket.on('message:send', async ({ roomId, content }, callback) => {
    if (!content?.trim()) {
      return callback({ success: false, error: 'Message cannot be empty' });
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      return callback({ success: false, error: `Max ${MAX_MESSAGE_LENGTH} characters` });
    }

    try {
      const message: Message = {
        id: uuidv4(),
        roomId,
        userId: user.id,
        username: user.username,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      await redisService.saveMessage(message);
      await redisService.publishMessage(roomId, message);

      socket.emit('message:new', message);
      callback({ success: true });
    } catch (err) {
      console.error('[Socket] message:send error:', err);
      callback({ success: false, error: 'Failed to send message' });
    }
  });

  socket.on('user:typing', ({ roomId, isTyping }) => {
    socket.to(roomId).emit('user:typing', {
      userId: user.id,
      username: user.username,
      isTyping,
    });
  });

  socket.on('disconnect', async (reason) => {
    console.log(`[Socket] Disconnected: ${user.username} — reason: ${reason}`);
    const rooms = Array.from(socket.rooms);

    await Promise.allSettled(
      rooms
        .filter((r) => r !== socket.id)
        .map(async (roomId) => {
          await redisService.removeUserFromRoom(roomId, user.id);
          io.to(roomId).emit('user:left', user);
          await emitRoomMembers(io, roomId);
        }),
    );
  });
};