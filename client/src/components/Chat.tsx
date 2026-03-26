import { useState, useCallback } from 'react';
import { useAuth } from '../context/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useChat } from '../hooks/useChat';
import { MessageList } from '../components/MessageList';
import { MessageInput } from '../components/MessageInput';
import { UserList } from '../components/UserList';
import { ROOMS } from '../types';
import styles from './Chat.module.css';

export const Chat = () => {
    const { user, token, logout } = useAuth();
    const [activeRoom, setActiveRoom] = useState<string>(ROOMS[0].id);
    const [joiningRoom, setJoiningRoom] = useState<string | null>(null);

    const {
        messages, members, typingUsers,
        addMessage, setHistory, addMember,
        removeMember, setMembers, handleTyping, clearRoom,
    } = useChat();

    const { status, joinRoom, leaveRoom, sendMessage, sendTyping } = useSocket({
        token: token!,
        onMessage: addMessage,
        onHistory: setHistory,
        onUserJoined: addMember,
        onUserLeft: removeMember,
        onMembersUpdate: setMembers,
        onTyping: handleTyping,
    });

    const handleRoomSwitch = useCallback(async (roomId: string) => {
        if (roomId === activeRoom || joiningRoom) return;
        leaveRoom(activeRoom);
        clearRoom();
        setJoiningRoom(roomId);
        setActiveRoom(roomId);
        await joinRoom(roomId);
        setJoiningRoom(null);
    }, [activeRoom, joiningRoom, leaveRoom, clearRoom, joinRoom]);

    const handleSend = useCallback(async (content: string) => {
        const res = await sendMessage(activeRoom, content);
        if (!res.success) console.error('[Chat] Send failed:', res.error);
    }, [activeRoom, sendMessage]);

    if (!user) return null;

    const activeRoomName = ROOMS.find((r) => r.id === activeRoom)?.name ?? activeRoom;

    return (
        <div className={styles.shell}>
            <nav className={styles.sidebar}>
                <div className={styles.brand}>
                    <div className={styles.brandLogo}>N</div>
                    <span className={styles.brandName}>Nexus</span>
                </div>

                <div className={styles.section}>
                    <p className={styles.sectionLabel}>Rooms</p>
                    {ROOMS.map((room) => (
                        <button
                            key={room.id}
                            className={`${styles.roomBtn} ${activeRoom === room.id ? styles.activeRoom : ''}`}
                            onClick={() => handleRoomSwitch(room.id)}
                        >
                            <span className={styles.hash}>#</span>
                            {room.name}
                        </button>
                    ))}
                </div>

                <div className={styles.userBar}>
                    <div className={styles.userAvatar}>{user.username[0].toUpperCase()}</div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.username}</span>
                        <span className={`${styles.connStatus} ${styles[status]}`}>{status}</span>
                    </div>
                    <button className={styles.logoutBtn} onClick={logout} title="Sign out">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M5 2H2v10h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </nav>

            <main className={styles.main}>
                <header className={styles.topbar}>
                    <span className={styles.hash} style={{ fontSize: 18 }}>#</span>
                    <h2 className={styles.roomTitle}>{activeRoomName}</h2>
                    <span className={styles.memberCount}>{members.length} online</span>
                </header>

                <div className={styles.body}>
                    <MessageList
                        messages={messages}
                        currentUser={user}
                        typingUsers={typingUsers}
                    />
                    <MessageInput
                        onSend={handleSend}
                        onTypingStart={() => sendTyping(activeRoom, true)}
                        onTypingStop={() => sendTyping(activeRoom, false)}
                        disabled={status !== 'connected'}
                    />
                </div>
            </main>

            <UserList members={members} currentUser={user} />
        </div>
    );
};