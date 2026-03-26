export interface User {
  id: string;
  username: string;
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

export interface TypingEvent {
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AckResponse {
  success: boolean;
  error?: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export const ROOMS = [
  { id: 'general', name: 'General' },
  { id: 'engineering', name: 'Engineering' },
  { id: 'web3', name: 'Web3' },
] as const;

export type RoomId = typeof ROOMS[number]['id'];