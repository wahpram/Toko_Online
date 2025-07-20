import { login } from './api.js';

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const errorContainer = document.getElementById('errorMessage');
    const originalButtonText = submitButton.textContent;
    
    try {
        // Reset error message
        errorContainer.textContent = '';
        errorContainer.classList.add('hidden');
        
        // Get form data
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Validate input
        if (!email || !password) {
            throw new Error('Please fill in all fields');
        }

        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <svg class="animate-spin h-5 w-5 mr-3 inline-block" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Signing in...
        `;

        // Clear any existing auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Attempt login
        const result = await login(email, password);
        console.log('Login Response:', result); // Debug log

        // Verify login success with detailed checking
        if (!result) {
            throw new Error('No response from server');
        }

        if (!result.token) {
            throw new Error('No token received');
        }

        if (!result.user) {
            throw new Error('No user data received');
        }

        // Store user data
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));

        // Remember me functionality
        const rememberMe = document.getElementById('remember')?.checked;
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
        successMessage.textContent = 'Login successful! Redirecting...';
        document.body.appendChild(successMessage);

        // Redirect after short delay
        setTimeout(() => {
            window.location.href = '/frontend/index.html';
        }, 1000);
        
    } catch (error) {
        // Show error message
        errorContainer.textContent = error.message || 'An error occurred during login';
        errorContainer.classList.remove('hidden');
        
        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        
        // Clear any partial auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Log error for debugging
        console.error('Login error:', error);
    }
});