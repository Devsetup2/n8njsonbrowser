// Check if user is authenticated before loading automations
async function initApp() {
    // Only check authentication on dashboard page
    if (window.location.pathname.includes('dashboard.html') || 
        window.location.pathname === '/' ||
        document.querySelector('body').classList.contains('dashboard-page')) {
        
        try {
            // Check if AuthService exists
            if (typeof AuthService === 'undefined') {
                console.warn('AuthService not found, skipping authentication check');
                loadAutomations();
                return;
            }
            
            const isAuthenticated = await AuthService.isAuthenticated();
            if (!isAuthenticated) {
                window.location.href = 'index.html';
                return;
            }
            
            // User is authenticated, load the automations
            loadAutomations();
            
        } catch (error) {
            console.error('Authentication check failed:', error);
            // Fallback: load automations anyway for demo
            loadAutomations();
        }
    } else {
        // Not on dashboard page, load automations directly
        loadAutomations();
    }
    
    // Favoriler modalını setup et
    setupFavoritesModal();
    
    // Klavye kısayollarını etkinleştir
    setupKeyboardShortcuts();
}

// --- FAVORİLER İÇİN DEĞİŞKENLER ---
let favorites = JSON.parse(localStorage.getItem('automation-favorites')) || [];

// --- METADATA VE VERİLER ---
const automationData = [
    {
        id: 1,
        title: "E-commerce Order Tracking",
        description: "Automatically detects new orders, updates stock levels and sends notifications to customers.",
        category: "e-commerce",
        source: "ecommerceordertracker.json",
        tags: ["shopify", "woocommerce", "orders", "tracking"]
    },
    {
        id: 2,
        title: "N8N + DeepSeek + ElevenLabs — Voice Assistant",
        description: "Deepseek and Elevenlabs AI-powered voice assistant system",
        category: "AI",
        source: "elevenlabsvoiceassistant.json",
        tags: ["ai", "voice", "deepseek", "elevenlabs"]
    },
    {
        id: 3,
        title: "Social Media Auto Poster",
        description: "Automatically posts content to multiple social media platforms",
        category: "social-media",
        source: "socialmediaautoposter.json",
        tags: ["twitter", "facebook", "instagram", "scheduling"]
    },
    {
        id: 4,
        title: "Customer Support Ticket System",
        description: "Automated ticket creation and assignment for customer support",
        category: "customer-support",
        source: "customersupportticket.json",
        tags: ["support", "tickets", "zendesk", "helpdesk"]
    },
    {
        id: 5,
        title: "Email Marketing Automation",
        description: "Send personalized emails based on user behavior and triggers",
        category: "marketing",
        source: "emailmarketing.json",
        tags: ["email", "mailchimp", "campaign", "marketing"]
    },
    {
        id: 6,
        title: "Lead Generation Pipeline",
        description: "Capture and qualify leads from multiple sources",
        category: "sales",
        source: "leadgeneration.json",
        tags: ["leads", "crm", "sales", "pipeline"]
    },
    {
        id: 7,
        title: "Data Backup Automation",
        description: "Automated backup system to cloud storage",
        category: "productivity",
        source: "databackup.json",
        tags: ["backup", "google drive", "dropbox", "sync"]
    },
    {
        id: 8,
        title: "Invoice & Billing System",
        description: "Automated invoice generation and payment reminders",
        category: "finance",
        source: "invoicing.json",
        tags: ["invoice", "billing", "accounting", "payments"]
    },
    {
        id: 9,
        title: "Content Aggregator",
        description: "Collect and organize content from RSS feeds and APIs",
        category: "content",
        source: "contentaggregator.json",
        tags: ["rss", "content", "aggregation", "news"]
    },
    {
        id: 10,
        title: "Website Monitoring",
        description: "Monitor website uptime and performance",
        category: "monitoring",
        source: "websitemonitoring.json",
        tags: ["monitoring", "uptime", "performance", "alerts"]
    },
    {
        id: 11,
        title: "Form Submission Handler",
        description: "Process form submissions and route to appropriate systems",
        category: "automation",
        source: "formhandler.json",
        tags: ["forms", "submissions", "processing", "webhooks"]
    },
    {
        id: 12,
        title: "Database Synchronization",
        description: "Sync data between different databases and platforms",
        category: "data",
        source: "databasesync.json",
        tags: ["database", "sync", "integration", "data"]
    }
];

