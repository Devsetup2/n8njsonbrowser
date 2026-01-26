// Supabase Configuration
const SUPABASE_URL = 'https://your-project.supabase.co'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'your-anon-key'; // Replace with your Supabase anon key

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Authentication Functions
class AuthService {
    // Check if user is authenticated
    static async isAuthenticated() {
        try {
            const { data, error } = await supabase.auth.getSession();
            return !error && data.session !== null;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    }

    // Get current user
    static async getCurrentUser() {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Get user error:', error);
            return null;
        }
        return data.user;
    }

    // Get user session
    static async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Get session error:', error);
            return null;
        }
        return data.session;
    }

    // Google OAuth Login
    static async signInWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard.html`
                }
            });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Google sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Email/Password Sign In
    static async signInWithEmail(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Email sign in error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    // Sign Up with Email/Password
    static async signUp(email, password, name) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
                options: {
                    data: {
                        name: name,
                        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
                    }
                }
            });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    // Sign Out
    static async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    // Forgot Password
    static async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/reset-password.html`
            });
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    // Get user-friendly error messages
    static getErrorMessage(error) {
        const messages = {
            'Invalid login credentials': 'Incorrect email or password.',
            'Email not confirmed': 'Please confirm your email address.',
            'User already registered': 'An account with this email already exists.',
            'Password should be at least 6 characters': 'Password must be at least 6 characters.',
            'rate_limit_exceeded': 'Too many attempts. Please try again later.',
            'invalid_email': 'Please enter a valid email address.',
            'weak_password': 'Password is too weak. Please use a stronger password.'
        };
        
        return messages[error.message] || error.message || 'An error occurred. Please try again.';
    }

    // Set up auth state listener
    static setupAuthListener(callback) {
        supabase.auth.onAuthStateChange((event, session) => {
            if (callback) callback(event, session);
        });
    }
}

// Export for use in other files
window.AuthService = AuthService;