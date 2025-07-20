export function checkAuth() {
    try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        console.log('Auth Check - Token:', token); // Debug log
        console.log('Auth Check - User:', userStr); // Debug log
        
        // Clear invalid data
        if (!token || !userStr) {
            console.log('Auth Check - Missing token or user'); // Debug log
            handleLoggedOutState();
            return false;
        }

        // Try to parse user data
        let user;
        try {
            user = JSON.parse(userStr);
            console.log('Auth Check - Parsed User:', user); // Debug log
        } catch (e) {
            console.error('Auth Check - JSON Parse Error:', e); // Debug log
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            handleLoggedOutState();
            return false;
        }

        // Verify user object
        if (!user || !user.name) {
            console.log('Auth Check - Invalid user object'); // Debug log
            handleLoggedOutState();
            return false;
        }

        // Update UI for logged in state
        handleLoggedInState(user);
        return true;

    } catch (error) {
        console.error('Auth check error:', error);
        handleLoggedOutState();
        return false;
    }
}

function handleLoggedInState(user) {
    const loggedOutNav = document.getElementById('loggedOutNav');
    const loggedInNav = document.getElementById('loggedInNav');
    const userName = document.getElementById('userName');
    
    if (loggedOutNav) loggedOutNav.classList.add('hidden');
    if (loggedInNav) loggedInNav.classList.remove('hidden');
    if (userName) userName.textContent = user.name;
}

function handleLoggedOutState() {
    const loggedOutNav = document.getElementById('loggedOutNav');
    const loggedInNav = document.getElementById('loggedInNav');
    
    if (loggedOutNav) loggedOutNav.classList.remove('hidden');
    if (loggedInNav) loggedInNav.classList.add('hidden');
    
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

export function handleLogout() {
    handleLoggedOutState();
    window.location.href = '/frontend/index.html';
}