// Cache for loaded JSON data
const jsonCache = new Map();

// Extract unique categories for filters
const categories = [...new Set(automationData.map(auto => auto.category))];

// Function to load and display automations
function loadAutomations() {
    console.log('Loading automations...');
    
    // Display category filters
    displayCategoryFilters();
    
    // Display all automations initially
    displayAutomations(automationData);
    
    // Setup search functionality
    setupSearch();
    
    console.log('Automations loaded successfully');
}

// Display category filters
function displayCategoryFilters() {
    const categoryFiltersContainer = document.getElementById('category-filters');
    if (!categoryFiltersContainer) {
        console.error('Category filters container not found');
        return;
    }
    
    // Clear existing filters
    categoryFiltersContainer.innerHTML = '';
    
    // Add "All" filter
    const allButton = document.createElement('button');
    allButton.className = 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all category-filter active';
    allButton.setAttribute('data-category', 'all');
    allButton.innerHTML = '<i class="fas fa-layer-group mr-2"></i>All';
    allButton.addEventListener('click', () => filterByCategory('all'));
    categoryFiltersContainer.appendChild(allButton);
    
    // Add category filters
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all category-filter';
        button.setAttribute('data-category', category);
        button.innerHTML = `<i class="fas fa-${getCategoryIcon(category)} mr-2"></i>${formatCategoryName(category)}`;
        button.addEventListener('click', () => filterByCategory(category));
        categoryFiltersContainer.appendChild(button);
    });
}

// Get icon for category
function getCategoryIcon(category) {
    const icons = {
        'e-commerce': 'shopping-cart',
        'ai': 'robot',
        'social-media': 'share-alt',
        'customer-support': 'headset',
        'marketing': 'bullhorn',
        'sales': 'chart-line',
        'productivity': 'tasks',
        'finance': 'money-bill-wave',
        'content': 'newspaper',
        'monitoring': 'desktop',
        'automation': 'cogs',
        'data': 'database'
    };
    
    const normalizedCategory = category.toLowerCase().replace('-', '');
    for (const [key, icon] of Object.entries(icons)) {
        if (normalizedCategory.includes(key)) {
            return icon;
        }
    }
    
    return 'cube';
}

// Format category name for display
function formatCategoryName(category) {
    return category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Display automations in grid
function displayAutomations(automationsToShow) {
    const resultsContainer = document.getElementById('results-container');
    const noResultsDiv = document.getElementById('no-results');
    
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }
    
    // Clear existing results
    resultsContainer.innerHTML = '';
    
    // If no automations to show
    if (automationsToShow.length === 0) {
        if (noResultsDiv) {
            noResultsDiv.classList.remove('hidden');
        }
        resultsContainer.innerHTML = '';
        return;
    }
    
    // Hide no results message
    if (noResultsDiv) {
        noResultsDiv.classList.add('hidden');
    }
    
    // Create automation cards
    automationsToShow.forEach(automation => {
        const isFavorite = favorites.includes(automation.id);
        const card = document.createElement('div');
        card.className = 'bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 group';
        
        card.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300">
                            ${formatCategoryName(automation.category)}
                        </span>
                    </div>
                    <button class="text-gray-400 hover:text-white json-preview-btn" 
                            data-id="${automation.id}"
                            data-source="${automation.source}"
                            title="View JSON">
                        <i class="fas fa-code text-sm"></i>
                    </button>
                </div>
                
                <h3 class="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">${automation.title}</h3>
                <p class="text-gray-400 mb-4">${automation.description}</p>
                
                <div class="mb-4 flex flex-wrap gap-1">
                    ${automation.tags.map(tag => `
                        <span class="inline-block bg-gray-900 text-gray-400 text-xs px-2 py-1 rounded">
                            #${tag}
                        </span>
                    `).join('')}
                </div>
                
                <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
                    <div class="text-xs text-gray-500">
                        <i class="fas fa-file-code mr-1"></i> ${automation.source}
                    </div>
                    <div class="flex items-center space-x-3">
                        <button class="text-blue-400 hover:text-blue-300 text-sm font-medium download-json-btn" 
                                data-source="${automation.source}"
                                title="Download JSON">
                            <i class="fas fa-download mr-1"></i> Download
                        </button>
                        <button class="favorite-btn ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}" 
                                data-id="${automation.id}"
                                title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                            <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        resultsContainer.appendChild(card);
    });
    
    // Add event listeners to new buttons
    setupCardButtons();
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        
        searchTimeout = setTimeout(() => {
            const searchTerm = this.value.toLowerCase().trim();
            
            if (searchTerm === '') {
                displayAutomations(automationData);
                return;
            }
            
            const filtered = automationData.filter(auto => 
                auto.title.toLowerCase().includes(searchTerm) ||
                auto.description.toLowerCase().includes(searchTerm) ||
                auto.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                auto.category.toLowerCase().includes(searchTerm) ||
                auto.source.toLowerCase().includes(searchTerm)
            );
            
            displayAutomations(filtered);
        }, 300); // Debounce for better performance
    });
}

