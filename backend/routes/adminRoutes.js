const express = require('express');
const router = express.Router();
const db = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // nama unik
  }
});

const upload = multer({ storage });


// Tambah item
router.post('/items', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, stock, category_id } = req.body;
    const image_url = `/uploads/${req.file.filename}`;  // path gambar

    const newItem = await db.Item.create({ name, price, stock, category_id, image_url });
    res.json({ message: 'Produk berhasil ditambahkan', item: newItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan produk' });
  }
});

// Update item
router.patch('/items/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const item = await db.Item.findByPk(id);
        if (!item) return res.status(404).json({ message: 'Item tidak ditemukan' });

        await item.update(req.body);
        await item.reload();

        res.json({ message: 'Item berhasil diperbarui', item });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal memperbarui item' });
    }
});

// Hapus item
router.delete('/items/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.Item.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Item tidak ditemukan' });

    await item.destroy();
    res.json({ message: 'Item berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus item' });
  }
});

// Lihat semua item
router.get('/items', authenticate, isAdmin, async (req, res) => {
  try {
    const items = await db.Item.findAll({ include: [db.Category] });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data item' });
  }
});

// Tambah kategori
router.post('/categories', authenticate, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const category = await db.Category.create({ name });
    res.json({ message: 'Kategori berhasil ditambahkan', category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan kategori' });
  }
});

// Update kategori
router.patch('/categories/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await db.Category.findByPk(id);
    if (!category) return res.status(404).json({ message: 'Kategori tidak ditemukan' });

    await category.update(req.body);
    res.json({ message: 'Kategori berhasil diperbarui', category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui kategori' });
  }
});

// Hapus kategori
router.delete('/categories/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await db.Category.findByPk(id);
    if (!category) return res.status(404).json({ message: 'Kategori tidak ditemukan' });

    await category.destroy();
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus kategori' });
  }
});

// Lihat semua kategori
router.get('/categories', authenticate, isAdmin, async (req, res) => {
  try {
    const categories = await db.Category.findAll();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data kategori' });
  }
});

// Lihat semua user (admin tidak bisa edit password di sini)
router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'role', 'createdAt']
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data user' });
  }
});

// Opsional: Ubah role user (misalnya buat admin)
router.patch('/users/:id/role', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role tidak valid' });
    }
    const user = await db.User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    user.role = role;
    await user.save();
    res.json({ message: 'Role user berhasil diubah', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengubah role user' });
  }
});

module.exports = router;