import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDB } from '../db/init';
import { generateId } from '../utils/helpers';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, confirmPassword, nickname } = req.body;
    if (!username || !password || !nickname) return res.status(400).json({ error: '用户名、密码和昵称为必填项' });
    if (password !== confirmPassword) return res.status(400).json({ error: '两次密码不一致' });
    if (password.length < 6) return res.status(400).json({ error: '密码至少6位' });

    const db = getDB();
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) return res.status(400).json({ error: '用户名已存在' });

    const id = generateId();
    const passwordHash = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (id, username, password_hash, nickname) VALUES (?, ?, ?, ?)').run(id, username, passwordHash, nickname);

    const token = generateToken({ id, username });
    res.status(201).json({ success: true, message: '注册成功', data: { token, user: { id, username, nickname } } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: '用户名和密码为必填项' });

    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (!user) return res.status(401).json({ error: '用户名或密码错误' });

    if (user.status === 'disabled') return res.status(403).json({ error: '账号已被禁用，请联系管理员' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: '用户名或密码错误' });

    const token = generateToken({ id: user.id, username: user.username, role: user.role });
    res.json({ success: true, message: '登录成功', data: { token, user: { id: user.id, username: user.username, nickname: user.nickname, avatar_url: user.avatar_url, bio: user.bio, role: user.role } } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const user = db.prepare('SELECT id, username, nickname, avatar_url, bio, role, created_at FROM users WHERE id = ?').get(req.user!.id);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { nickname, avatar_url, bio } = req.body;
    const db = getDB();
    db.prepare('UPDATE users SET nickname = COALESCE(?, nickname), avatar_url = COALESCE(?, avatar_url), bio = COALESCE(?, bio), updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(nickname, avatar_url, bio, req.user!.id);
    const user = db.prepare('SELECT id, username, nickname, avatar_url, bio FROM users WHERE id = ?').get(req.user!.id);
    res.json({ success: true, message: '更新成功', data: user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
