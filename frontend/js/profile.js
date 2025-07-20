import { getUserProfile, updateUserProfile } from './api.js';

// Ambil elemen form
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const createdAtInput = document.getElementById('createdAt');
const saveBtn = document.getElementById('saveBtn');
const statusMsg = document.getElementById('statusMsg');

// Fungsi untuk format tanggal
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
}

// Load profil user
async function loadProfile() {
    try {
        const user = await getUserProfile();

        nameInput.value = user.name || '';
        emailInput.value = user.email || '';
        phoneInput.value = user.phone || '';
        createdAtInput.value = user.createdAt ? formatDate(user.createdAt) : '-';
    } catch (err) {
        console.error('Gagal memuat profil:', err);
    }
}

// Simpan perubahan
saveBtn.addEventListener('click', async () => {
    try {
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();

        await updateUserProfile({ name, phone });

        statusMsg.textContent = 'Profile updated successfully!';
        statusMsg.classList.remove('hidden', 'text-red-600');
        statusMsg.classList.add('text-green-600');

        setTimeout(() => statusMsg.classList.add('hidden'), 2000);
    } catch (err) {
        statusMsg.textContent = 'Failed to update profile.';
        statusMsg.classList.remove('hidden', 'text-green-600');
        statusMsg.classList.add('text-red-600');

        console.error('Gagal update profil:', err);
    }
});

// Panggil saat halaman siap
document.addEventListener('DOMContentLoaded', loadProfile);
