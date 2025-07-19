const express = require('express');
const router = express.Router();
const db = require('../models');
const sendWA = require('../utils/sendWA');

router.post('/', async (req, res) => {
    const {
        order_id,
        transaction_status,
        fraud_status,
        transaction_id,
        payment_type,
        transaction_time,
        gross_amount
    } = req.body;

    console.log('[CALLBACK DITERIMA]', order_id, transaction_status, fraud_status);

    try {
        const sale = await db.Sale.findOne({ where: { midtrans_id: order_id } });
        if (!sale) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });

        if (transaction_status === 'settlement' || (transaction_status === 'capture' && fraud_status === 'accept')) {
            sale.status = 'success';
        } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
            sale.status = 'failed';
        } else {
            sale.status = transaction_status;
        }

        await sale.save();

        await db.Payment.create({
            sale_id: sale.id,
            midtrans_transaction_id: transaction_id,
            payment_type,
            transaction_time,
            transaction_status,
            fraud_status,
            gross_amount,
            raw_response: req.body
        });

        // Kurangi stok jika success
        if (sale.status === 'success') {
            const details = await db.SaleDetail.findAll({ where: { sale_id: sale.id } });
            for (let detail of details) {
                const item = await db.Item.findByPk(detail.item_id);
                if (item) {
                    item.stock -= detail.qty;
                    await item.save();
                }
            }
        }

        // Kirim WA & catat notifikasi
        if (sale.status === 'success') {
            const user = await db.User.findByPk(sale.user_id);
            if (user) {
                const message = `Terima kasih ${user.name}, pembayaran Anda telah berhasil. Pesanan anda akan segera diproses 😊.`;
                const isSent = await sendWA(user.phone, message);

                await db.Notification.create({
                    sale_id: sale.id,
                    target: user.phone,
                    message,
                    status: isSent ? 'sent' : 'failed',
                    sent_at: new Date()
                });
            }
        }

        return res.status(200).json({ message: 'Callback diproses dan data disimpan' });

    } catch (err) {
        console.error('Error saat proses callback:', err);
        return res.status(500).json({ error: 'Gagal memproses callback' });
    }
});

module.exports = router;
