const express = require('express');
const router = express.Router();
const db = require('../models');

// Ambil semua kategori
router.get('/', async (req, res) => {
  try {
    const categories = await db.Category.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (err) {
    console.error('Gagal ambil kategori:', err);
    res.status(500).json({ error: 'Gagal mengambil data kategori' });
  }
});

module.exports = router;