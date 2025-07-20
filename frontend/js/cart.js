import { getCart, updateCartItem, removeCartItem, checkoutCart } from './api.js';

let totalBelanja = 0;

document.addEventListener('DOMContentLoaded', async () => {
    await loadCart();

    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.addEventListener('click', () => {
        if (totalBelanja <= 0) {
            alert('Keranjangmu kosong.');
            return;
        }
        showConfirmModal();
    });
});

// === Modal Konfirmasi ===
window.showConfirmModal = () => {
    document.getElementById('modalTotal').innerText = totalBelanja.toLocaleString();
    document.getElementById('confirmModal').classList.remove('hidden');
};

window.closeModal = () => {
    document.getElementById('confirmModal').classList.add('hidden');
};

window.confirmCheckout = async () => {
    try {
        closeModal();
        const res = await checkoutCart();

        if (!res.snap_token) {
            alert('Checkout gagal: token tidak ada');
            return;
        }

        window.snap.pay(res.snap_token, {
            onSuccess: () => {
                alert('Pembayaran berhasil!');
                window.location.href = '/frontend/pages/orders.html';
            },
            onPending: () => {
                alert('Pembayaran pending, silakan selesaikan pembayaran.');
                window.location.href = '/frontend/pages/orders.html';
            },
            onError: () => {
                alert('Pembayaran gagal!');
            },
            onClose: () => {
                alert('Kamu menutup halaman pembayaran sebelum selesai.');
            }
        });
    } catch (err) {
        alert('Checkout gagal: ' + (err.message || 'Terjadi kesalahan'));
        console.error(err);
    }
};

// === Render Cart ===
async function loadCart() {
    const container = document.getElementById('cartItems');
    try {
        const data = await getCart();
        const cartItems = data.cartItems || [];
        totalBelanja = data.total || 0;

        if (cartItems.length === 0) {
            container.innerHTML = '<p class="text-gray-600">Keranjangmu kosong.</p>';
            document.getElementById('cartTotal').textContent = 'Rp 0';
            return;
        }

        container.innerHTML = cartItems.map(item => `
            <div class="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <img src="http://localhost:3000${item.Item.image}" class="w-20 h-20 object-cover rounded">
                    <div>
                        <h3 class="font-semibold">${item.Item.name}</h3>
                        <p class="text-gray-500">Rp ${item.Item.price.toLocaleString()}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button class="px-3 py-1 border rounded" onclick="changeQty(${item.id}, ${item.qty - 1})">-</button>
                    <span>${item.qty}</span>
                    <button class="px-3 py-1 border rounded" onclick="changeQty(${item.id}, ${item.qty + 1})">+</button>
                    <button class="ml-4 text-red-600 hover:underline" onclick="removeItem(${item.id})">Hapus</button>
                </div>
            </div>
        `).join('');

        document.getElementById('cartTotal').textContent = 'Rp ' + totalBelanja.toLocaleString();
    } catch (err) {
        container.innerHTML = '<p class="text-red-500">Gagal memuat keranjang.</p>';
        console.error(err);
    }
}

// Update & hapus item
window.changeQty = async (id, qty) => {
    if (qty <= 0) {
        await removeCartItem(id);
    } else {
        await updateCartItem(id, qty);
    }
    await loadCart();
};

window.removeItem = async (id) => {
    await removeCartItem(id);
    await loadCart();
};
