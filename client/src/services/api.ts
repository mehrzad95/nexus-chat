import type { AuthResponse } from "../types";

const BASE_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4000';

const post = async <T>(path: string, body: unknown): Promise<T> => {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? `Request failed: ${res.status}`);
    }

    return data as T;
};

export const authApi = {
    login: (username: string, password: string) =>
        post<AuthResponse>('/api/auth/login', { username, password }),

    register: (username: string, password: string) =>
        post<AuthResponse>('/api/auth/register', { username, password }),
};