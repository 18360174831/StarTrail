import { Router, Response } from 'express';
import { getDB } from '../db/init';
import { generateId } from '../utils/helpers';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const notifications = db.prepare(`SELECT n.*, u.nickname as from_user_name, u.avatar_url as from_user_avatar FROM notifications n LEFT JOIN users u ON n.from_user_id = u.id WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT ? OFFSET ?`).all(req.user!.id, limit, offset);
    const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user!.id) as any;
    res.json({ success: true, data: { items: notifications, unread_count: unreadCount.count } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/read', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
    res.json({ success: true, message: '已标记为已读' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/read-all', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user!.id);
    res.json({ success: true, message: '已全部标记为已读' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/unread-count', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const result = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user!.id) as any;
    res.json({ success: true, data: { count: result.count } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
