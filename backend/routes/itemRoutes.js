const express = require('express');
const router = express.Router();
const db = require('../models');
const { getBestSellers } = require('../controller/itemsController');

router.get('/bestsellers', getBestSellers);

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

router.get('/:id', async (req, res) => {
    try {
        const item = await db.Item.findByPk(req.params.id, {
            include: [{ model: db.Category }]
        });
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;