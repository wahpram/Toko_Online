import { getItemById, addToCart } from '../js/api.js';
import { checkAuth } from './auth.js';
import { showLoginPopup } from '../utils/popup.js';

const API_BASE = 'http://localhost:3000';
let currentProduct = null; // Simpan data produk global untuk modal

async function loadProductDetail() {
    try {
        // Ambil ID produk dari URL (?id=...)
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            window.location.href = '../index.html';
            return;
        }

        // Ambil data produk
        const product = await getItemById(productId);
        currentProduct = product; // Simpan agar bisa dipakai modal

        document.title = `${product.name} - Toko3D`;

        document.getElementById('productDetail').innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                <!-- Gambar -->
                <div class="aspect-w-4 aspect-h-3">
                    <img src="${API_BASE}${product.image}" 
                         alt="${product.name}" 
                         class="w-full h-full object-cover rounded-lg shadow-md">
                </div>

                <!-- Detail -->
                <div class="flex flex-col">
                    <h1 class="text-3xl font-bold mb-4">${product.name}</h1>
                    <p class="text-3xl font-bold text-blue-600 mb-4">
                        Rp ${product.price.toLocaleString()}
                    </p>

                    <div class="bg-gray-50 rounded-lg p-4 mb-6">
                        <p class="text-gray-600">Stok tersisa: ${product.stock} unit</p>
                    </div>

                    <div class="space-y-6">
                        <div class="flex items-center gap-4">
                            <label class="text-gray-600">Quantity:</label>
                            <div class="flex items-center border rounded-md">
                                <button onclick="updateQuantity('decrease')" 
                                        class="px-4 py-2 text-gray-600 hover:bg-gray-100">-</button>
                                <input type="number" id="quantity" value="1" 
                                       min="1" max="${product.stock}" 
                                       class="w-20 text-center border-x py-2 focus:outline-none"
                                       onchange="validateQuantity(${product.stock})">
                                <button onclick="updateQuantity('increase')" 
                                        class="px-4 py-2 text-gray-600 hover:bg-gray-100">+</button>
                            </div>
                        </div>

                        <button onclick="addToCartHandler(${product.id})"
                                class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                            Add to Cart
                        </button>

                        <button onclick="showConfirmModal()"
                                class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                            Beli Sekarang
                        </button>
                    </div>
                </div>
            </div>

            <!-- Modal Konfirmasi -->
            <div id="confirmModal" class="hidden fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-96 shadow-lg">
                    <h2 class="text-xl font-bold mb-4">Konfirmasi Pembelian</h2>
                    <div class="space-y-2 mb-4">
                        <p><strong>Produk:</strong> <span id="modalProductName"></span></p>
                        <p><strong>Jumlah:</strong> <span id="modalQty"></span></p>
                        <p><strong>Subtotal:</strong> Rp <span id="modalSubtotal"></span></p>
                    </div>
                    <div class="flex justify-end gap-4">
                        <button onclick="closeModal()" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Batal</button>
                        <button onclick="confirmBuyNow()" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Lanjutkan Bayar</button>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('productDetail').innerHTML = `<p class="text-red-500">Gagal memuat produk.</p>`;
    }
}

// Modal Functions
window.showConfirmModal = () => {
    const qty = parseInt(document.getElementById('quantity').value);
    const subtotal = currentProduct.price * qty;

    document.getElementById('modalProductName').innerText = currentProduct.name;
    document.getElementById('modalQty').innerText = qty;
    document.getElementById('modalSubtotal').innerText = subtotal.toLocaleString();

    document.getElementById('confirmModal').classList.remove('hidden');
};

window.closeModal = () => {
    document.getElementById('confirmModal').classList.add('hidden');
};

window.confirmBuyNow = async () => {
    try {
        if (!localStorage.getItem('token')) {
            showLoginPopup();
            return;
        }

        const qty = parseInt(document.getElementById('quantity').value);
        closeModal();

        const res = await fetch(`${API_BASE}/sales`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                items: [
                    { item_id: currentProduct.id, qty: qty }
                ]
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal membuat transaksi');

        window.snap.pay(data.snap_token, {
            onSuccess: () => window.location.href = '/frontend/pages/orders.html',
            onPending: () => window.location.href = '/frontend/pages/orders.html',
            onError: () => alert('Pembayaran gagal.')
        });
    } catch (error) {
        alert(error.message);
    }
};

// Quantity update
window.updateQuantity = (action) => {
    const input = document.getElementById('quantity');
    const currentValue = parseInt(input.value);
    const maxStock = parseInt(input.max);

    if (action === 'increase' && currentValue < maxStock) input.value = currentValue + 1;
    else if (action === 'decrease' && currentValue > 1) input.value = currentValue - 1;
};

window.validateQuantity = (maxStock) => {
    const input = document.getElementById('quantity');
    let value = parseInt(input.value);
    if (isNaN(value) || value < 1) value = 1;
    if (value > maxStock) value = maxStock;
    input.value = value;
};

// Add to Cart
window.addToCartHandler = async (productId) => {
    try {
        if (!localStorage.getItem('token')) {
            showLoginPopup();
            return;
        }

        const quantity = parseInt(document.getElementById('quantity').value);
        await addToCart(productId, quantity);

        alert('Berhasil menambahkan ke keranjang');

        // Refresh halaman biar navbar.js update badge dari server
        window.location.reload();
    } catch (error) {
        alert(error.message);
    }
};

window.onload = loadProductDetail;
