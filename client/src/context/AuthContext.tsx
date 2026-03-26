import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../services/api';
import type { AuthResponse, User } from '../types';
import { AuthContext } from './authContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const applyAuth = useCallback((data: AuthResponse) => {
        setUser(data.user);
        setToken(data.token);
    }, []);

    const login = useCallback(async (username: string, password: string) => {
        const data = await authApi.login(username, password);
        applyAuth(data);
    }, [applyAuth]);

    const register = useCallback(async (username: string, password: string) => {
        const data = await authApi.register(username, password);
        applyAuth(data);
    }, [applyAuth]);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
    }, []);

    const value = useMemo(() => ({
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    }), [user, token, login, register, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
