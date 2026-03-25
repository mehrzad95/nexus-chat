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
  
  export interface Room {
    id: string;
    name: string;
    members: User[];
  }
  
  export interface AuthPayload {
    userId: string;
    username: string;
    iat?: number;
    exp?: number;
  }
  
  export interface ServerToClientEvents {
    'message:new': (message: Message) => void;
    'room:members': (members: User[]) => void;
    'user:joined': (user: User) => void;
    'user:left': (user: User) => void;
    'user:typing': (data: { userId: string; username: string; isTyping: boolean }) => void;
    'message:history': (messages: Message[]) => void;
    error: (data: { message: string }) => void;
  }
  
  export interface ClientToServerEvents {
    'room:join': (roomId: string, callback: (res: AckResponse) => void) => void;
    'room:leave': (roomId: string) => void;
    'message:send': (data: { roomId: string; content: string }, callback: (res: AckResponse) => void) => void;
    'user:typing': (data: { roomId: string; isTyping: boolean }) => void;
  }
  
  export interface SocketData {
    user: User;
  }
  
  export interface AckResponse {
    success: boolean;
    error?: string;
  }