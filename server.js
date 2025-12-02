require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');
const connectDB = require('./config/database');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

const isProduction = process.env.NODE_ENV === 'production';

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-dev',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'lax' : 'lax'
  }
};

if (process.env.MONGODB_URI) {
  try {
    sessionConfig.store = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 24 * 60 * 60,
      touchAfter: 24 * 3600
    });
  } catch (err) {
    console.error('MongoStore error:', err.message);
  }
}

app.use(session(sessionConfig));

app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('DB connection error:', error.message);
  }
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  res.locals.success = req.session?.success || null;
  res.locals.error = req.session?.error || null;
  if (req.session) {
    delete req.session.success;
    delete req.session.error;
  }
  next();
});

const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const setupRoutes = require('./routes/setup');
const superadminRoutes = require('./routes/superadmin');
const ceoRoutes = require('./routes/ceo');
const adminRoutes = require('./routes/admin');

app.get('/health', async (req, res) => {
  try {
    await connectDB();
    res.json({ status: 'ok', db: 'connected', env: process.env.NODE_ENV });
  } catch (err) {
    res.json({ status: 'error', db: err.message, env: process.env.NODE_ENV });
  }
});

app.use('/', publicRoutes);
app.use('/auth', authRoutes);
app.use('/setup', setupRoutes);
app.use('/superadmin', superadminRoutes);
app.use('/ceo', ceoRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('public/404', { title: '404 - Page Not Found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Server Error: ' + err.message);
});

if (!isProduction) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

