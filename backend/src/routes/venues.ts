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
    const city = req.query.city as string;
    let query = 'SELECT * FROM venues';
    const params: any[] = [];
    if (city) { query += ' WHERE city = ?'; params.push(city); }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const venues = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM venues').get() as any;
    res.json({ success: true, data: { items: venues, pagination: { page, limit, total: total.count } } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(req.params.id);
    if (!venue) return res.status(404).json({ error: '场馆不存在' });
    res.json({ success: true, data: venue });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { name, address, city, country, lat, lng, type } = req.body;
    if (!name) return res.status(400).json({ error: '场馆名称为必填项' });
    const db = getDB();
    const id = generateId();
    db.prepare('INSERT INTO venues (id, name, address, city, country, lat, lng, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, name, address || null, city || null, country || null, lat || null, lng || null, type || null);
    const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(id);
    res.status(201).json({ success: true, message: '创建成功', data: venue });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/checkin', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { note, visit_date, diary_id } = req.body;
    const db = getDB();
    const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(req.params.id);
    if (!venue) return res.status(404).json({ error: '场馆不存在' });
    const id = generateId();
    db.prepare('INSERT INTO checkins (id, user_id, venue_id, diary_id, visit_date, note) VALUES (?, ?, ?, ?, ?, ?)').run(id, req.user!.id, req.params.id, diary_id || null, visit_date || new Date().toISOString().split('T')[0], note || '');
    const checkin = db.prepare(`SELECT c.*, v.name as venue_name, v.city as venue_city FROM checkins c LEFT JOIN venues v ON c.venue_id = v.id WHERE c.id = ?`).get(id);
    res.status(201).json({ success: true, message: '打卡成功', data: checkin });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/checkins/me', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const checkins = db.prepare(`SELECT c.*, v.name as venue_name, v.address as venue_address, v.city as venue_city, v.lat, v.lng FROM checkins c LEFT JOIN venues v ON c.venue_id = v.id WHERE c.user_id = ? ORDER BY c.visit_date DESC`).all(req.user!.id);
    res.json({ success: true, data: checkins });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats/me', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const totalCheckins = db.prepare('SELECT COUNT(*) as count FROM checkins WHERE user_id = ?').get(req.user!.id) as any;
    const totalVenues = db.prepare('SELECT COUNT(DISTINCT venue_id) as count FROM checkins WHERE user_id = ?').get(req.user!.id) as any;
    const cityStats = db.prepare(`SELECT v.city, COUNT(*) as count FROM checkins c LEFT JOIN venues v ON c.venue_id = v.id WHERE c.user_id = ? AND v.city IS NOT NULL GROUP BY v.city ORDER BY count DESC LIMIT 10`).all(req.user!.id);
    res.json({ success: true, data: { total_checkins: totalCheckins.count, total_venues: totalVenues.count, city_stats: cityStats } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
