const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'tokoonlined3';

router.post('/register', async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        const existing = await db.User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ message: 'Email sudah terdaftar' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await db.User.create({ name, email, password: hashedPassword, phone });
        return res.status(201).json({ message: 'User berhasil didaftarkan', user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Gagal mendaftar' });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'User tidak ditemukan' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ message: 'Password salah' });

        // Sertakan role di token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.json({ message: 'Login sukses', token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Gagal login' });
    }
});

module.exports = router;