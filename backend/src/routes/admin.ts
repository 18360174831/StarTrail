import { Router, Response } from 'express';
import { getDB } from '../db/init';
import { generateId } from '../utils/helpers';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Admin middleware - check if user is admin
function adminMiddleware(req: AuthRequest, res: Response, next: Function) {
  const db = getDB();
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user!.id) as any;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: '无权限访问，需要管理员权限' });
  }
  next();
}

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// ============ 用户管理 ============

// Get all users
router.get('/users', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const users = db.prepare(
      'SELECT id, username, nickname, avatar_url, role, status, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;

    res.json({
      success: true,
      data: {
        items: users,
        pagination: { page, limit, total: total.count },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user status (enable/disable)
router.put('/users/:id/status', (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ error: '状态值无效，只能是 active 或 disabled' });
    }

    const db = getDB();
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    db.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);

    res.json({ success: true, message: '用户状态已更新' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put('/users/:id/role', (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: '角色值无效，只能是 user 或 admin' });
    }

    const db = getDB();
    db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(role, req.params.id);

    res.json({ success: true, message: '用户角色已更新' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // Don't allow deleting yourself
    if (req.params.id === req.user!.id) {
      return res.status(400).json({ error: '不能删除自己的账号' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);

    res.json({ success: true, message: '用户已删除' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ 数据统计 ============

router.get('/stats', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();

    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const activeUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'").get() as any;
    const totalDiaries = db.prepare('SELECT COUNT(*) as count FROM diaries').get() as any;
    const totalVenues = db.prepare('SELECT COUNT(*) as count FROM venues').get() as any;
    const totalIdols = db.prepare('SELECT COUNT(*) as count FROM idols').get() as any;
    const totalComments = db.prepare('SELECT COUNT(*) as count FROM comments').get() as any;
    const totalLikes = db.prepare('SELECT COUNT(*) as count FROM likes').get() as any;

    // Recent registrations (last 7 days)
    const recentUsers = db.prepare(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-7 days')"
    ).get() as any;

    // Recent diaries (last 7 days)
    const recentDiaries = db.prepare(
      "SELECT COUNT(*) as count FROM diaries WHERE created_at >= datetime('now', '-7 days')"
    ).get() as any;

    res.json({
      success: true,
      data: {
        users: { total: totalUsers.count, active: activeUsers.count, recent: recentUsers.count },
        diaries: { total: totalDiaries.count, recent: recentDiaries.count },
        venues: totalVenues.count,
        idols: totalIdols.count,
        comments: totalComments.count,
        likes: totalLikes.count,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ 场馆管理 ============

// Get all venues (admin)
router.get('/venues', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const venues = db.prepare(
      'SELECT * FROM venues ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM venues').get() as any;

    res.json({
      success: true,
      data: {
        items: venues,
        pagination: { page, limit, total: total.count },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/venues', (req: AuthRequest, res: Response) => {
  try {
    const { name, address, city, country, lat, lng, type } = req.body;
    if (!name) return res.status(400).json({ error: '场馆名称为必填项' });

    const db = getDB();
    const id = generateId();
    db.prepare('INSERT INTO venues (id, name, address, city, country, lat, lng, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, address || null, city || null, country || null, lat || null, lng || null, type || null);

    const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(id);
    res.status(201).json({ success: true, message: '场馆创建成功', data: venue });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/venues/:id', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const venue = db.prepare('SELECT id FROM venues WHERE id = ?').get(req.params.id);
    if (!venue) return res.status(404).json({ error: '场馆不存在' });

    const { name, address, city, country, lat, lng, type } = req.body;
    db.prepare('UPDATE venues SET name = COALESCE(?, name), address = COALESCE(?, address), city = COALESCE(?, city), country = COALESCE(?, country), lat = COALESCE(?, lat), lng = COALESCE(?, lng), type = COALESCE(?, type) WHERE id = ?')
      .run(name, address, city, country, lat, lng, type, req.params.id);

    const updated = db.prepare('SELECT * FROM venues WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: '场馆更新成功', data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/venues/:id', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const venue = db.prepare('SELECT id FROM venues WHERE id = ?').get(req.params.id);
    if (!venue) return res.status(404).json({ error: '场馆不存在' });

    db.prepare('DELETE FROM venues WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: '场馆删除成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ 偶像管理 ============

// Get all idols (admin)
router.get('/idols', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const idols = db.prepare(
      'SELECT * FROM idols ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM idols').get() as any;

    res.json({
      success: true,
      data: {
        items: idols,
        pagination: { page, limit, total: total.count },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/idols', (req: AuthRequest, res: Response) => {
  try {
    const { name, avatar_url, group_name, debut_date, bio } = req.body;
    if (!name) return res.status(400).json({ error: '偶像名称为必填项' });

    const db = getDB();
    const id = generateId();
    db.prepare('INSERT INTO idols (id, user_id, name, avatar_url, group_name, debut_date, bio) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, req.user!.id, name, avatar_url || null, group_name || null, debut_date || null, bio || '');

    const idol = db.prepare('SELECT * FROM idols WHERE id = ?').get(id);
    res.status(201).json({ success: true, message: '偶像创建成功', data: idol });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/idols/:id', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const idol = db.prepare('SELECT id FROM idols WHERE id = ?').get(req.params.id);
    if (!idol) return res.status(404).json({ error: '偶像不存在' });

    const { name, avatar_url, group_name, debut_date, bio } = req.body;
    db.prepare('UPDATE idols SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url), group_name = COALESCE(?, group_name), debut_date = COALESCE(?, debut_date), bio = COALESCE(?, bio) WHERE id = ?')
      .run(name, avatar_url, group_name, debut_date, bio, req.params.id);

    const updated = db.prepare('SELECT * FROM idols WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: '偶像更新成功', data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/idols/:id', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const idol = db.prepare('SELECT id FROM idols WHERE id = ?').get(req.params.id);
    if (!idol) return res.status(404).json({ error: '偶像不存在' });

    db.prepare('DELETE FROM idols WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: '偶像删除成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ 内容管理 ============

// Get all diaries (admin)
router.get('/diaries', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const diaries = db.prepare(`
      SELECT d.*, u.nickname as author_name, u.username as author_username
      FROM diaries d
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM diaries').get() as any;

    res.json({
      success: true,
      data: {
        items: diaries,
        pagination: { page, limit, total: total.count },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete diary (admin)
router.delete('/diaries/:id', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const diary = db.prepare('SELECT id FROM diaries WHERE id = ?').get(req.params.id);
    if (!diary) return res.status(404).json({ error: '日记不存在' });

    db.prepare('DELETE FROM diaries WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: '日记删除成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all comments (admin)
router.get('/comments', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const comments = db.prepare(`
      SELECT c.*, u.nickname as author_name, d.title as diary_title
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN diaries d ON c.diary_id = d.id
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM comments').get() as any;

    res.json({
      success: true,
      data: {
        items: comments,
        pagination: { page, limit, total: total.count },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete comment (admin)
router.delete('/comments/:id', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const comment = db.prepare('SELECT id, diary_id FROM comments WHERE id = ?').get(req.params.id) as any;
    if (!comment) return res.status(404).json({ error: '评论不存在' });

    db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
    db.prepare('UPDATE diaries SET comment_count = MAX(0, comment_count - 1) WHERE id = ?').run(comment.diary_id);

    res.json({ success: true, message: '评论删除成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
