const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'tokoonlined3';

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token tidak valid' });

        req.user = user;
        next();
    });
}

function isAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Hanya bisa diakses admin!' });
    }
    next();
}

module.exports = { authenticate, isAdmin };
