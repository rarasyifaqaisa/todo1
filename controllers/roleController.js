const Role = require('../models/Role');

// Membuat role baru
exports.createRole = async (req, res) => {
  const { name } = req.body;

  try {
    const newRole = new Role({ name });
    await newRole.save();
    res.status(201).json({ message: 'Role created successfully', role: newRole });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
};

// Mengambil daftar semua role
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find({});
    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

module.exports = {
  createRole,
  getRoles,
};