import { getCart } from './api.js';

async function updateCartBadge() {
    try {
        const data = await getCart();
        const cartItems = data.cartItems || [];

        // Hitung jumlah item unik (bukan total qty)
        const totalItems = cartItems.length;

        const badge = document.getElementById('cartCount');
        if (badge) {
            badge.textContent = totalItems;
        }
    } catch (error) {
        console.error('Failed to update cart badge:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const loggedInNav = document.getElementById('loggedInNav');
    const loggedOutNav = document.getElementById('loggedOutNav');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');

    if (token) {
        loggedOutNav.classList.add('hidden');
        loggedInNav.classList.remove('hidden');
        loggedInNav.classList.add('flex');

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.name) userName.textContent = user.name;
        if (user.avatar) userAvatar.src = user.avatar;

        await updateCartBadge();
    } else {
        loggedInNav.classList.add('hidden');
        loggedInNav.classList.remove('flex');
        loggedOutNav.classList.remove('hidden');
        loggedOutNav.classList.add('flex');
    }
});

// Logout
function updateNavbar() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName') || 'User';

    const loggedInNav = document.getElementById('loggedInNav');
    const loggedOutNav = document.getElementById('loggedOutNav');
    const userNameSpan = document.getElementById('userName');

    if (token) {
        loggedOutNav.classList.add('hidden');
        loggedInNav.classList.remove('hidden');
        loggedInNav.classList.add('flex');
        if (userNameSpan) userNameSpan.textContent = userName;
    } else {
        loggedInNav.classList.add('hidden');
        loggedInNav.classList.remove('flex');
        loggedOutNav.classList.remove('hidden');
        loggedOutNav.classList.add('flex');
    }
}

window.handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    updateNavbar();
    window.location.href = '/frontend/auth/login.html';
};
