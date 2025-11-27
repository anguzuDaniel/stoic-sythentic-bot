const jwt = require('jsonwebtoken');

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

exports.requirePaidUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if user has paid subscription
  // Adjust this logic based on your user structure
  const hasPaidSubscription = req.user.subscription_status === 'active' || 
                             req.user.subscription_status === 'premium';
  
  if (!hasPaidSubscription) {
    return res.status(403).json({ error: 'Paid subscription required' });
  }

  next();
};