import { getItems, getCategories, addToCart, getBestSellers } from './api.js';
import { checkAuth, handleLogout } from './auth.js';
import { showLoginPopup } from '../utils/popup.js';

const API_BASE = 'http://localhost:3000';
window.handleLogout = handleLogout;

async function initialize() {
    // Check authentication status
    checkAuth();
    
    // Load products and categories
    try {
        await Promise.all([
            loadProducts(),
            loadCategories()
        ]);
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initialize);
async function loadCategories() {
    try {
        await loadBestSellers();
        const token = localStorage.getItem('token');
        const ctaSection = document.getElementById('ctaSection');

        if (token && ctaSection) {
            ctaSection.remove(); // Hapus elemen CTA kalau sudah login
        }
        const categories = await getCategories();
        const categoryFilter = document.getElementById('categoryFilter');
        const footerCategories = document.getElementById('footerCategories');
        
        // Reset containers
        categoryFilter.innerHTML = `
            <button onclick="filterProducts('all')" 
                    class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 active">
                All Products
            </button>
        `;
        
        footerCategories.innerHTML = '';

        // Populate categories
        categories.forEach(category => {
            // Add filter button
            categoryFilter.innerHTML += `
                <button onclick="filterProducts(${category.id})"
                        class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                    ${category.name}
                </button>
            `;

            // Add footer category
            footerCategories.innerHTML += `
                <li>
                    <a href="#products" onclick="filterProducts(${category.id})" 
                       class="hover:text-white">
                        ${category.name}
                    </a>
                </li>
            `;
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadProducts(categoryId = null) {
    try {
        const products = await getItems();
        const productsGrid = document.getElementById('productsGrid');
        
        // Show loading state
        productsGrid.innerHTML = '<div class="col-span-full text-center">Loading...</div>';
        
        // Filter products if category is selected
        const filteredProducts = categoryId ? 
            products.filter(p => p.category_id === categoryId) : 
            products;

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="col-span-full text-center text-gray-500 py-8">
                    No products found in this category
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = filteredProducts.map(product => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <!-- Clickable Product Image and Title -->
                <a href="pages/itemDetail.html?id=${product.id}" class="group">
                    <div class="relative w-full pt-[75%] overflow-hidden">
                        <img src="${API_BASE}${product.image}" 
                             alt="${product.name}"
                             class="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    </div>
                    <div class="p-4">
                        <div class="flex justify-between items-start">
                            <h3 class="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                                ${product.name}
                            </h3>
                            <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                ${product.Category.name}
                            </span>
                        </div>
                    </div>
                </a>

                <!-- Product Info and Actions -->
                <div class="p-4 pt-0 flex flex-col flex-grow">
                    <div class="flex justify-between items-center mb-4">
                        <p class="text-xl font-bold text-blue-600">
                            Rp ${product.price.toLocaleString()}
                        </p>
                        <p class="text-sm text-gray-600">
                            Stock: ${product.stock}
                        </p>
                    </div>

                    <!-- Quantity and Add to Cart -->
                    <div class="mt-auto space-y-3">
                        <div class="flex items-center justify-between gap-2">
                            <label class="text-sm text-gray-600">Quantity:</label>
                            <div class="flex items-center border rounded-md">
                                <button onclick="event.preventDefault(); updateQuantity(${product.id}, 'decrease')" 
                                        class="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors">
                                    -
                                </button>
                                <input type="number" 
                                       id="quantity-${product.id}" 
                                       value="1" 
                                       min="1" 
                                       max="${product.stock}"
                                       class="w-14 text-center border-x py-1 focus:outline-none"
                                       onchange="validateQuantity(this, ${product.stock})">
                                <button onclick="event.preventDefault(); updateQuantity(${product.id}, 'increase')" 
                                        class="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors">
                                    +
                                </button>
                            </div>
                        </div>

                        <button onclick="event.preventDefault(); addToCartHandler(${product.id})"
                                class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors
                                       ${product.stock < 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                                ${product.stock < 1 ? 'disabled' : ''}>
                            ${product.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Helper functions for quantity management
        window.updateQuantity = (productId, action) => {
            const input = document.getElementById(`quantity-${productId}`);
            const currentValue = parseInt(input.value);
            const maxStock = parseInt(input.max);
            
            if (action === 'increase' && currentValue < maxStock) {
                input.value = currentValue + 1;
            } else if (action === 'decrease' && currentValue > 1) {
                input.value = currentValue - 1;
            }
        };

        window.validateQuantity = (input, maxStock) => {
            let value = parseInt(input.value);
            if (isNaN(value) || value < 1) value = 1;
            if (value > maxStock) value = maxStock;
            input.value = value;
        };

        // Add to cart handler
        window.addToCartHandler = async (itemId) => {
            try {
                if (!localStorage.getItem('token')) {
                    showLoginPopup();
                    return;
                }

                const quantity = parseInt(document.getElementById(`quantity-${itemId}`).value);
                await addToCart(itemId, quantity);

                // Show success toast dulu
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500';
                toast.textContent = 'Product added to cart!';
                document.body.appendChild(toast);

                setTimeout(() => {
                    toast.style.opacity = '0';
                    setTimeout(() => {
                        toast.remove();
                        // Setelah toast hilang, reload page biar badge, stock, dll update dari server
                        window.location.reload();
                    }, 500);
                }, 1500);
            } catch (error) {
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500';
                toast.textContent = error.message;
                document.body.appendChild(toast);

                setTimeout(() => {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 500);
                }, 2000);
            }
        };

    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = `
            <div class="col-span-full text-center text-red-500 py-8">
                Error loading products. Please try again later.
            </div>
        `;
    }
}

async function loadBestSellers() {
    try {
        const bestsellers = await getBestSellers();

        const container = document.querySelector('#bestsellers .grid');
        container.innerHTML = bestsellers.map(item => `
            <div class="bg-gray-50 rounded-lg shadow-lg hover:shadow-xl transition p-6 flex flex-col">
                <img src="${API_BASE}${item.image}" alt="${item.name}" class="rounded-lg mb-4">
                <h3 class="text-xl font-semibold mb-2">${item.name}</h3>
                <p class="text-gray-600 mb-4">Produk terlaris minggu ini!</p>
                <div class="flex justify-between items-center mt-auto">
                    <span class="text-2xl font-bold text-blue-600">Rp ${item.price.toLocaleString()}</span>
                    <a href="/frontend/pages/itemDetail.html?id=${item.id}" 
                       class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                        Shop Now
                    </a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Gagal memuat best sellers:', error);
        document.querySelector('#bestsellers .grid').innerHTML = `
            <p class="text-gray-500 col-span-full text-center">Gagal memuat data Best Sellers</p>
        `;
    }
}

// Filter products
window.filterProducts = async (categoryId) => {
    const buttons = document.querySelectorAll('#categoryFilter button');
    buttons.forEach(btn => {
        btn.classList.remove('bg-blue-500', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    const clickedButton = categoryId === 'all' ? 
        buttons[0] : 
        buttons[Array.from(buttons).findIndex(btn => btn.getAttribute('onclick').includes(categoryId))];
    
    clickedButton.classList.remove('bg-gray-200', 'text-gray-700');
    clickedButton.classList.add('bg-blue-500', 'text-white');

    await loadProducts(categoryId === 'all' ? null : categoryId);
};

// Initialize
window.onload = () => {
    checkAuth();
    loadCategories();
    loadProducts();
};