import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDB } from './db/init';
import authRoutes from './routes/auth';
import diaryRoutes from './routes/diaries';
import idolRoutes from './routes/idols';
import venueRoutes from './routes/venues';
import countdownRoutes from './routes/countdowns';
import socialRoutes from './routes/social';
import notificationRoutes from './routes/notifications';
import uploadRoutes from './routes/upload';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

initDB();

app.use('/api/auth', authRoutes);
app.use('/api/diaries', diaryRoutes);
app.use('/api/idols', idolRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/countdowns', countdownRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 StarTrail Backend running on http://localhost:${PORT}`);
});

export default app;
