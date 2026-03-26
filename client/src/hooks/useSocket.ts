import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { AckResponse, ConnectionStatus, Message, TypingEvent, User } from '../types';

interface UseSocketOptions {
    token: string;
    onMessage: (message: Message) => void;
    onHistory: (messages: Message[]) => void;
    onUserJoined: (user: User) => void;
    onUserLeft: (user: User) => void;
    onMembersUpdate: (members: User[]) => void;
    onTyping: (event: TypingEvent) => void;
}

interface UseSocketReturn {
    status: ConnectionStatus;
    joinRoom: (roomId: string) => Promise<AckResponse>;
    leaveRoom: (roomId: string) => void;
    sendMessage: (roomId: string, content: string) => Promise<AckResponse>;
    sendTyping: (roomId: string, isTyping: boolean) => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4000';

export const useSocket = ({
    token,
    onMessage,
    onHistory,
    onUserJoined,
    onUserLeft,
    onMembersUpdate,
    onTyping,
}: UseSocketOptions): UseSocketReturn => {
    const socketRef = useRef<Socket | null>(null);
    const [status, setStatus] = useState<ConnectionStatus>('connecting');

    useEffect(() => {
        const socket = io(SERVER_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => setStatus('connected'));
        socket.on('disconnect', () => setStatus('disconnected'));
        socket.on('connect_error', () => setStatus('error'));

        socket.on('message:new', onMessage);
        socket.on('message:history', onHistory);
        socket.on('user:joined', onUserJoined);
        socket.on('user:left', onUserLeft);
        socket.on('room:members', onMembersUpdate);
        socket.on('user:typing', onTyping);

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
        };
    }, [token]); // reconnects only when token changes

    const joinRoom = useCallback((roomId: string): Promise<AckResponse> => {
        return new Promise((resolve) => {
            socketRef.current?.emit('room:join', roomId, resolve);
        });
    }, []);

    const leaveRoom = useCallback((roomId: string): void => {
        socketRef.current?.emit('room:leave', roomId);
    }, []);

    const sendMessage = useCallback(
        (roomId: string, content: string): Promise<AckResponse> => {
            return new Promise((resolve) => {
                socketRef.current?.emit('message:send', { roomId, content }, resolve);
            });
        },
        [],
    );

    const sendTyping = useCallback((roomId: string, isTyping: boolean): void => {
        socketRef.current?.emit('user:typing', { roomId, isTyping });
    }, []);

    return { status, joinRoom, leaveRoom, sendMessage, sendTyping };
};