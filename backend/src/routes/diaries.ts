import { Router, Response } from 'express';
import { getDB } from '../db/init';
import { generateId } from '../utils/helpers';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const idolId = req.query.idol_id as string;

    let query = `SELECT d.*, u.nickname as author_name, u.avatar_url as author_avatar, i.name as idol_name FROM diaries d LEFT JOIN users u ON d.user_id = u.id LEFT JOIN idols i ON d.idol_id = i.id WHERE d.visibility = 'public'`;
    const params: any[] = [];
    if (idolId) { query += ' AND d.idol_id = ?'; params.push(idolId); }
    query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const diaries = db.prepare(query).all(...params);
    const total = db.prepare("SELECT COUNT(*) as count FROM diaries WHERE visibility = 'public'").get() as any;
    res.json({ success: true, data: { items: diaries, pagination: { page, limit, total: total.count } } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const diary = db.prepare(`SELECT d.*, u.nickname as author_name, u.avatar_url as author_avatar, i.name as idol_name FROM diaries d LEFT JOIN users u ON d.user_id = u.id LEFT JOIN idols i ON d.idol_id = i.id WHERE d.id = ?`).get(req.params.id);
    if (!diary) return res.status(404).json({ error: '日记不存在' });
    res.json({ success: true, data: diary });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { title, content, idol_id, images, tags, visibility } = req.body;
    if (!title || !content) return res.status(400).json({ error: '标题和内容为必填项' });
    const db = getDB();
    const id = generateId();
    db.prepare(`INSERT INTO diaries (id, user_id, idol_id, title, content, images, tags, visibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(id, req.user!.id, idol_id || null, title, content, JSON.stringify(images || []), JSON.stringify(tags || []), visibility || 'public');
    const diary = db.prepare('SELECT * FROM diaries WHERE id = ?').get(id);
    res.status(201).json({ success: true, message: '创建成功', data: diary });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const diary = db.prepare('SELECT * FROM diaries WHERE id = ?').get(req.params.id) as any;
    if (!diary) return res.status(404).json({ error: '日记不存在' });
    if (diary.user_id !== req.user!.id) return res.status(403).json({ error: '无权修改' });
    const { title, content, idol_id, images, tags, visibility } = req.body;
    db.prepare(`UPDATE diaries SET title = COALESCE(?, title), content = COALESCE(?, content), idol_id = COALESCE(?, idol_id), images = COALESCE(?, images), tags = COALESCE(?, tags), visibility = COALESCE(?, visibility), updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(title, content, idol_id, images ? JSON.stringify(images) : null, tags ? JSON.stringify(tags) : null, visibility, req.params.id);
    const updated = db.prepare('SELECT * FROM diaries WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: '更新成功', data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const diary = db.prepare('SELECT * FROM diaries WHERE id = ?').get(req.params.id) as any;
    if (!diary) return res.status(404).json({ error: '日记不存在' });
    if (diary.user_id !== req.user!.id) return res.status(403).json({ error: '无权删除' });
    db.prepare('DELETE FROM diaries WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: '删除成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/user/me', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const diaries = db.prepare(`SELECT d.*, i.name as idol_name FROM diaries d LEFT JOIN idols i ON d.idol_id = i.id WHERE d.user_id = ? ORDER BY d.created_at DESC`).all(req.user!.id);
    res.json({ success: true, data: diaries });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/user/:userId', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const diaries = db.prepare(`SELECT d.*, i.name as idol_name FROM diaries d LEFT JOIN idols i ON d.idol_id = i.id WHERE d.user_id = ? AND d.visibility = 'public' ORDER BY d.created_at DESC`).all(req.params.userId);
    res.json({ success: true, data: diaries });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
