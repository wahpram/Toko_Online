const API_BASE = 'http://localhost:3000';

function getToken() {
    return localStorage.getItem('token');
}

async function request(endpoint, method = 'GET', data = null, isMultipart = false) {
    const headers = {};
    if (!isMultipart) headers['Content-Type'] = 'application/json';

    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: data ? (isMultipart ? data : JSON.stringify(data)) : null,
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || result.error || 'Request gagal');
    return result;
}

export async function register(name, email, password, phone) {
    return request('/auth/register', 'POST', { name, email, password, phone });
}

export async function login(email, password) {
    try {
        const result = await request('/auth/login', 'POST', { email, password });
        console.log('API Login Response:', result);
        
        if (!result.token) {
            throw new Error('Token not found in response');
        }

        // Decode token to get user info
        const userInfo = decodeToken(result.token);
        
        // Create standardized user object
        const userData = {
            id: userInfo.id,
            email: userInfo.email,
            role: userInfo.role,
            name: userInfo.email.split('@')[0] // Use email username as display name
        };

        return {
            token: result.token,
            user: userData
        };
    } catch (error) {
        console.error('Login API Error:', error);
        throw error;
    }
}

// Helper function to decode JWT token
function decodeToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Token decode error:', error);
        throw new Error('Invalid token format');
    }
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.setItem('user', null); // Tambahkan ini
}

export async function getItems() {
    return request('/items', 'GET');
}

export async function getItemById(id) {
    return request(`/items/${id}`, 'GET');
}

export async function getCategories() {
    return request('/categories', 'GET');
}

export async function createItem(data) {
    // data = FormData() -> harus multipart
    return request('/admin/items', 'POST', data, true);
}

// Admin: Edit item
export async function updateItem(id, data) {
    return request(`/admin/items/${id}`, 'PATCH', data);
}

// Admin: Hapus item
export async function deleteItem(id) {
    return request(`/admin/items/${id}`, 'DELETE');
}

// Admin: Ambil semua item (untuk dashboard admin)
export async function getAdminItems() {
    return request('/admin/items', 'GET');
}

// ========================= CATEGORIES (Admin) =========================
export async function getCategoriesAdmin() {
    return request('/admin/categories', 'GET');
}

export async function createCategoryAdmin(name) {
    return request('/admin/categories', 'POST', { name });
}

export async function updateCategoryAdmin(id, name) {
    return request(`/admin/categories/${id}`, 'PATCH', { name });
}

export async function deleteCategoryAdmin(id) {
    return request(`/admin/categories/${id}`, 'DELETE');
}

// ========================= CART =========================

export async function getCart() {
    return request('/cart', 'GET');
}

export async function addToCart(item_id, qty) {
    return request('/cart', 'POST', { item_id, qty });
}

export async function updateCartItem(id, qty) {
    return request(`/cart/${id}`, 'PATCH', { qty });
}

export async function removeCartItem(id) {
    return request(`/cart/${id}`, 'DELETE');
}

export async function checkoutCart() {
    return request('/cart/checkout', 'POST');
}

// ========================= SALES =========================
// Ambil semua transaksi user
export async function getSales() {
    return request('/sales', 'GET');
}

// Ambil detail transaksi tertentu
export async function getSaleDetail(id) {
    return request(`/sales/${id}`, 'GET');
}

// Admin: Ambil semua transaksi
export async function getAllSales() {
    return request('/sales/all', 'GET');
}

// Admin: Update status pesanan
export async function updateSaleStatus(id, status) {
    return request(`/sales/${id}/status`, 'PATCH', { status });
}

export async function paySale(id) {
    return request(`/sales/${id}/pay`, 'POST');
}

// ========================= USERS (Admin) =========================
export async function getAllUsers() {
    return request('/admin/users', 'GET');
}

export async function updateUserRole(id, role) {
    return request(`/admin/users/${id}/role`, 'PATCH', { role });
}


export async function getUserProfile() {
    return request('/user', 'GET');
}

export async function updateUserProfile(data) {
    return request('/user', 'PUT', data);
}

export async function getBestSellers() {
    return request('/items/bestsellers', 'GET');
}