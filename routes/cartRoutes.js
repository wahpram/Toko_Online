const express = require('express');
const router = express.Router();
const db = require('../models');
const { authenticate } = require('../middleware/auth');
const midtransClient = require('midtrans-client');
require('dotenv').config();

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// Tambah item ke cart
router.post('/', authenticate, async (req, res) => {
    const { item_id, qty } = req.body;
    try {
        const item = await db.Item.findByPk(item_id);
        if (!item) return res.status(404).json({ error: 'Item tidak ditemukan' });
        if (item.stock < qty) return res.status(400).json({ error: 'Stok tidak cukup' });

        // Cari apakah item sudah ada di cart user
        const existing = await db.Cart.findOne({ where: { user_id: req.user.id, item_id } });
        if (existing) {
            existing.qty += qty;
            await existing.save();
        } else {
            await db.Cart.create({ user_id: req.user.id, item_id, qty });
        }

        res.json({ message: 'Item berhasil ditambahkan ke cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal menambahkan ke cart' });
    }
});

// Lihat isi cart + total
router.get('/', authenticate, async (req, res) => {
    try {
        const cartItems = await db.Cart.findAll({
            where: { user_id: req.user.id },
            include: [{ model: db.Item }]
        });

        const total = cartItems.reduce((sum, c) => sum + (c.Item.price * c.qty), 0);

        res.json({ cartItems, total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mengambil cart' });
    }
});

// Update qty item di cart
router.patch('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { qty } = req.body;

    try {
        const cartItem = await db.Cart.findOne({ where: { id, user_id: req.user.id } });
        if (!cartItem) return res.status(404).json({ error: 'Item cart tidak ditemukan' });

        if (qty <= 0) {
            await cartItem.destroy();
            return res.json({ message: 'Item dihapus dari cart' });
        }

        const item = await db.Item.findByPk(cartItem.item_id);
        if (!item || item.stock < qty) {
            return res.status(400).json({ error: 'Stok tidak mencukupi' });
        }

        cartItem.qty = qty;
        await cartItem.save();

        res.json({ message: 'Qty item berhasil diperbarui', cartItem });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal memperbarui cart' });
    }
});

// Hapus item dari cart
router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        const cartItem = await db.Cart.findOne({ where: { id, user_id: req.user.id } });
        if (!cartItem) return res.status(404).json({ error: 'Item cart tidak ditemukan' });

        await cartItem.destroy();
        res.json({ message: 'Item berhasil dihapus dari cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal menghapus cart' });
    }
});

// Checkout: buat Sale + SaleDetail dari cart, kosongkan cart
router.post('/checkout', authenticate, async (req, res) => {
  try {
    // Ambil data cart user beserta detail item
    const cartItems = await db.Cart.findAll({
      where: { user_id: req.user.id },
      include: [db.Item]
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Keranjang kosong.' });
    }

    // Validasi stok dan hitung total
    let total = 0;
    const detailData = [];
    for (const cart of cartItems) {
      const item = cart.Item;
      if (!item) continue;

      if (item.stock < cart.qty) {
        return res.status(400).json({
          error: `Stok "${item.name}" tidak cukup. Sisa: ${item.stock}`
        });
      }

      const subtotal = item.price * cart.qty;
      total += subtotal;
      detailData.push({
        item_id: item.id,
        qty: cart.qty,
        price: item.price,
        subtotal
      });
    }

    // Simpan sale
    const newSale = await db.Sale.create({
      user_id: req.user.id,
      total_price: total,
      status: 'pending'
    });

    // Simpan detail sale
    await db.SaleDetail.bulkCreate(
      detailData.map(d => ({ ...d, sale_id: newSale.id }))
    );

    // Buat transaksi Midtrans
    const order_id = `ORDER-${newSale.id}-${Date.now()}`;
    const user = await db.User.findByPk(req.user.id);
    const snapRes = await snap.createTransaction({
      transaction_details: { order_id, gross_amount: total },
      customer_details: {
        first_name: user.name || 'Customer',
        phone: user.phone || '-'
      }
    });

    // Update sale dengan midtrans_id
    newSale.midtrans_id = order_id;
    await newSale.save();

    // Kosongkan cart setelah checkout
    await db.Cart.destroy({ where: { user_id: req.user.id } });

    return res.json({
      message: 'Checkout berhasil, silakan lanjutkan pembayaran.',
      snap_token: snapRes.token,
      order_id
    });

  } catch (err) {
    console.error('Gagal checkout:', err);
    return res.status(500).json({ error: 'Gagal melakukan checkout' });
  }
});

module.exports = router;