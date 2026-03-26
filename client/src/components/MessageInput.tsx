import { useState, type KeyboardEvent } from 'react';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import styles from './MessageInput.module.css';

interface Props {
    onSend: (content: string) => Promise<void>;
    onTypingStart: () => void;
    onTypingStop: () => void;
    disabled?: boolean;
}

export const MessageInput = ({ onSend, onTypingStart, onTypingStop, disabled }: Props) => {
    const [value, setValue] = useState('');
    const [sending, setSending] = useState(false);

    const { onKeyStroke, reset } = useTypingIndicator({
        onTypingStart,
        onTypingStop,
    });

    const handleSend = async () => {
        const content = value.trim();
        if (!content || sending) return;

        setSending(true);
        reset();

        try {
            await onSend(content);
            setValue('');
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.wrapper}>
            <textarea
                className={styles.input}
                value={value}
                onChange={(e) => { setValue(e.target.value); onKeyStroke(); }}
                onKeyDown={handleKeyDown}
                placeholder="Send a message… (Enter to send, Shift+Enter for new line)"
                rows={1}
                disabled={disabled || sending}
            />
            <button
                className={styles.send}
                onClick={handleSend}
                disabled={!value.trim() || sending || disabled}
                aria-label="Send message"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="currentColor" />
                </svg>
            </button>
        </div>
    );
};