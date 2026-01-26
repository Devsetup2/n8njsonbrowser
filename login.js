document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        googleLoginBtn: document.getElementById('google-login-btn'),
        emailLoginForm: document.getElementById('email-login-form'),
        signupForm: document.getElementById('signup-form'),
        forgotPassword: document.getElementById('forgot-password'),
        signupToggle: document.getElementById('signup-toggle'),
        backToLogin: document.getElementById('back-to-login'),
        loginContainer: document.getElementById('login-container'),
        signupContainer: document.getElementById('signup-container'),
        messageContainer: document.getElementById('message-container'),
        email: document.getElementById('email'),
        password: document.getElementById('password'),
        signinBtn: document.getElementById('signin-btn'),
        signupBtn: document.getElementById('signup-btn')
    };

    // Check if already logged in
    AuthService.isAuthenticated().then(isAuth => {
        if (isAuth) {
            window.location.href = 'dashboard.html';
        }
    });

    // Setup auth state listener
    AuthService.setupAuthListener((event, session) => {
        console.log('Auth event:', event);
        if (event === 'SIGNED_IN' && session) {
            window.location.href = 'dashboard.html';
        }
    });

    // Toggle password visibility
    window.togglePassword = function() {
        const passwordInput = elements.password;
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
    };

    // Toggle between login and signup forms
    elements.signupToggle.addEventListener('click', function(e) {
        e.preventDefault();
        elements.loginContainer.classList.add('hidden');
        elements.signupContainer.classList.remove('hidden');
    });

    elements.backToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        elements.signupContainer.classList.add('hidden');
        elements.loginContainer.classList.remove('hidden');
    });

    // Show message function
    function showMessage(message, type = 'error') {
        elements.messageContainer.innerHTML = `
            <div class="p-4 rounded-lg ${type === 'error' ? 'bg-red-900/50 border border-red-700 text-red-200' : 'bg-green-900/50 border border-green-700 text-green-200'}">
                <div class="flex items-center">
                    <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'} mr-2"></i>
                    <span>${message}</span>
                </div>
            </div>
        `;
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                elements.messageContainer.innerHTML = '';
            }, 5000);
        }
    }

    // Clear message
    function clearMessage() {
        elements.messageContainer.innerHTML = '';
    }

    // Google Login
    elements.googleLoginBtn.addEventListener('click', async function() {
        clearMessage();
        elements.googleLoginBtn.disabled = true;
        elements.googleLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        
        const result = await AuthService.signInWithGoogle();
        
        if (!result.success) {
            showMessage(result.error, 'error');
            elements.googleLoginBtn.disabled = false;
            elements.googleLoginBtn.innerHTML = '<i class="fab fa-google"></i> Continue with Google';
        }
    });

    // Email/Password Login
    elements.emailLoginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearMessage();
        
        const email = elements.email.value;
        const password = elements.password.value;
        
        if (!email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        // Update button state
        const originalText = elements.signinBtn.innerHTML;
        elements.signinBtn.disabled = true;
        elements.signinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        
        const result = await AuthService.signInWithEmail(email, password);
        
        if (result.success) {
            showMessage('Sign in successful! Redirecting...', 'success');
            // Redirect happens automatically via auth listener
        } else {
            showMessage(result.error, 'error');
            elements.signinBtn.disabled = false;
            elements.signinBtn.innerHTML = originalText;
        }
    });

    // Sign Up
    elements.signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearMessage();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        if (!name || !email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters', 'error');
            return;
        }
        
        // Update button state
        const originalText = elements.signupBtn.innerHTML;
        elements.signupBtn.disabled = true;
        elements.signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        
        const result = await AuthService.signUp(email, password, name);
        
        if (result.success) {
            showMessage('Account created successfully! Please check your email to confirm your account.', 'success');
            
            // Switch back to login form after 3 seconds
            setTimeout(() => {
                elements.signupContainer.classList.add('hidden');
                elements.loginContainer.classList.remove('hidden');
                elements.signupBtn.disabled = false;
                elements.signupBtn.innerHTML = originalText;
                elements.signupForm.reset();
            }, 3000);
        } else {
            showMessage(result.error, 'error');
            elements.signupBtn.disabled = false;
            elements.signupBtn.innerHTML = originalText;
        }
    });

    // Forgot Password
    elements.forgotPassword.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const email = prompt('Please enter your email address to reset password:');
        if (!email) return;
        
        const result = await AuthService.resetPassword(email);
        
        if (result.success) {
            alert('Password reset email sent! Please check your inbox.');
        } else {
            alert(`Error: ${result.error}`);
        }
    });
});