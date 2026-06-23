// ============================================================
// KAFE NLAGJE - Backend API Server
// Powered by PRO IT | prs-ks.com
// ============================================================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const stockRoutes = require('./routes/stock.routes');
const orderRoutes = require('./routes/order.routes');
const reportRoutes = require('./routes/report.routes');
const userRoutes = require('./routes/user.routes');
const tableRoutes = require('./routes/table.routes');
const printerRoutes = require('./routes/printer.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// ---------------- SIGURIA & MIDDLEWARE BAZE ----------------
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : '*',
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting per mbrojtje nga brute-force ne login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuta
  max: 20,
  message: { gabim: 'Shume tentativa kycje. Provoni perseri pas 15 minutash.' },
});
app.use('/api/auth/login', loginLimiter);

// ---------------- RUTAT ----------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/printers', printerRoutes);

// Health check (per Hostinger / monitorim)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', biznesi: process.env.BIZNESI_EMRI || 'Kafe Nlagje', powered_by: 'PRO IT' });
});

app.get('/', (req, res) => {
  res.json({ mesazh: 'Kafe Nlagje API - Powered by PRO IT | prs-ks.com', dokumentacion: '/api/health' });
});

// ---------------- 404 ----------------
app.use((req, res) => {
  res.status(404).json({ gabim: 'Rruga e kerkuar nuk ekziston.' });
});

// ---------------- GABIM GLOBAL ----------------
app.use((err, req, res, next) => {
  console.error('Gabim i papritur:', err);
  res.status(500).json({ gabim: 'Gabim i papritur ne server.' });
});

app.listen(PORT, () => {
  console.log(`✅ Kafe Nlagje API po punon ne portin ${PORT}`);
  console.log(`   Powered by PRO IT | prs-ks.com`);
});
