const express = require('express');
const authRoutes = require('./routes/auth.routes');
const botRoutes = require('./routes/bot.routes');
const userRoutes = require('./routes/user.routes');
const { authenticateToken } = require('./middleware/auth.middleware');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bot', authenticateToken, botRoutes);
app.use('/api/v1/user', authenticateToken, userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});