import { connectDeriv } from "./services/deriv.connect";

const express = require('express');
const authRoutes = require('./routes/auth.routes');
const botRoutes = require('./routes/bot.routes');
const userRoutes = require('./routes/user.routes');
const { authenticateToken } = require('./middleware/auth.middleware');

const app = express();

connectDeriv();

// Middleware
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bot', botRoutes); // ← REMOVED authenticateToken from here
app.use('/api/v1/user', authenticateToken, userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Bot routes: NO authentication required');
  console.log('User routes: Authentication required');
});