export function showLoginPopup() {
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    popup.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <p class="text-gray-700 mb-4">Anda harus login untuk melanjutkan.</p>
            <div class="flex justify-center gap-4">
                <button id="loginBtn" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Login</button>
                <button id="cancelBtn" class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Batal</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    document.getElementById('loginBtn').onclick = () => {
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = '/frontend/auth/login.html';
    };
    document.getElementById('cancelBtn').onclick = () => popup.remove();
}
