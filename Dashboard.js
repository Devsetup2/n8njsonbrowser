// Dashboard specific functionality
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    const isAuthenticated = await AuthService.isAuthenticated();
    if (!isAuthenticated) {
        window.location.href = 'index.html';
        return;
    }
    
    // Get current user
    const user = await AuthService.getCurrentUser();
    if (user) {
        updateUserProfile(user);
    }
    
    // Show donation modal
    showDonationModal();
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', async function() {
        const result = await AuthService.signOut();
        if (result.success) {
            window.location.href = 'index.html';
        }
    });
    
    // Setup auth listener for session changes
    AuthService.setupAuthListener((event, session) => {
        if (event === 'SIGNED_OUT') {
            window.location.href = 'index.html';
        }
    });
});

// Update user profile in navbar
function updateUserProfile(user) {
    const userProfileDiv = document.getElementById('user-profile');
    
    const userEmail = user.email;
    const userName = user.user_metadata?.name || userEmail.split('@')[0];
    const avatarUrl = user.user_metadata?.avatar_url || 
                     `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
    
    userProfileDiv.innerHTML = `
        <img src="${avatarUrl}" alt="${userName}" 
             class="w-8 h-8 rounded-full border-2 border-blue-500">
        <div class="hidden md:block text-sm">
            <div class="font-medium text-white">${userName}</div>
            <div class="text-gray-400 text-xs">${userEmail}</div>
        </div>
    `;
    
    // Add click event for user dropdown
    userProfileDiv.addEventListener('click', function() {
        showUserMenu(user);
    });
}

// Show user menu
function showUserMenu(user) {
    // Remove existing menu if any
    const existingMenu = document.getElementById('user-dropdown-menu');
    if (existingMenu) existingMenu.remove();
    
    const menu = document.createElement('div');
    menu.id = 'user-dropdown-menu';
    menu.className = 'absolute right-4 top-16 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[200px]';
    
    menu.innerHTML = `
        <div class="p-4 border-b border-gray-700">
            <div class="flex items-center space-x-3">
                <img src="${user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || 'User')}&background=random`}" 
                     alt="Avatar" class="w-10 h-10 rounded-full">
                <div>
                    <div class="font-medium text-white">${user.user_metadata?.name || 'User'}</div>
                    <div class="text-gray-400 text-sm">${user.email}</div>
                </div>
            </div>
        </div>
        <div class="py-2">
            <a href="#" class="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700">
                <i class="fas fa-user mr-3"></i> My Profile
            </a>
            <a href="#" class="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700">
                <i class="fas fa-cog mr-3"></i> Settings
            </a>
            <a href="#" class="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700">
                <i class="fas fa-heart mr-3"></i> Favorites
            </a>
            <div class="border-t border-gray-700 my-2"></div>
            <button id="menu-logout-btn" class="w-full text-left flex items-center px-4 py-2 text-red-400 hover:bg-gray-700">
                <i class="fas fa-sign-out-alt mr-3"></i> Logout
            </button>
        </div>
    `;
    
    document.body.appendChild(menu);
    
    // Add logout handler
    document.getElementById('menu-logout-btn').addEventListener('click', async function() {
        const result = await AuthService.signOut();
        if (result.success) {
            window.location.href = 'index.html';
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && !document.getElementById('user-profile').contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

// Donation Modal (20 seconds)
function showDonationModal() {
    const modalHTML = `
        <div id="donation-modal" class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div class="bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
                <div class="text-center mb-8">
                    <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                        <i class="fas fa-mug-hot text-white text-3xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-2">Support Our Work</h3>
                    <p class="text-gray-300">If you find this tool helpful, consider buying me a coffee to help keep it running and improved!</p>
                </div>
                
                <div class="mb-8">
                    <div class="flex items-center justify-center mb-4">
                        <div class="text-4xl font-bold text-white mr-3" id="countdown">20</div>
                        <div>
                            <div class="text-lg text-gray-300">seconds</div>
                            <div class="text-sm text-gray-500">until automatic redirect</div>
                        </div>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div id="progress-bar" class="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"></div>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <a href="https://buymeacoffee.com/setupdev" 
                       target="_blank"
                       class="block w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-all text-lg shadow-lg text-center">
                        <i class="fas fa-mug-hot mr-2"></i> Buy Me a Coffee
                    </a>
                    
                    <button id="skip-donation"
                            class="w-full py-3 px-6 bg-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-gray-600 transition-all">
                        Skip for now
                    </button>
                    
                    <button id="remind-later"
                            class="w-full py-3 px-6 bg-blue-900/50 text-blue-300 font-semibold rounded-xl hover:bg-blue-800/50 transition-all">
                        <i class="fas fa-bell mr-2"></i> Remind me in 7 days
                    </button>
                </div>
                
                <div class="mt-6 text-center text-sm text-gray-500">
                    <p>Your support helps maintain and improve this free tool for everyone!</p>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Countdown timer
    let seconds = 20;
    const countdownElement = document.getElementById('countdown');
    const progressBar = document.getElementById('progress-bar');
    let countdownInterval;
    
    function updateCountdown() {
        seconds--;
        countdownElement.textContent = seconds;
        progressBar.style.width = `${(seconds / 20) * 100}%`;
        
        if (seconds <= 0) {
            clearInterval(countdownInterval);
            closeModal();
        }
    }
    
    countdownInterval = setInterval(updateCountdown, 1000);
    
    // Button handlers
    document.getElementById('skip-donation').addEventListener('click', () => {
        clearInterval(countdownInterval);
        closeModal();
    });
    
    document.getElementById('remind-later').addEventListener('click', () => {
        clearInterval(countdownInterval);
        closeModal();
        // Store reminder preference in localStorage
        localStorage.setItem('nextDonationReminder', Date.now() + (7 * 24 * 60 * 60 * 1000));
    });
    
    function closeModal() {
        const modal = document.getElementById('donation-modal');
        if (modal) {
            modal.remove();
        }
        
        // Initialize Buy Me a Coffee widget
        if (typeof window.BuyMeACoffee !== 'undefined') {
            window.BuyMeACoffee.init();
        }
    }
}