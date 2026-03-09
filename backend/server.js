require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDb = require('./config/db');

const authRoutes = require('./routes/auth');
const gradesRoutes = require('./routes/grades');
const unitsRoutes = require('./routes/units');
const lessonsRoutes = require('./routes/lessons');
const progressRoutes = require('./routes/progress');
const groupsRoutes = require('./routes/groups');
const practiceRoutes = require('./routes/practice');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 4000;
const MAX_PORT_TRIES = 10;

function tryListen(port, resolve, reject) {
  const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${port}`);
    resolve(server);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      reject({ type: 'PORT_IN_USE', port });
    } else {
      reject(err);
    }
  });
}

async function startServer() {
  await connectDb();

  for (let attempt = 0; attempt < MAX_PORT_TRIES; attempt += 1) {
    const port = DEFAULT_PORT + attempt;
    // eslint-disable-next-line no-console
    console.log(`Trying to listen on port ${port}...`);

    // eslint-disable-next-line no-await-in-loop
    try {
      // eslint-disable-next-line no-async-promise-executor
      await new Promise((resolve, reject) => tryListen(port, resolve, reject));
      return;
    } catch (err) {
      if (err && err.type === 'PORT_IN_USE') {
        // eslint-disable-next-line no-console
        console.warn(`Port ${err.port} already in use, trying next port...`);
        continue;
      }

      // eslint-disable-next-line no-console
      console.error('Cannot start server', err);
      process.exit(1);
    }
  }

  // eslint-disable-next-line no-console
  console.error(`Could not find a free port in range ${DEFAULT_PORT}-${DEFAULT_PORT + MAX_PORT_TRIES - 1}`);
  process.exit(1);
}

startServer();
