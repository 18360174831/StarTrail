import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowedTypes.includes(file.mimetype));
  },
});

router.post('/', authMiddleware, upload.single('file'), (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: '请选择文件' });
    res.json({ success: true, message: '上传成功', data: { url: `/uploads/${req.file.filename}`, filename: req.file.filename, size: req.file.size } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/batch', authMiddleware, upload.array('files', 9), (req: AuthRequest, res: Response) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) return res.status(400).json({ error: '请选择文件' });
    const files = (req.files as Express.Multer.File[]).map(file => ({ url: `/uploads/${file.filename}`, filename: file.filename, size: file.size }));
    res.json({ success: true, message: '上传成功', data: files });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
