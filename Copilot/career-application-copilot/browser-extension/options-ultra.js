// Career AutoFill Assistant Ultimate Pro Max - Options/Settings Page
// Enterprise-grade configuration management with advanced features

class EnterpriseOptionsManager {
    constructor() {
        this.version = '3.5.0';
        this.isInitialized = false;
        this.isDarkMode = false;
        this.settingsCache = new Map();
        this.validationRules = new Map();
        this.init();
    }

    async init() {
        console.log('🚀 Enterprise Options Manager v' + this.version + ' initializing...');
        
        try {
            // Initialize with progressive loading
            await this.loadSettings();
            console.log('✅ Settings loaded');
            
            await this.setupUI();
            console.log('✅ UI setup complete');
            
            await this.setupEventListeners();
            console.log('✅ Event listeners setup');
            
            this.setupValidationRules();
            console.log('✅ Validation rules setup');
            
            await this.setupAutoSave();
            console.log('✅ Auto-save setup');
            
            await this.loadAnalytics();
            console.log('✅ Analytics loaded');
            
            this.isInitialized = true;
            console.log('✅ Enterprise Options Manager initialized successfully');
            
            // Show welcome animation
            this.showWelcomeAnimation();
            
            // Track successful initialization
            this.trackEvent('options_initialized', {
                version: this.version,
                timestamp: Date.now()
            });
            
        } catch (error) {
            this.handleError(error, 'initialization');
            this.showErrorMessage('Failed to initialize settings. Please refresh the page.');
            
            // Try to initialize with minimal functionality
            try {
                console.log('🔄 Attempting minimal initialization...');
                this.setupBasicEventListeners();
                this.isInitialized = true;
                this.showErrorMessage('Extension loaded with limited functionality. Some features may not work.');
            } catch (fallbackError) {
                console.error('❌ Complete initialization failure:', fallbackError);
                this.showCriticalError();
            }
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(null);
            this.settingsCache.set('all', result);
            
            // Apply theme
            if (result.theme === 'dark' || result.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.isDarkMode = true;
                document.body.classList.add('dark-mode');
            }
            
            console.log('📖 Settings loaded:', Object.keys(result).length, 'items');
        } catch (error) {
            console.error('❌ Failed to load settings:', error);
        }
    }

