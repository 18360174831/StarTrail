import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../startrail.db');
const db = new Database(DB_PATH);

// Check if admin exists
const existing = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();

if (existing) {
  console.log('✅ 管理员账号已存在，跳过创建');
  // Make sure role is admin
  db.prepare("UPDATE users SET role = 'admin' WHERE username = 'admin'").run();
  console.log('✅ 已确认 admin 角色');
} else {
  const id = uuidv4();
  const passwordHash = bcrypt.hashSync('admin123', 10);
  db.prepare(
    "INSERT INTO users (id, username, password_hash, nickname, role) VALUES (?, ?, ?, ?, ?)"
  ).run(id, 'admin', passwordHash, '管理员', 'admin');
  console.log('✅ 管理员账号创建成功');
}

// Print admin info
const admin = db.prepare("SELECT id, username, nickname, role FROM users WHERE username = 'admin'").get() as any;
console.log('\n管理员账号信息:');
console.log(`  用户名: ${admin.username}`);
console.log(`  密码: admin123`);
console.log(`  昵称: ${admin.nickname}`);
console.log(`  角色: ${admin.role}`);

db.close();
