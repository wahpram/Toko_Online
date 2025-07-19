const express = require('express');
const router = express.Router();
const db = require('../models');

router.get('/', async (req, res) => {
    try {
        const items = await db.Item.findAll({
            include: db.Category,
            order: [['id', 'ASC']]
        });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil data produk' });
    }
});

module.exports = router;