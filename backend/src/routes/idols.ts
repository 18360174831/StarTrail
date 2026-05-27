import { Router, Response } from 'express';
import { getDB } from '../db/init';
import { generateId } from '../utils/helpers';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const idols = db.prepare('SELECT * FROM idols WHERE user_id = ? ORDER BY created_at DESC').all(req.user!.id);
    res.json({ success: true, data: idols });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const idol = db.prepare('SELECT * FROM idols WHERE id = ?').get(req.params.id);
    if (!idol) return res.status(404).json({ error: '偶像不存在' });
    res.json({ success: true, data: idol });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { name, avatar_url, group_name, debut_date, bio } = req.body;
    if (!name) return res.status(400).json({ error: '偶像名称为必填项' });
    const db = getDB();
    const id = generateId();
    db.prepare('INSERT INTO idols (id, user_id, name, avatar_url, group_name, debut_date, bio) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, req.user!.id, name, avatar_url || null, group_name || null, debut_date || null, bio || '');
    const idol = db.prepare('SELECT * FROM idols WHERE id = ?').get(id);
    res.status(201).json({ success: true, message: '创建成功', data: idol });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const idol = db.prepare('SELECT * FROM idols WHERE id = ?').get(req.params.id) as any;
    if (!idol) return res.status(404).json({ error: '偶像不存在' });
    if (idol.user_id !== req.user!.id) return res.status(403).json({ error: '无权修改' });
    const { name, avatar_url, group_name, debut_date, bio } = req.body;
    db.prepare('UPDATE idols SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url), group_name = COALESCE(?, group_name), debut_date = COALESCE(?, debut_date), bio = COALESCE(?, bio) WHERE id = ?').run(name, avatar_url, group_name, debut_date, bio, req.params.id);
    const updated = db.prepare('SELECT * FROM idols WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: '更新成功', data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const idol = db.prepare('SELECT * FROM idols WHERE id = ?').get(req.params.id) as any;
    if (!idol) return res.status(404).json({ error: '偶像不存在' });
    if (idol.user_id !== req.user!.id) return res.status(403).json({ error: '无权删除' });
    db.prepare('DELETE FROM idols WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: '删除成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
