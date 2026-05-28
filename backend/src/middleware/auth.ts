import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'startrail-secret-key';

export interface AuthRequest extends Request {
  user?: { id: string; username: string; role?: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授权，请先登录' });
  }
  try {
    const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET) as { id: string; username: string; role?: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token 无效或已过期' });
  }
}

export function generateToken(user: { id: string; username: string; role?: string }): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

// 可选认证：有 token 则解析，没有则放行（游客）
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // 游客，不设置 req.user
  }
  try {
    const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET) as { id: string; username: string; role?: string };
    req.user = decoded;
  } catch (error) {
    // token 无效也放行，当作游客
  }
  next();
}
