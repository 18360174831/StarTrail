import { Router, Response } from 'express';
import { getDB } from '../db/init';
import { generateId } from '../utils/helpers';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Comments
router.get('/comments/:diaryId', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const comments = db.prepare(`SELECT c.*, u.nickname as author_name, u.avatar_url as author_avatar FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.diary_id = ? ORDER BY c.created_at ASC`).all(req.params.diaryId);
    res.json({ success: true, data: comments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/comments', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { diary_id, content, parent_id } = req.body;
    if (!diary_id || !content) return res.status(400).json({ error: '日记ID和内容为必填项' });
    const db = getDB();
    const diary = db.prepare('SELECT id FROM diaries WHERE id = ?').get(diary_id);
    if (!diary) return res.status(404).json({ error: '日记不存在' });
    const id = generateId();
    db.prepare('INSERT INTO comments (id, diary_id, user_id, content, parent_id) VALUES (?, ?, ?, ?, ?)').run(id, diary_id, req.user!.id, content, parent_id || null);
    db.prepare('UPDATE diaries SET comment_count = comment_count + 1 WHERE id = ?').run(diary_id);
    const comment = db.prepare(`SELECT c.*, u.nickname as author_name, u.avatar_url as author_avatar FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?`).get(id);
    res.status(201).json({ success: true, message: '评论成功', data: comment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/comments/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id) as any;
    if (!comment) return res.status(404).json({ error: '评论不存在' });
    if (comment.user_id !== req.user!.id) return res.status(403).json({ error: '无权删除' });
    db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
    db.prepare('UPDATE diaries SET comment_count = MAX(0, comment_count - 1) WHERE id = ?').run(comment.diary_id);
    res.json({ success: true, message: '删除成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Likes
router.post('/likes/:diaryId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const existing = db.prepare('SELECT id FROM likes WHERE diary_id = ? AND user_id = ?').get(req.params.diaryId, req.user!.id);
    if (existing) return res.status(400).json({ error: '已经点赞过了' });
    const id = generateId();
    db.prepare('INSERT INTO likes (id, diary_id, user_id) VALUES (?, ?, ?)').run(id, req.params.diaryId, req.user!.id);
    db.prepare('UPDATE diaries SET like_count = like_count + 1 WHERE id = ?').run(req.params.diaryId);
    res.status(201).json({ success: true, message: '点赞成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/likes/:diaryId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const result = db.prepare('DELETE FROM likes WHERE diary_id = ? AND user_id = ?').run(req.params.diaryId, req.user!.id);
    if (result.changes > 0) db.prepare('UPDATE diaries SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(req.params.diaryId);
    res.json({ success: true, message: '取消点赞成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/likes/:diaryId/check', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const existing = db.prepare('SELECT id FROM likes WHERE diary_id = ? AND user_id = ?').get(req.params.diaryId, req.user!.id);
    res.json({ success: true, data: { is_liked: !!existing } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Follows
router.post('/follow/:userId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    if (req.params.userId === req.user!.id) return res.status(400).json({ error: '不能关注自己' });
    const existing = db.prepare('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?').get(req.user!.id, req.params.userId);
    if (existing) return res.status(400).json({ error: '已经关注了' });
    db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.user!.id, req.params.userId);
    res.status(201).json({ success: true, message: '关注成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/follow/:userId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.user!.id, req.params.userId);
    res.json({ success: true, message: '取消关注成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/followers/:userId', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const followers = db.prepare(`SELECT u.id, u.username, u.nickname, u.avatar_url, u.bio, f.created_at as followed_at FROM follows f LEFT JOIN users u ON f.follower_id = u.id WHERE f.following_id = ? ORDER BY f.created_at DESC`).all(req.params.userId);
    res.json({ success: true, data: followers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/following/:userId', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const following = db.prepare(`SELECT u.id, u.username, u.nickname, u.avatar_url, u.bio, f.created_at as followed_at FROM follows f LEFT JOIN users u ON f.following_id = u.id WHERE f.follower_id = ? ORDER BY f.created_at DESC`).all(req.params.userId);
    res.json({ success: true, data: following });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/is-following/:userId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const existing = db.prepare('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?').get(req.user!.id, req.params.userId);
    res.json({ success: true, data: { is_following: !!existing } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/feed', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const diaries = db.prepare(`SELECT d.*, u.nickname as author_name, u.avatar_url as author_avatar, i.name as idol_name FROM diaries d LEFT JOIN users u ON d.user_id = u.id LEFT JOIN idols i ON d.idol_id = i.id WHERE d.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?) OR d.user_id = ? ORDER BY d.created_at DESC LIMIT ? OFFSET ?`).all(req.user!.id, req.user!.id, limit, offset);
    res.json({ success: true, data: diaries });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