    async setupUI() {
        // Initialize all form elements with saved values
        const settings = this.settingsCache.get('all') || {};
        
        // Basic Settings
        this.setElementValue('extensionEnabled', settings.extensionEnabled !== false);
        this.setElementValue('autoFillEnabled', settings.autoFillEnabled !== false);
        this.setElementValue('smartDetection', settings.smartDetection !== false);
        this.setElementValue('confidenceThreshold', settings.confidenceThreshold || 0.8);
        
        // AI & Machine Learning
        this.setElementValue('aiEnabled', settings.aiEnabled !== false);
        this.setElementValue('mlModel', settings.mlModel || 'advanced');
        this.setElementValue('learningMode', settings.learningMode || 'adaptive');
        this.setElementValue('predictionAccuracy', settings.predictionAccuracy || 'high');
        
        // Templates & Profiles
        this.setElementValue('defaultProfile', settings.defaultProfile || 'professional');
        this.setElementValue('templateEngine', settings.templateEngine || 'smart');
        this.setElementValue('dynamicTemplates', settings.dynamicTemplates !== false);
        this.setElementValue('templateValidation', settings.templateValidation !== false);
        
        // Security & Privacy
        this.setElementValue('encryptionEnabled', settings.encryptionEnabled !== false);
        this.setElementValue('dataRetention', settings.dataRetention || '30');
        this.setElementValue('anonymousAnalytics', settings.anonymousAnalytics !== false);
        this.setElementValue('cookieConsent', settings.cookieConsent !== false);
        
        // Advanced Features
        this.setElementValue('batchProcessing', settings.batchProcessing !== false);
        this.setElementValue('cloudSync', settings.cloudSync !== false);
        this.setElementValue('collaborativeFiltering', settings.collaborativeFiltering !== false);
        this.setElementValue('realTimeValidation', settings.realTimeValidation !== false);
        
        // UI & Experience
        this.setElementValue('theme', settings.theme || 'auto');
        this.setElementValue('animations', settings.animations !== false);
        this.setElementValue('soundEffects', settings.soundEffects !== false);
        this.setElementValue('hapticFeedback', settings.hapticFeedback !== false);
        
        // Notifications
        this.setElementValue('desktopNotifications', settings.desktopNotifications !== false);
        this.setElementValue('emailNotifications', settings.emailNotifications !== false);
        this.setElementValue('slackIntegration', settings.slackIntegration !== false);
        this.setElementValue('notificationFrequency', settings.notificationFrequency || 'normal');
        
        // Performance
        this.setElementValue('performanceMode', settings.performanceMode || 'balanced');
        this.setElementValue('cacheSize', settings.cacheSize || '100');
        this.setElementValue('backgroundSync', settings.backgroundSync !== false);
        this.setElementValue('preloadTemplates', settings.preloadTemplates !== false);
        
        // Developer Tools
        this.setElementValue('debugMode', settings.debugMode === true);
        this.setElementValue('verboseLogging', settings.verboseLogging === true);
        this.setElementValue('apiTesting', settings.apiTesting === true);
        this.setElementValue('betaFeatures', settings.betaFeatures === true);
        
        // Load custom CSS if any
        if (settings.customCSS) {
            const customStyle = document.getElementById('customCSS');
            if (customStyle) customStyle.value = settings.customCSS;
        }
        
        // Update usage statistics
        this.updateUsageStats(settings);
    }

