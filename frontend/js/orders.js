import { getSales, paySale } from './api.js';

let allOrders = [];  // Semua pesanan

document.addEventListener('DOMContentLoaded', async () => {
    const ordersList = document.getElementById('ordersList');

    try {
        allOrders = await getSales();

        if (!allOrders.length) {
            ordersList.innerHTML = '<p class="text-gray-600">Belum ada transaksi.</p>';
            updateFilterCounts();
            return;
        }

        renderOrders(allOrders);
        updateFilterCounts();  // Hitung jumlah untuk setiap filter
    } catch (error) {
        console.error(error);
        ordersList.innerHTML = '<p class="text-red-500">Gagal memuat pesanan.</p>';
    }

    // Event filter
    document.getElementById('filterAll').addEventListener('click', () => {
        setActiveButton('filterAll');
        renderOrders(allOrders);
    });

    document.getElementById('filterPending').addEventListener('click', () => {
        setActiveButton('filterPending');
        renderOrders(allOrders.filter(o => o.status === 'pending'));
    });

    document.getElementById('filterSuccess').addEventListener('click', () => {
        setActiveButton('filterSuccess');
        renderOrders(allOrders.filter(o => o.status === 'success'));
    });
});

// Ganti warna tombol aktif
function setActiveButton(activeId) {
    const buttons = document.querySelectorAll('#orderFilter button');
    buttons.forEach(btn => {
        btn.classList.remove('bg-blue-500', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });

    const activeButton = document.getElementById(activeId);
    activeButton.classList.remove('bg-gray-200', 'text-gray-700');
    activeButton.classList.add('bg-blue-500', 'text-white');
}

// Update jumlah count
function updateFilterCounts() {
    const allCount = allOrders.length;
    const pendingCount = allOrders.filter(o => o.status === 'pending').length;
    const successCount = allOrders.filter(o => o.status === 'success').length;

    document.getElementById('filterAll').innerText = `Semua (${allCount})`;
    document.getElementById('filterPending').innerText = `Pending (${pendingCount})`;
    document.getElementById('filterSuccess').innerText = `Sukses (${successCount})`;
}

// Render daftar pesanan
function renderOrders(orders) {
    const ordersList = document.getElementById('ordersList');

    if (!orders.length) {
        ordersList.innerHTML = '<p class="text-gray-600">Tidak ada pesanan untuk filter ini.</p>';
        return;
    }

    ordersList.innerHTML = orders.map(order => {
        let statusColor = 'text-yellow-600';
        if (order.status === 'success') statusColor = 'text-green-600';
        if (order.status === 'failed') statusColor = 'text-red-600';

        const itemsHTML = order.SaleDetails.map(detail => `
            <div class="flex justify-between text-sm text-gray-600">
                <span>${detail.Item?.name || `Produk #${detail.item_id}`} (x${detail.qty})</span>
                <span>Rp ${detail.subtotal.toLocaleString()}</span>
            </div>
        `).join('');

        const payButton = order.status === 'pending'
            ? `<button class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    onclick="payOrder(${order.id})">
                    Bayar Sekarang
               </button>`
            : '';

        const paymentInfo = (order.status === 'success' && order.Payment)
            ? `<p class="text-sm text-gray-500">Metode: ${order.Payment.payment_type || 'N/A'}</p>`
            : '';

        return `
            <div class="bg-white p-4 rounded-lg shadow space-y-2">
                <div class="flex justify-between">
                    <div>
                        <p class="font-semibold">Pesanan D3-${order.id}</p>
                        <p class="text-gray-500 text-sm">${new Date(order.createdAt).toLocaleString()}</p>
                        ${paymentInfo}
                    </div>
                    <p class="font-bold ${statusColor} capitalize">${order.status}</p>
                </div>
                <div class="border-t my-2"></div>
                ${itemsHTML}
                <div class="border-t my-2"></div>
                <div class="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>Rp ${order.total_price.toLocaleString()}</span>
                </div>
                ${payButton}
            </div>
        `;
    }).join('');
}

// Fungsi bayar ulang
window.payOrder = async (saleId) => {
    try {
        const res = await paySale(saleId);
        const snapToken = res.snap_token;

        if (!snapToken) {
            alert('Gagal mendapatkan token pembayaran.');
            return;
        }

        window.snap.pay(snapToken, {
            onSuccess: () => window.location.reload(),
            onPending: () => window.location.reload(),
            onError: () => alert('Pembayaran gagal, silakan coba lagi.')
        });
    } catch (err) {
        console.error(err);
        alert('Gagal memproses pembayaran.');
    }
};
