import { useState, type FormEvent } from 'react';
import styles from './LoginForm.module.css';
import { useAuth } from '../context/useAuth';

export const LoginForm = () => {
    const { login, register } = useAuth();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === 'login') {
                await login(username, password);
            } else {
                await register(username, password);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>N</div>
                    <h1 className={styles.title}>Nexus Chat</h1>
                    <p className={styles.subtitle}>Real-time. Scalable. Open.</p>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${mode === 'login' ? styles.activeTab : ''}`}
                        onClick={() => setMode('login')}
                        type="button"
                    >
                        Sign in
                    </button>
                    <button
                        className={`${styles.tab} ${mode === 'register' ? styles.activeTab : ''}`}
                        onClick={() => setMode('register')}
                        type="button"
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="username">Username</label>
                        <input
                            id="username"
                            className={styles.input}
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="your_username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="password">Password</label>
                        <input
                            id="password"
                            className={styles.input}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            required
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button className={styles.submit} type="submit" disabled={loading}>
                        {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
                    </button>
                </form>
            </div>
        </div>
    );
};