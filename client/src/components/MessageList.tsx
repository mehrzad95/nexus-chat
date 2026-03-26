import { useEffect, useRef } from 'react';
import type { Message, User } from '../types';
import styles from './MessageList.module.css';

interface Props {
    messages: Message[];
    currentUser: User;
    typingUsers: Map<string, string>;
}

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const MessageList = ({ messages, currentUser, typingUsers }: Props) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUsers]);

    const typingList = Array.from(typingUsers.values());

    return (
        <div className={styles.list}>
            {messages.length === 0 && (
                <div className={styles.empty}>No messages yet. Say hello!</div>
            )}

            {messages.map((msg, i) => {
                const isOwn = msg.userId === currentUser.id;
                const showAvatar =
                    i === 0 || messages[i - 1].userId !== msg.userId;

                return (
                    <div
                        key={msg.id}
                        className={`${styles.row} ${isOwn ? styles.own : ''}`}
                    >
                        <div className={styles.avatarSlot}>
                            {showAvatar && !isOwn && (
                                <div className={styles.avatar}>
                                    {msg.username[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className={styles.bubble}>
                            {showAvatar && !isOwn && (
                                <span className={styles.username}>{msg.username}</span>
                            )}
                            <div className={`${styles.content} ${isOwn ? styles.ownContent : ''}`}>
                                <p className={styles.text}>{msg.content}</p>
                                <span className={styles.time}>{formatTime(msg.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                );
            })}

            {typingList.length > 0 && (
                <div className={styles.typing}>
                    <div className={styles.typingDots}>
                        <span /><span /><span />
                    </div>
                    <span className={styles.typingText}>
                        {typingList.length === 1
                            ? `${typingList[0]} is typing`
                            : `${typingList.slice(0, -1).join(', ')} and ${typingList.at(-1)} are typing`}
                    </span>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
};