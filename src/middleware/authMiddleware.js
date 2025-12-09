const SupabaseAuthService = require('../services/supabaseAuth');

const authService = new SupabaseAuthService();

const authMiddleware = async (req, res, next) => {
  if (!authService.isEnabled()) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Access token is required'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = await authService.verifyToken(token);

    if (!user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication failed'
    });
  }
};

const optionalAuthMiddleware = async (req, res, next) => {
  if (!authService.isEnabled()) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = await authService.verifyToken(token);
    req.user = user || null;
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = { authMiddleware, optionalAuthMiddleware, authService };
