import { useState, useCallback, useRef } from 'react';
import type { Message, TypingEvent, User } from '../types';

interface UseChatReturn {
    messages: Message[];
    members: User[];
    typingUsers: Map<string, string>;
    addMessage: (message: Message) => void;
    setHistory: (messages: Message[]) => void;
    addMember: (user: User) => void;
    removeMember: (user: User) => void;
    setMembers: (members: User[]) => void;
    handleTyping: (event: TypingEvent) => void;
    clearRoom: () => void;
}

export const useChat = (): UseChatReturn => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
    const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const addMessage = useCallback((message: Message) => {
        setMessages((prev) => [...prev, message]);
    }, []);

    const setHistory = useCallback((msgs: Message[]) => {
        setMessages(msgs);
    }, []);

    const addMember = useCallback((user: User) => {
        setMembers((prev) =>
            prev.find((m) => m.id === user.id) ? prev : [...prev, user],
        );
    }, []);

    const removeMember = useCallback((user: User) => {
        setMembers((prev) => prev.filter((m) => m.id !== user.id));
    }, []);

    const handleTyping = useCallback(({ userId, username, isTyping }: TypingEvent) => {
        setTypingUsers((prev) => {
            const next = new Map(prev);
            if (isTyping) {
                next.set(userId, username);
            } else {
                next.delete(userId);
            }
            return next;
        });

        // Auto-clear typing indicator after 3s (safety net)
        if (isTyping) {
            const existing = typingTimers.current.get(userId);
            if (existing) clearTimeout(existing);
            const timer = setTimeout(() => {
                setTypingUsers((prev) => {
                    const next = new Map(prev);
                    next.delete(userId);
                    return next;
                });
            }, 3000);
            typingTimers.current.set(userId, timer);
        }
    }, []);

    const clearRoom = useCallback(() => {
        setMessages([]);
        setMembers([]);
        setTypingUsers(new Map());
    }, []);

    return {
        messages,
        members,
        typingUsers,
        addMessage,
        setHistory,
        addMember,
        removeMember,
        setMembers,
        handleTyping,
        clearRoom,
    };
};