// Filter by category
function filterByCategory(category) {
    // Update active filter button
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-800', 'text-gray-300');
    });
    
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-blue-600', 'text-white');
        activeBtn.classList.remove('bg-gray-800', 'text-gray-300');
    }
    
    // Filter automations
    if (category === 'all') {
        displayAutomations(automationData);
    } else {
        const filtered = automationData.filter(auto => 
            auto.category.toLowerCase() === category.toLowerCase()
        );
        displayAutomations(filtered);
    }
}

// Load JSON file from source
async function loadJSONFile(source) {
    // Check cache first
    if (jsonCache.has(source)) {
        return jsonCache.get(source);
    }
    
    try {
        const response = await fetch(`./json/${source}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${source}: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        // Cache the result
        jsonCache.set(source, jsonData);
        
        return jsonData;
    } catch (error) {
        console.error('Error loading JSON:', error);
        
        // Return fallback JSON if file doesn't exist
        const fallbackJSON = {
            name: source.replace('.json', ''),
            error: "Could not load JSON file",
            source: source,
            timestamp: new Date().toISOString()
        };
        
        return fallbackJSON;
    }
}

// Setup card buttons
function setupCardButtons() {
    // Download JSON buttons
    document.querySelectorAll('.download-json-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const source = this.getAttribute('data-source');
            const automation = automationData.find(a => a.source === source);
            
            if (!automation) return;
            
            try {
                const jsonData = await loadJSONFile(source);
                const jsonStr = JSON.stringify(jsonData, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                // Create download link
                const a = document.createElement('a');
                a.href = url;
                a.download = source;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                // Show success message
                showToast(`Downloaded: ${source}`, 'success');
                
            } catch (error) {
                console.error('Download failed:', error);
                showToast(`Failed to download ${source}`, 'error');
            }
        });
    });
    
    // JSON Preview buttons
    document.querySelectorAll('.json-preview-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const source = this.getAttribute('data-source');
            const automation = automationData.find(a => a.source === source);
            
            if (!automation) return;
            
            try {
                const jsonData = await loadJSONFile(source);
                showJSONModal(automation, jsonData);
            } catch (error) {
                console.error('Preview failed:', error);
                showToast('Failed to load JSON preview', 'error');
            }
        });
    });
    
    // Favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = parseInt(this.getAttribute('data-id'));
            const automation = automationData.find(a => a.id === id);
            
            if (!automation) return;
            
            const icon = this.querySelector('i');
            const wasAdded = toggleFavorite(id);
            
            // UI güncellemesi toggleFavorite içinde yapılıyor
            // Sadece modal açıksa güncelle
            const favoritesModal = document.getElementById('favorites-modal');
            if (favoritesModal && !favoritesModal.classList.contains('hidden')) {
                updateFavoritesModal();
            }
        });
    });
}

// Favori ekle/kaldır
function toggleFavorite(automationId) {
    const index = favorites.indexOf(automationId);
    const automation = automationData.find(a => a.id == automationId);
    
    if (index === -1) {
        // Ekle
        favorites.push(automationId);
        showToast(`"${automation.title}" favorilere eklendi`, 'success');
    } else {
        // Kaldır
        favorites.splice(index, 1);
        showToast(`"${automation.title}" favorilerden kaldırıldı`, 'info');
    }
    
    // LocalStorage'a kaydet
    localStorage.setItem('automation-favorites', JSON.stringify(favorites));
    
    // UI'ı güncelle
    updateFavoritesUI();
    
    return index === -1; // true = eklendi, false = kaldırıldı
}

// Favoriler UI'ını güncelle (badge ve butonlar)
function updateFavoritesUI() {
    // Badge güncelle
    const badge = document.getElementById('favorites-badge');
    if (badge) {
        badge.textContent = favorites.length;
        badge.classList.toggle('hidden', favorites.length === 0);
    }
    
    // Kartlardaki favori butonlarını güncelle
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const id = btn.getAttribute('data-id');
        const icon = btn.querySelector('i');
        
        if (favorites.includes(parseInt(id))) {
            icon.classList.remove('far');
            icon.classList.add('fas', 'text-red-500');
            btn.classList.add('text-red-500');
        } else {
            icon.classList.remove('fas', 'text-red-500');
            icon.classList.add('far');
            btn.classList.remove('text-red-500');
        }
    });
}

// Favoriler modalını güncelle
function updateFavoritesModal() {
    const favoritesList = document.getElementById('favorites-list');
    const emptyFavorites = document.getElementById('empty-favorites');
    const favoritesCount = document.getElementById('favorites-count');
    
    if (!favoritesList) return;
    
    // Sayıyı güncelle
    if (favoritesCount) {
        favoritesCount.textContent = favorites.length;
    }
    
    // Liste temizle
    favoritesList.innerHTML = '';
    
    if (favorites.length === 0) {
        // Boş favori mesajını göster
        if (emptyFavorites) {
            favoritesList.appendChild(emptyFavorites);
            emptyFavorites.classList.remove('hidden');
        }
        return;
    }
    
    // Boş mesajı gizle
    if (emptyFavorites) {
        emptyFavorites.classList.add('hidden');
    }
    
    // Favori otomasyonları ekle
    favorites.forEach(favId => {
        const automation = automationData.find(a => a.id === favId);
        if (!automation) return;
        
        const favoriteCard = document.createElement('div');
        favoriteCard.className = 'favorite-card backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-4';
        favoriteCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-white/10 text-gray-300 mr-2">
                            ${formatCategoryName(automation.category)}
                        </span>
                        <span class="text-xs text-gray-400">${automation.source}</span>
                    </div>
                    <h4 class="font-semibold text-white mb-1">${automation.title}</h4>
                    <p class="text-sm text-gray-400 truncate">${automation.description}</p>
                </div>
                <div class="flex items-center ml-4">
                    <button class="favorite-card-remove text-gray-400 hover:text-red-400 transition-colors ml-2" 
                            data-id="${automation.id}"
                            title="Favorilerden kaldır">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
                <div class="flex flex-wrap gap-1">
                    ${automation.tags.slice(0, 2).map(tag => `
                        <span class="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded">
                            #${tag}
                        </span>
                    `).join('')}
                    ${automation.tags.length > 2 ? `<span class="text-xs text-gray-500">+${automation.tags.length - 2}</span>` : ''}
                </div>
                <button class="text-xs text-blue-400 hover:text-blue-300 download-json-btn" 
                        data-source="${automation.source}">
                    <i class="fas fa-download mr-1"></i>İndir
                </button>
            </div>
        `;
        
        favoritesList.appendChild(favoriteCard);
    });
    
    // Favori kaldırma butonlarına event listener ekle
    favoritesList.querySelectorAll('.favorite-card-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const removed = toggleFavorite(parseInt(id));
            
            if (!removed) { // removed false ise kaldırılmıştır
                // Kartı kaldır
                const card = this.closest('.favorite-card');
                if (card) {
                    card.classList.add('opacity-0', 'scale-95');
                    setTimeout(() => {
                        card.remove();
                        updateFavoritesModal();
                    }, 300);
                }
            }
        });
    });
    
    // Modal içindeki indir butonlarını setup et
    favoritesList.querySelectorAll('.download-json-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const source = this.getAttribute('data-source');
            // Mevcut download fonksiyonunu çağır
            const downloadBtn = document.querySelector(`.download-json-btn[data-source="${source}"]`);
            if (downloadBtn) {
                downloadBtn.click();
            }
        });
    });
}

