import { useRef, useCallback } from 'react';

interface UseTypingIndicatorOptions {
    onTypingStart: () => void;
    onTypingStop: () => void;
    debounceMs?: number;
}

export const useTypingIndicator = ({
    onTypingStart,
    onTypingStop,
    debounceMs = 1500,
}: UseTypingIndicatorOptions) => {
    const isTypingRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onKeyStroke = useCallback(() => {
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            onTypingStart();
        }

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            isTypingRef.current = false;
            onTypingStop();
        }, debounceMs);
    }, [onTypingStart, onTypingStop, debounceMs]);

    const reset = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (isTypingRef.current) {
            isTypingRef.current = false;
            onTypingStop();
        }
    }, [onTypingStop]);

    return { onKeyStroke, reset };
};