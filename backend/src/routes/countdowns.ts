import { Router, Response } from 'express';
import { getDB } from '../db/init';
import { generateId } from '../utils/helpers';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const countdowns = db.prepare('SELECT * FROM countdowns WHERE user_id = ? ORDER BY is_pinned DESC, target_date ASC').all(req.user!.id);
    res.json({ success: true, data: countdowns });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const countdown = db.prepare('SELECT * FROM countdowns WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id);
    if (!countdown) return res.status(404).json({ error: '倒数日不存在' });
    res.json({ success: true, data: countdown });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { title, target_date, icon, color, cover_image, is_pinned } = req.body;
    if (!title || !target_date) return res.status(400).json({ error: '标题和目标日期为必填项' });
    const db = getDB();
    const id = generateId();
    db.prepare('INSERT INTO countdowns (id, user_id, title, target_date, icon, color, cover_image, is_pinned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, req.user!.id, title, target_date, icon || null, color || null, cover_image || null, is_pinned ? 1 : 0);
    const countdown = db.prepare('SELECT * FROM countdowns WHERE id = ?').get(id);
    res.status(201).json({ success: true, message: '创建成功', data: countdown });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const countdown = db.prepare('SELECT * FROM countdowns WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id) as any;
    if (!countdown) return res.status(404).json({ error: '倒数日不存在' });
    const { title, target_date, icon, color, cover_image, is_pinned } = req.body;
    db.prepare('UPDATE countdowns SET title = COALESCE(?, title), target_date = COALESCE(?, target_date), icon = COALESCE(?, icon), color = COALESCE(?, color), cover_image = COALESCE(?, cover_image), is_pinned = COALESCE(?, is_pinned) WHERE id = ?').run(title, target_date, icon, color, cover_image, is_pinned !== undefined ? (is_pinned ? 1 : 0) : null, req.params.id);
    const updated = db.prepare('SELECT * FROM countdowns WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: '更新成功', data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const countdown = db.prepare('SELECT * FROM countdowns WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id) as any;
    if (!countdown) return res.status(404).json({ error: '倒数日不存在' });
    db.prepare('DELETE FROM countdowns WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: '删除成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/pin', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const countdown = db.prepare('SELECT * FROM countdowns WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id) as any;
    if (!countdown) return res.status(404).json({ error: '倒数日不存在' });
    db.prepare('UPDATE countdowns SET is_pinned = ? WHERE id = ?').run(countdown.is_pinned ? 0 : 1, req.params.id);
    const updated = db.prepare('SELECT * FROM countdowns WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: '更新成功', data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