// Setup favorites modal
function setupFavoritesModal() {
    const favoritesToggle = document.getElementById('favorites-toggle');
    const closeFavoritesModal = document.getElementById('close-favorites-modal');
    const clearAllFavorites = document.getElementById('clear-all-favorites');
    const favoritesModal = document.getElementById('favorites-modal');
    
    if (!favoritesToggle || !favoritesModal) return;
    
    // Modal açma/kapama
    favoritesToggle.addEventListener('click', () => {
        updateFavoritesModal();
        favoritesModal.classList.remove('hidden');
        favoritesModal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    });
    
    closeFavoritesModal.addEventListener('click', () => {
        favoritesModal.classList.add('hidden');
        favoritesModal.classList.remove('flex');
        document.body.style.overflow = '';
    });
    
    // Dışarı tıklayarak kapatma
    favoritesModal.addEventListener('click', (e) => {
        if (e.target === favoritesModal) {
            favoritesModal.classList.add('hidden');
            favoritesModal.classList.remove('flex');
            document.body.style.overflow = '';
        }
    });
    
    // Tüm favorileri temizle
    clearAllFavorites.addEventListener('click', () => {
        if (favorites.length === 0) return;
        
        if (confirm('Tüm favorileri temizlemek istediğinize emin misiniz?')) {
            favorites = [];
            localStorage.setItem('automation-favorites', JSON.stringify(favorites));
            updateFavoritesUI();
            updateFavoritesModal();
            showToast('Tüm favoriler temizlendi', 'info');
        }
    });
    
    // Başlangıçta favorileri güncelle
    updateFavoritesUI();
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // ESC ile modal kapatma
        if (e.key === 'Escape') {
            const favoritesModal = document.getElementById('favorites-modal');
            const jsonModal = document.getElementById('json-modal');
            
            if (favoritesModal && !favoritesModal.classList.contains('hidden')) {
                favoritesModal.classList.add('hidden');
                favoritesModal.classList.remove('flex');
                document.body.style.overflow = '';
            }
            
            if (jsonModal && !jsonModal.classList.contains('hidden')) {
                hideJSONModal();
            }
        }
        
        // Ctrl+F ile favorileri açma
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            const favoritesToggle = document.getElementById('favorites-toggle');
            if (favoritesToggle) {
                favoritesToggle.click();
            }
        }
    });
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast-notification').forEach(toast => toast.remove());
    
    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
        warning: 'bg-yellow-600'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast-notification fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center space-x-3 transform translate-x-full opacity-0 transition-all duration-300`;
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Setup JSON preview modal
function setupJSONPreview() {
    // Create modal HTML if not exists
    if (!document.getElementById('json-modal')) {
        const modalHTML = `
            <div id="json-modal" class="fixed inset-0 bg-black bg-opacity-90 z-[100] hidden items-center justify-center p-4">
                <div class="bg-gray-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700">
                    <div class="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900">
                        <div>
                            <h3 id="json-modal-title" class="text-xl font-bold text-white"></h3>
                            <p id="json-modal-source" class="text-sm text-gray-400 mt-1"></p>
                        </div>
                        <button id="close-json-modal" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    <div class="p-4 overflow-auto max-h-[70vh]">
                        <pre id="json-content" class="text-gray-300 text-sm bg-gray-900 p-4 rounded-lg overflow-auto font-mono text-sm"></pre>
                    </div>
                    <div class="p-4 border-t border-gray-700 bg-gray-900 flex justify-between items-center">
                        <div class="text-sm text-gray-400">
                            <i class="fas fa-info-circle mr-2"></i>
                            <span id="json-stats">Loading...</span>
                        </div>
                        <div class="flex space-x-3">
                            <button id="copy-json" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                                <i class="fas fa-copy mr-2"></i>Copy JSON
                            </button>
                            <button id="download-json-modal" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
                                <i class="fas fa-download mr-2"></i>Download
                            </button>
                            <button id="close-modal-btn" class="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup modal close buttons
        document.getElementById('close-json-modal').addEventListener('click', hideJSONModal);
        document.getElementById('close-modal-btn').addEventListener('click', hideJSONModal);
        document.getElementById('copy-json').addEventListener('click', copyJSONToClipboard);
        document.getElementById('download-json-modal').addEventListener('click', downloadJSONFromModal);
        
        // Close modal when clicking outside
        document.getElementById('json-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                hideJSONModal();
            }
        });
    }
}

