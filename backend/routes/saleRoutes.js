const express = require('express');
const router  = express.Router();
const db      = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');
const midtransClient = require('midtrans-client');
require('dotenv').config();

const snap = new midtransClient.Snap({
  isProduction : false,
  serverKey    : process.env.MIDTRANS_SERVER_KEY,
  clientKey    : process.env.MIDTRANS_CLIENT_KEY
});


router.post('/', authenticate, async (req, res) => {
	try {
		const { items } = req.body;
		if (!items || items.length === 0)
		return res.status(400).json({ error: 'Tidak ada item dalam pesanan.' });

		// Cek user detail dari database
		const user = await db.User.findByPk(req.user.id);

		// Validasi stok
		for (const i of items) {
		const item = await db.Item.findByPk(i.item_id);
		if (!item) return res.status(404).json({ error: `Item ID ${i.item_id} tidak ditemukan.` });
		if (item.stock < i.qty)
			return res.status(400).json({ error: `Stok "${item.name}" kurang. Sisa: ${item.stock}` });
		}

		// Hitung total
		let total = 0;
		const detailData = [];
		for (const i of items) {
		const product  = await db.Item.findByPk(i.item_id);
		const subtotal = product.price * i.qty;
		total         += subtotal;
		detailData.push({ item_id: i.item_id, qty: i.qty, price: product.price, subtotal });
		}

		// Simpan sale
		const newSale = await db.Sale.create({
			user_id: req.user.id,
			total_price: total,
			status: 'pending'
		});

		await db.SaleDetail.bulkCreate(detailData.map(d => ({ ...d, sale_id: newSale.id })));

		// Buat transaksi Midtrans
		const order_id = `ORDER-${newSale.id}-${Date.now()}`;
		const snapRes  = await snap.createTransaction({
			transaction_details: { order_id, gross_amount: total },
			customer_details: { first_name: user.name || 'Customer', phone: user.phone || '-' }
		});

		newSale.midtrans_id = order_id;
		await newSale.save();

		return res.json({
			message: 'Transaksi berhasil dibuat',
			snap_token: snapRes.token,
			order_id
		});
	} catch (err) {
		console.error('Gagal membuat transaksi:', err);
		return res.status(500).json({ error: 'Gagal membuat transaksi' });
	}
});


router.get('/', authenticate, async (req, res) => {
    try {
        const sales = await db.Sale.findAll({
            where: { user_id: req.user.id },
            include: [
                {
                    model: db.SaleDetail,
                    attributes: ['item_id', 'qty', 'price', 'subtotal'],
                    include: [
                        {
                            model: db.Item,
                            attributes: ['name', 'image', 'price']
                        }
                    ]
                },
                {
                    model: db.Payment,
                    attributes: [
                        'payment_type',
                        'transaction_time',
                        'transaction_status',
                        'gross_amount'
                    ]
                }
            ],
            order: [['createdAt', 'ASC']],
            attributes: ['id', 'total_price', 'status', 'createdAt']
        });

        res.json(sales);
    } catch (err) {
        console.error('Gagal mengambil sales:', err);
        res.status(500).json({ error: 'Gagal mengambil data transaksi' });
    }
});


router.post('/:id/pay', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const sale = await db.Sale.findOne({
            where: { id, user_id: req.user.id },
            include: [{ model: db.SaleDetail, include: [db.Item] }]
        });

        if (!sale) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
        if (sale.status !== 'pending') {
            return res.status(400).json({ error: 'Hanya transaksi pending yang bisa dibayar' });
        }

        // Selalu buat order_id baru supaya Midtrans tidak menolak
        const order_id = `ORDER-${sale.id}-${Date.now()}`;

        // Buat Snap Token
        const snapRes = await snap.createTransaction({
            transaction_details: {
                order_id,
                gross_amount: sale.total_price
            },
            customer_details: {
                first_name: req.user.name || 'Customer',
                email: req.user.email || '-'
            }
        });

        // Update midtrans_id agar frontend selalu pakai yang terbaru
        sale.midtrans_id = order_id;
        await sale.save();

        return res.json({
            message: 'Token pembayaran berhasil dibuat',
            snap_token: snapRes.token,
            order_id
        });
    } catch (err) {
        console.error('Gagal membuat token pembayaran:', err);
        return res.status(500).json({ error: 'Gagal membuat token pembayaran' });
    }
});


router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const sale = await db.Sale.findOne({
            where: { id, user_id: req.user.id },
            include: [
                {
                    model: db.SaleDetail,
                    include: [{ model: db.Item, attributes: ['name', 'price'] }],
                    attributes: ['qty', 'price', 'subtotal']
                },
                {
                    model: db.Payment,
                    attributes: ['payment_type', 'transaction_time', 'transaction_status', 'gross_amount']
                }
            ],
            attributes: ['id', 'total_price', 'status', 'createdAt']
        });

        if (!sale) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });

        res.json(sale);
    } catch (err) {
        console.error('Gagal mengambil detail pesanan:', err);
        res.status(500).json({ error: 'Gagal mengambil detail pesanan' });
    }
});


router.get('/all', authenticate, isAdmin, async (req, res) => {
    const sales = await db.Sale.findAll({
        include: [db.User, db.SaleDetail, db.Payment]
    });
    res.json(sales);
});


router.patch('/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Pastikan status valid (opsional, kalau mau membatasi status tertentu)
    const allowedStatus = ['pending', 'success', 'failed', 'shipped', 'delivered'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: `Status tidak valid. Hanya bisa: ${allowedStatus.join(', ')}` });
    }

    const sale = await db.Sale.findByPk(id);
    if (!sale) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    sale.status = status;
    await sale.save();

    return res.json({ message: 'Status pesanan berhasil diperbarui', sale });
  } catch (err) {
    console.error('Gagal update status:', err);
    return res.status(500).json({ error: 'Gagal memperbarui status pesanan' });
  }
});

module.exports = router;