    setElementValue(id, value) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`⚠️ Element with ID '${id}' not found`);
            return;
        }
        
        try {
            if (element.type === 'checkbox') {
                element.checked = Boolean(value);
            } else if (element.type === 'range') {
                element.value = value;
                const display = document.getElementById(id + 'Value');
                if (display) display.textContent = value;
            } else if (element.type === 'number') {
                element.value = isNaN(value) ? '' : value;
            } else if (element.tagName === 'SELECT') {
                // Check if the option exists before setting
                const optionExists = Array.from(element.options).some(option => option.value === value);
                if (optionExists) {
                    element.value = value;
                } else {
                    console.warn(`⚠️ Option '${value}' not found in select '${id}'`);
                    // Set to first option as fallback
                    if (element.options.length > 0) {
                        element.value = element.options[0].value;
                    }
                }
            } else {
                element.value = value || '';
            }
            
            // Trigger change event to update any dependent UI
            element.dispatchEvent(new Event('change', { bubbles: true }));
            
        } catch (error) {
            console.error(`❌ Error setting value for element '${id}':`, error);
        }
    }

    async setupEventListeners() {
        // Form submission
        const form = document.getElementById('settingsForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAllSettings();
            });
        }
        
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Range sliders
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const display = document.getElementById(e.target.id + 'Value');
                if (display) display.textContent = e.target.value;
            });
        });
        
        // Theme toggle
        const themeSelect = document.getElementById('theme');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
        
        // Import/Export buttons
        const importBtn = document.getElementById('importSettings');
        const exportBtn = document.getElementById('exportSettings');
        
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importSettings());
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSettings());
        }
        
        // Reset buttons
        document.querySelectorAll('.reset-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.resetSection(section);
            });
        });
        
        // Profile management
        const profileSelect = document.getElementById('profileSelect');
        if (profileSelect) {
            profileSelect.addEventListener('change', (e) => {
                this.loadProfile(e.target.value);
            });
        }
        
        // Test buttons
        const testNotificationBtn = document.getElementById('testNotification');
        if (testNotificationBtn) {
            testNotificationBtn.addEventListener('click', () => this.testNotification());
        }
        
        // Analytics controls
        const clearAnalyticsBtn = document.getElementById('clearAnalytics');
        if (clearAnalyticsBtn) {
            clearAnalyticsBtn.addEventListener('click', () => this.clearAnalytics());
        }
        
        // Advanced controls
        const resetAllBtn = document.getElementById('resetAll');
        if (resetAllBtn) {
            resetAllBtn.addEventListener('click', () => this.resetAllSettings());
        }
        
        // Real-time validation
        document.querySelectorAll('input, select, textarea').forEach(element => {
            element.addEventListener('blur', (e) => {
                this.validateField(e.target);
            });
        });
        
        // Auto-save toggle
        const autoSaveToggle = document.getElementById('autoSave');
        if (autoSaveToggle) {
            autoSaveToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.enableAutoSave();
                } else {
                    this.disableAutoSave();
                }
            });
        }
    }

    setupValidationRules() {
        this.validationRules.set('confidenceThreshold', {
            min: 0.1,
            max: 1.0,
            type: 'number',
            message: 'Confidence threshold must be between 0.1 and 1.0'
        });
        
        this.validationRules.set('dataRetention', {
            min: 1,
            max: 365,
            type: 'number',
            message: 'Data retention must be between 1 and 365 days'
        });
        
        this.validationRules.set('cacheSize', {
            min: 10,
            max: 1000,
            type: 'number',
            message: 'Cache size must be between 10 and 1000 MB'
        });
    }

    validateField(element) {
        const rule = this.validationRules.get(element.id);
        if (!rule) return true;
        
        const value = parseFloat(element.value);
        const isValid = value >= rule.min && value <= rule.max;
        
        element.classList.toggle('invalid', !isValid);
        
        const errorElement = document.getElementById(element.id + 'Error');
        if (errorElement) {
            errorElement.textContent = isValid ? '' : rule.message;
            errorElement.style.display = isValid ? 'none' : 'block';
        }
        
        return isValid;
    }

    async setupAutoSave() {
        // Auto-save every 30 seconds if enabled
        setInterval(() => {
            const settings = this.settingsCache.get('all') || {};
            if (settings.autoSave) {
                this.saveAllSettings(true); // Silent save
            }
        }, 30000);
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        
        // Show selected tab content
        const selectedContent = document.getElementById(tabName + 'Tab');
        if (selectedContent) {
            selectedContent.classList.add('active');
        }
        
        // Add active class to clicked button
        const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
        
        // Track tab usage
        this.trackEvent('tab_switch', { tab: tabName });
    }

    async saveAllSettings(silent = false) {
        if (!silent) this.showSavingIndicator();
        
        try {
            // Get form element safely
            const form = this.safeGetElement('settingsForm');
            if (!form) {
                throw new Error('Settings form not found');
            }
            
            const formData = new FormData(form);
            const settings = {};
            
            // Process form data with better error handling
            for (let [key, value] of formData.entries()) {
                const element = document.getElementById(key);
                if (element) {
                    try {
                        if (element.type === 'checkbox') {
                            settings[key] = element.checked;
                        } else if (element.type === 'number' || element.type === 'range') {
                            const numValue = parseFloat(value);
                            settings[key] = isNaN(numValue) ? 0 : numValue;
                        } else {
                            settings[key] = value;
                        }
                    } catch (err) {
                        console.warn(`⚠️ Error processing field ${key}:`, err);
                        settings[key] = value; // Fallback to string value
                    }
                }
            }
            
            // Add checkboxes that might not be in FormData (unchecked ones)
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                if (!formData.has(checkbox.id) && checkbox.id) {
                    settings[checkbox.id] = checkbox.checked;
                }
            });
            
            // Validate settings with enhanced validation
            if (!this.validateAllFields() && !silent) {
                this.showErrorMessage('Please fix validation errors before saving.');
                return false;
            }
            
            // Save to storage with retry logic
            await this.saveSettingsWithRetry(settings);
            this.settingsCache.set('all', settings);
            
            // Apply theme immediately if changed
            if (settings.theme) {
                this.applyTheme(settings.theme);
            }
            
            // Send message to content script and background with error handling
            try {
                await chrome.runtime.sendMessage({
                    type: 'SETTINGS_UPDATED',
                    settings: settings,
                    timestamp: Date.now()
                });
            } catch (msgError) {
                console.warn('⚠️ Failed to notify other components:', msgError);
                // Don't fail the save operation for this
            }
            
            if (!silent) {
                this.showSuccessMessage('Settings saved successfully!');
                this.trackEvent('settings_saved', { 
                    settingsCount: Object.keys(settings).length,
                    timestamp: Date.now()
                });
            }
            
            return true;
            
        } catch (error) {
            this.handleError(error, 'saveAllSettings');
            if (!silent) {
                this.showErrorMessage('Failed to save settings. Please try again.');
            }
            return false;
        } finally {
            // Always hide saving indicator
            const indicator = document.querySelector('.saving-indicator');
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
    }

    applyTheme(theme) {
        document.body.classList.remove('dark-mode', 'light-mode');
        
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            this.isDarkMode = true;
        } else if (theme === 'light') {
            document.body.classList.add('light-mode');
            this.isDarkMode = false;
        } else { // auto
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.classList.add('dark-mode');
                this.isDarkMode = true;
            } else {
                document.body.classList.add('light-mode');
                this.isDarkMode = false;
            }
        }
        
        // Update theme color meta tag
        const themeColor = this.isDarkMode ? '#1a1a1a' : '#ffffff';
        let metaTag = document.querySelector('meta[name="theme-color"]');
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.name = 'theme-color';
            document.head.appendChild(metaTag);
        }
        metaTag.content = themeColor;
    }

    async exportSettings() {
        try {
            const settings = await chrome.storage.sync.get(null);
            const exportData = {
                version: this.version,
                timestamp: new Date().toISOString(),
                settings: settings
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `career-autofill-settings-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSuccessMessage('Settings exported successfully!');
            this.trackEvent('settings_exported');
            
        } catch (error) {
            console.error('❌ Failed to export settings:', error);
            this.showErrorMessage('Failed to export settings.');
        }
    }

    async importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const importData = JSON.parse(text);
                
                if (!importData.settings) {
                    throw new Error('Invalid settings file format');
                }
                
                await chrome.storage.sync.set(importData.settings);
                await this.loadSettings();
                await this.setupUI();
                
                this.showSuccessMessage('Settings imported successfully!');
                this.trackEvent('settings_imported');
                
            } catch (error) {
                console.error('❌ Failed to import settings:', error);
                this.showErrorMessage('Failed to import settings. Please check the file format.');
            }
        };
        
        input.click();
    }

    async resetSection(section) {
        const confirmed = confirm(`Are you sure you want to reset all ${section} settings to default?`);
        if (!confirmed) return;
        
        try {
            const defaultSettings = this.getDefaultSettings(section);
            await chrome.storage.sync.set(defaultSettings);
            await this.loadSettings();
            await this.setupUI();
            
            this.showSuccessMessage(`${section} settings reset to default!`);
            this.trackEvent('section_reset', { section });
            
        } catch (error) {
            console.error('❌ Failed to reset section:', error);
            this.showErrorMessage('Failed to reset settings.');
        }
    }

    getDefaultSettings(section) {
        const defaults = {
            basic: {
                extensionEnabled: true,
                autoFillEnabled: true,
                smartDetection: true,
                confidenceThreshold: 0.8
            },
            ai: {
                aiEnabled: true,
                mlModel: 'advanced',
                learningMode: 'adaptive',
                predictionAccuracy: 'high'
            },
            security: {
                encryptionEnabled: true,
                dataRetention: 30,
                anonymousAnalytics: true,
                cookieConsent: true
            },
            ui: {
                theme: 'auto',
                animations: true,
                soundEffects: false,
                hapticFeedback: false
            }
        };
        
        return defaults[section] || {};
    }

    async testNotification() {
        try {
            const registration = await navigator.serviceWorker.ready;
            registration.showNotification('Career AutoFill Assistant', {
                body: 'Test notification - your extension is working perfectly!',
                icon: '/icon48.png',
                badge: '/icon16.png',
                tag: 'test-notification'
            });
            
            this.showSuccessMessage('Test notification sent!');
            
        } catch (error) {
            console.error('❌ Failed to send test notification:', error);
            this.showErrorMessage('Failed to send test notification. Please check notification permissions.');
        }
    }

    async loadAnalytics() {
        try {
            const analytics = await chrome.storage.local.get(['analytics', 'usage_stats']);
            
            if (analytics.usage_stats) {
                this.updateUsageStats(analytics.usage_stats);
            }
            
            if (analytics.analytics) {
                this.updateAnalyticsCharts(analytics.analytics);
            }
            
        } catch (error) {
            console.error('❌ Failed to load analytics:', error);
        }
    }

    updateUsageStats(stats) {
        const elements = {
            totalFills: document.getElementById('totalFills'),
            successRate: document.getElementById('successRate'),
            timeSaved: document.getElementById('timeSaved'),
            lastUsed: document.getElementById('lastUsed')
        };
        
        if (elements.totalFills) elements.totalFills.textContent = stats.totalFills || 0;
        if (elements.successRate) elements.successRate.textContent = (stats.successRate || 0) + '%';
        if (elements.timeSaved) elements.timeSaved.textContent = (stats.timeSaved || 0) + ' min';
        if (elements.lastUsed) elements.lastUsed.textContent = stats.lastUsed || 'Never';
    }

    showWelcomeAnimation() {
        const welcome = document.querySelector('.welcome-animation');
        if (welcome) {
            welcome.classList.add('show');
            setTimeout(() => {
                welcome.classList.remove('show');
            }, 3000);
        }
    }

    showSavingIndicator() {
        const indicator = document.querySelector('.saving-indicator');
        if (indicator) {
            indicator.style.display = 'block';
        }
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    // Critical error display
    showCriticalError() {
        const body = document.body;
        if (body) {
            body.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-family: Arial, sans-serif;
                    z-index: 10000;
                ">
                    <div style="text-align: center; max-width: 500px; padding: 40px;">
                        <h1 style="font-size: 3em; margin-bottom: 20px;">⚠️</h1>
                        <h2 style="margin-bottom: 20px;">Critical Error</h2>
                        <p style="margin-bottom: 30px; line-height: 1.6;">
                            The extension failed to initialize properly. This may be due to:
                        </p>
                        <ul style="text-align: left; margin-bottom: 30px; line-height: 1.8;">
                            <li>Corrupted extension files</li>
                            <li>Browser permissions issues</li>
                            <li>Storage quota exceeded</li>
                            <li>Network connectivity problems</li>
                        </ul>
                        <button onclick="location.reload()" style="
                            background: white;
                            color: #ff6b6b;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            margin-right: 10px;
                        ">Reload Extension</button>
                        <button onclick="chrome.storage.sync.clear().then(() => location.reload())" style="
                            background: transparent;
                            color: white;
                            border: 2px solid white;
                            padding: 15px 30px;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                        ">Reset & Reload</button>
                    </div>
                </div>
            `;
        }
    }

    // Enhanced message display with better styling
    showMessage(message, type) {
        let messageContainer = document.querySelector('.message-container');
        
        // Create message container if it doesn't exist
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.className = 'message-container';
            messageContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(messageContainer);
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        // Enhanced styling
        const baseStyles = `
            margin-bottom: 10px;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(10px);
            animation: slideInRight 0.3s ease-out;
            cursor: pointer;
        `;
        
        const typeStyles = {
            success: 'background: rgba(39, 174, 96, 0.9); color: white; border-left: 4px solid #27ae60;',
            error: 'background: rgba(231, 76, 60, 0.9); color: white; border-left: 4px solid #e74c3c;',
            warning: 'background: rgba(243, 156, 18, 0.9); color: white; border-left: 4px solid #f39c12;',
            info: 'background: rgba(52, 152, 219, 0.9); color: white; border-left: 4px solid #3498db;'
        };
        
        messageElement.style.cssText = baseStyles + (typeStyles[type] || typeStyles.info);
        
        // Add click to dismiss
        messageElement.addEventListener('click', () => {
            messageElement.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => messageElement.remove(), 300);
        });
        
        messageContainer.appendChild(messageElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => messageElement.remove(), 300);
            }
        }, 5000);
        
        // Hide saving indicator
        const indicator = document.querySelector('.saving-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
        
        // Add CSS animations if not already present
        if (!document.querySelector('#messageAnimations')) {
            const style = document.createElement('style');
            style.id = 'messageAnimations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    trackEvent(event, data = {}) {
        chrome.runtime.sendMessage({
            type: 'TRACK_EVENT',
            event: event,
            data: data,
            timestamp: Date.now()
        });
    }

    // Missing methods implementation
    enableAutoSave() {
        console.log('✅ Auto-save enabled');
        this.autoSaveEnabled = true;
        this.showSuccessMessage('Auto-save enabled');
    }

    disableAutoSave() {
        console.log('❌ Auto-save disabled');
        this.autoSaveEnabled = false;
        this.showSuccessMessage('Auto-save disabled');
    }

    async loadProfile(profileName) {
        try {
            const profiles = await chrome.storage.sync.get(['profiles']);
            const profile = profiles.profiles?.[profileName];
            
            if (profile) {
                // Apply profile settings
                Object.keys(profile).forEach(key => {
                    this.setElementValue(key, profile[key]);
                });
                
                this.showSuccessMessage(`Profile "${profileName}" loaded successfully!`);
                this.trackEvent('profile_loaded', { profile: profileName });
            } else {
                this.showErrorMessage(`Profile "${profileName}" not found.`);
            }
        } catch (error) {
            console.error('❌ Failed to load profile:', error);
            this.showErrorMessage('Failed to load profile.');
        }
    }

    async clearAnalytics() {
        const confirmed = confirm('Are you sure you want to clear all analytics data? This action cannot be undone.');
        if (!confirmed) return;
        
        try {
            await chrome.storage.local.remove(['analytics', 'usage_stats']);
            
            // Reset analytics display
            this.updateUsageStats({
                totalFills: 0,
                successRate: 0,
                timeSaved: 0,
                lastUsed: 'Never'
            });
            
            this.showSuccessMessage('Analytics data cleared successfully!');
            this.trackEvent('analytics_cleared');
            
        } catch (error) {
            console.error('❌ Failed to clear analytics:', error);
            this.showErrorMessage('Failed to clear analytics data.');
        }
    }

    async resetAllSettings() {
        const confirmed = confirm('Are you sure you want to reset ALL settings to default? This will remove all your customizations.');
        if (!confirmed) return;
        
        const doubleConfirm = confirm('This action cannot be undone. Are you absolutely sure?');
        if (!doubleConfirm) return;
        
        try {
            // Clear all storage
            await chrome.storage.sync.clear();
            await chrome.storage.local.clear();
            
            // Reload settings
            await this.loadSettings();
            await this.setupUI();
            
            this.showSuccessMessage('All settings have been reset to default!');
            this.trackEvent('all_settings_reset');
            
        } catch (error) {
            console.error('❌ Failed to reset all settings:', error);
            this.showErrorMessage('Failed to reset settings.');
        }
    }

    updateAnalyticsCharts(analytics) {
        try {
            // Update charts if chart containers exist
            const chartElements = {
                usageChart: document.getElementById('usageChart'),
                successChart: document.getElementById('successChart'),
                performanceChart: document.getElementById('performanceChart')
            };
            
            // Simple text-based analytics display
            if (chartElements.usageChart) {
                chartElements.usageChart.innerHTML = `
                    <div class="chart-summary">
                        <h4>Usage Overview</h4>
                        <p>Daily usage: ${analytics.dailyUsage || 0} fills</p>
                        <p>Weekly usage: ${analytics.weeklyUsage || 0} fills</p>
                        <p>Monthly usage: ${analytics.monthlyUsage || 0} fills</p>
                    </div>
                `;
            }
            
            if (chartElements.successChart) {
                chartElements.successChart.innerHTML = `
                    <div class="chart-summary">
                        <h4>Success Rates</h4>
                        <p>Form detection: ${analytics.detectionRate || 0}%</p>
                        <p>Autofill success: ${analytics.fillRate || 0}%</p>
                        <p>User satisfaction: ${analytics.satisfactionRate || 0}%</p>
                    </div>
                `;
            }
            
            if (chartElements.performanceChart) {
                chartElements.performanceChart.innerHTML = `
                    <div class="chart-summary">
                        <h4>Performance Metrics</h4>
                        <p>Avg. fill time: ${analytics.avgFillTime || 0}ms</p>
                        <p>Memory usage: ${analytics.memoryUsage || 0}MB</p>
                        <p>CPU usage: ${analytics.cpuUsage || 0}%</p>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('❌ Failed to update analytics charts:', error);
        }
    }

    // Enhanced error handling
    handleError(error, context = 'Unknown') {
        console.error(`❌ Error in ${context}:`, error);
        
        // Track error for analytics
        this.trackEvent('error_occurred', {
            context: context,
            error: error.message,
            stack: error.stack
        });
        
        // Show user-friendly error message
        this.showErrorMessage(`An error occurred in ${context}. Please try again or contact support.`);
    }

    // Utility method for safe element manipulation
    safeGetElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`⚠️ Element with ID '${id}' not found`);
        }
        return element;
    }

    // Enhanced validation with better error reporting
    validateAllFields() {
        let isValid = true;
        const errors = [];
        
        document.querySelectorAll('input, select, textarea').forEach(element => {
            if (!this.validateField(element)) {
                isValid = false;
                errors.push(`${element.id || element.name}: ${this.validationRules.get(element.id)?.message || 'Invalid value'}`);
            }
        });
        
        if (!isValid) {
            console.warn('❌ Validation errors:', errors);
            this.showErrorMessage(`Validation errors: ${errors.join(', ')}`);
        }
        
        return isValid;
    }

    // Better settings persistence with retry logic
    async saveSettingsWithRetry(settings, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await chrome.storage.sync.set(settings);
                console.log(`✅ Settings saved successfully on attempt ${attempt}`);
                return true;
            } catch (error) {
                console.warn(`⚠️ Save attempt ${attempt} failed:`, error);
                
                if (attempt === maxRetries) {
                    throw error;
                }
                
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
        return false;
    }

    // Fallback event listeners for minimal functionality
    setupBasicEventListeners() {
        console.log('🔄 Setting up basic event listeners...');
        
        // Basic form submission
        const form = document.getElementById('settingsForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAllSettings();
            });
        }
        
        // Basic tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });
        
        // Basic theme switching
        const themeSelect = document.getElementById('theme');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enterpriseOptions = new EnterpriseOptionsManager();
});

// Handle system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (window.enterpriseOptions) {
        const settings = window.enterpriseOptions.settingsCache.get('all') || {};
        if (settings.theme === 'auto') {
            window.enterpriseOptions.applyTheme('auto');
        }
    }
});