// Show JSON modal with data
function showJSONModal(automation, jsonData) {
    const modal = document.getElementById('json-modal');
    const jsonContent = document.getElementById('json-content');
    const modalTitle = document.getElementById('json-modal-title');
    const modalSource = document.getElementById('json-modal-source');
    const jsonStats = document.getElementById('json-stats');
    
    if (!modal || !jsonContent) return;
    
    // Set modal title
    modalTitle.textContent = automation.title;
    modalSource.textContent = `Source: ${automation.source}`;
    
    // Format and display JSON
    try {
        const jsonStr = JSON.stringify(jsonData, null, 2);
        jsonContent.textContent = jsonStr;
        
        // Calculate stats
        const jsonSize = new Blob([jsonStr]).size;
        const lines = jsonStr.split('\n').length;
        const charCount = jsonStr.length;
        
        jsonStats.innerHTML = `
            ${formatBytes(jsonSize)} • ${lines} lines • ${charCount.toLocaleString()} characters
        `;
        
        // Add syntax highlighting
        jsonContent.innerHTML = highlightJSON(jsonStr);
        
    } catch (error) {
        jsonContent.textContent = 'Error displaying JSON data';
        jsonStats.textContent = 'Error';
    }
    
    // Store current automation data for download/copy
    modal.dataset.currentAutomation = JSON.stringify({
        title: automation.title,
        source: automation.source,
        json: jsonData
    });
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

// Hide JSON modal
function hideJSONModal() {
    const modal = document.getElementById('json-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
        delete modal.dataset.currentAutomation;
    }
}

// Copy JSON to clipboard
async function copyJSONToClipboard() {
    const jsonContent = document.getElementById('json-content');
    if (!jsonContent) return;
    
    try {
        await navigator.clipboard.writeText(jsonContent.textContent);
        showToast('JSON copied to clipboard!', 'success');
    } catch (error) {
        console.error('Copy failed:', error);
        showToast('Failed to copy JSON', 'error');
    }
}

// Download JSON from modal
async function downloadJSONFromModal() {
    const modal = document.getElementById('json-modal');
    if (!modal || !modal.dataset.currentAutomation) return;
    
    try {
        const automation = JSON.parse(modal.dataset.currentAutomation);
        const jsonStr = JSON.stringify(automation.json, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = automation.source;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast(`Downloaded: ${automation.source}`, 'success');
    } catch (error) {
        console.error('Download failed:', error);
        showToast('Failed to download JSON', 'error');
    }
}

// Format bytes to human readable format
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Basic JSON syntax highlighting
function highlightJSON(json) {
    return json
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, function(match) {
            let cls = 'text-green-400'; // strings
            if (/:$/.test(match)) {
                cls = 'text-blue-400'; // keys
            }
            return `<span class="${cls}">${match}</span>`;
        })
        .replace(/\b(true|false|null)\b/g, '<span class="text-purple-400">$&</span>')
        .replace(/\b(\d+)\b/g, '<span class="text-yellow-400">$&</span>')
        .replace(/(\{|\}|\[|\]|\,)/g, '<span class="text-gray-500">$1</span>');
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup JSON preview modal
    setupJSONPreview();
    
    // Initialize app
    initApp();
});

// Also initialize when page is fully loaded
window.addEventListener('load', function() {
    // Double check if automations are loaded
    if (document.getElementById('results-container') && 
        document.getElementById('results-container').children.length === 0) {
        setTimeout(initApp, 500);
    }
});
