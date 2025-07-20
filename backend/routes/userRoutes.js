const express = require('express');
const router = express.Router();
const db = require('../models');
const { authenticate } = require('../middleware/auth');

// Ambil profil user yang login
router.get('/', authenticate, async (req, res) => {
    try {
        const user = await db.User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'phone', 'createdAt'] // hapus role
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user', error });
    }
});

// Update profil user
router.put('/', authenticate, async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        const user = await db.User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;

        await user.save();

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile', error });
    }
});

module.exports = router;
