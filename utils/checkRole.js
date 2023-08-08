const User = require('../models/User');
const Role = require('../models/Role');

// Middleware untuk memeriksa role superadmin
function checkSuperadminRole(req, res, next) {
    // Asumsikan role superadmin memiliki ID tertentu dalam database (misalnya role "superadmin" memiliki ID "12345")
    const superadminRoleId = '12345';
    if (req.userRole && req.userRole.toString() === superadminRoleId) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Superadmin role required.' });
    }
  }

// Middleware untuk memeriksa role admin (hanya boleh mengakses endpoint GET /api/todos)
function checkAdminRole(req, res, next) {
    // Asumsikan role admin memiliki ID tertentu dalam database (misalnya role "admin" memiliki ID "54321")
    const adminRoleId = '54321';
    if (req.userRole && req.userRole.toString() === adminRoleId) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
  }

  module.exports = {
    checkSuperadminRole,
    checkAdminRole,
};