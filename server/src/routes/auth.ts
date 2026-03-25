import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';

const router = Router();

// In-memory store — replace with a real DB in phase 2
const users = new Map<string, { id: string; username: string; password: string }>();

router.post('/register', (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (users.has(username)) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const user = { id: uuidv4(), username, password };
  users.set(username, user);

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    config.jwtSecret,
    { expiresIn: '7d' },
  );

  return res.status(201).json({ token, user: { id: user.id, username: user.username } });
});

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };

  const user = users.get(username ?? '');

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    config.jwtSecret,
    { expiresIn: '7d' },
  );

  return res.json({ token, user: { id: user.id, username: user.username } });
});

export default router;