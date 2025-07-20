import { register } from './api.js';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorContainer = document.getElementById('errorMessage');
    const submitButton = e.target.querySelector('button[type="submit"]');

    try {
        errorContainer.classList.add('hidden');

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;

        if (password !== confirmPassword) throw new Error('Passwords do not match');
        if (password.length < 6) throw new Error('Password must be at least 6 characters long');
        if (!terms) throw new Error('Please accept the Terms and Privacy Policy');

        submitButton.disabled = true;
        submitButton.innerHTML = `
            <svg class="animate-spin h-5 w-5 mr-3 inline-block" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg> Creating account...
        `;

        await register(name, email, password, phone);
        alert('Registration successful! Please login.');
        window.location.href = '/frontend/auth/login.html';

    } catch (error) {
        errorContainer.textContent = error.message;
        errorContainer.classList.remove('hidden');

        submitButton.disabled = false;
        submitButton.textContent = 'Create Account';
        errorContainer.scrollIntoView({ behavior: 'smooth' });
    }
});