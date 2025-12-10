const AdminService = require('../services/adminService');

const adminService = new AdminService();

const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  const userEmail = req.user.email;
  
  if (!adminService.isAdmin(userEmail)) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }

  req.isAdmin = true;
  req.isSuperAdmin = adminService.isSuperAdmin(userEmail);
  next();
};

const requireSuperAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  const userEmail = req.user.email;
  
  if (!adminService.isSuperAdmin(userEmail)) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Super admin access required'
    });
  }

  req.isAdmin = true;
  req.isSuperAdmin = true;
  next();
};

module.exports = { requireAdmin, requireSuperAdmin, adminService };
