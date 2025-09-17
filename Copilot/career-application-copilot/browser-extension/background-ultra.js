// background-ultra.js - Simplified service worker for Career AutoFill Extension
console.log('🚀 Career AutoFill Assistant - Background Service Worker Loaded');

// Configuration
const CONFIG = {
    API_BASE: 'http://localhost:8000',
    SYNC_INTERVAL: 30000,
    NOTIFICATION_TEMPLATES: {
        WELCOME: {
            title: '🚀 Career AutoFill Ready!',
            message: 'Extension is now active and ready to help with job applications.',
            iconUrl: 'icon128.png'
        },
        AUTOFILL_SUCCESS: {
            title: '✅ AutoFill Completed!',
            message: 'Successfully filled form fields.',
            iconUrl: 'icon128.png'
        }
    }
};

// Simple Analytics Manager
class AnalyticsManager {
    constructor() {
        this.eventQueue = [];
        this.isOnline = true;
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupPeriodicSync();
            console.log('✅ Analytics Manager initialized');
        } catch (error) {
            console.error('Analytics init failed:', error);
        }
    }

    async loadData() {
        try {
            const result = await chrome.storage.local.get(['analyticsQueue']);
            if (result.analyticsQueue) {
                this.eventQueue = result.analyticsQueue;
            }
        } catch (error) {
            console.log('No existing analytics data');
        }
    }

    trackEvent(eventType, data = {}) {
        const event = {
            type: eventType,
            timestamp: Date.now(),
            data,
            sessionId: this.getSessionId()
        };
        
        this.eventQueue.push(event);
        
        // Auto-sync if queue is large
        if (this.eventQueue.length >= 10) {
            this.syncAnalytics();
        }
        
        this.saveData();
        console.log('📊 Event tracked:', eventType);
    }

    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }

    async syncAnalytics() {
        if (this.eventQueue.length === 0) return;

        try {
            const batch = this.eventQueue.splice(0, 10);
            
            // Try to send to backend (will fail gracefully if offline)
            const response = await fetch(`${CONFIG.API_BASE}/api/analytics/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: batch })
            });

            if (response.ok) {
                console.log('📊 Analytics synced:', batch.length, 'events');
            } else {
                // Re-queue events if failed
                this.eventQueue.unshift(...batch);
            }
        } catch (error) {
            // Silently fail - extension works offline
            console.log('Analytics sync failed (offline mode)');
        }
    }

    setupPeriodicSync() {
        // Use alarms for periodic sync
        chrome.alarms.create('analyticsSync', {
            delayInMinutes: 5,
            periodInMinutes: 5
        });
    }

    async saveData() {
        try {
            await chrome.storage.local.set({
                analyticsQueue: this.eventQueue.slice(-100) // Keep only last 100 events
            });
        } catch (error) {
            console.error('Failed to save analytics:', error);
        }
    }
}

// Simple Notification Manager
class NotificationManager {
    constructor(analyticsManager) {
        this.analyticsManager = analyticsManager;
        this.init();
    }

    init() {
        this.setupListeners();
        console.log('✅ Notification Manager initialized');
    }

    setupListeners() {
        if (chrome.notifications) {
            chrome.notifications.onClicked.addListener((notificationId) => {
                this.analyticsManager.trackEvent('notification_clicked', { notificationId });
                chrome.notifications.clear(notificationId);
            });
        }
    }

    async showNotification(type, data = {}) {
        if (!chrome.notifications) {
            console.log('Notifications not available');
            return;
        }

        const template = CONFIG.NOTIFICATION_TEMPLATES[type];
        if (!template) {
            console.error('Unknown notification type:', type);
            return;
        }

        try {
            const notificationId = await chrome.notifications.create({
                type: 'basic',
                iconUrl: template.iconUrl,
                title: template.title,
                message: this.processTemplate(template.message, data)
            });

            this.analyticsManager.trackEvent('notification_shown', { type, notificationId });
            console.log('📢 Notification shown:', type);
            return notificationId;
        } catch (error) {
            console.error('Failed to show notification:', error);
        }
    }

    processTemplate(template, data) {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    }
}

// Simple Context Menu Manager
class ContextMenuManager {
    constructor(analyticsManager) {
        this.analyticsManager = analyticsManager;
        this.init();
    }

    async init() {
        try {
            await this.createMenus();
            this.setupListeners();
            console.log('✅ Context Menu Manager initialized');
        } catch (error) {
            console.error('Context menu init failed:', error);
        }
    }

    async createMenus() {
        try {
            // Clear existing menus first
            await chrome.contextMenus.removeAll();
            
            const menus = [
                {
                    id: 'autofill-smart',
                    title: '🎯 Smart AutoFill',
                    contexts: ['editable']
                },
                {
                    id: 'autofill-form',
                    title: '📋 Fill Entire Form',
                    contexts: ['page']
                },
                {
                    id: 'scan-fields',
                    title: '🔍 Scan Fields',
                    contexts: ['page']
                }
            ];

            for (const menu of menus) {
                await chrome.contextMenus.create(menu);
            }
        } catch (error) {
            console.error('Failed to create context menus:', error);
        }
    }

    setupListeners() {
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleMenuClick(info, tab);
        });
    }

    async handleMenuClick(info, tab) {
        this.analyticsManager.trackEvent('context_menu_clicked', {
            menuItemId: info.menuItemId,
            tabId: tab.id
        });

        try {
            switch (info.menuItemId) {
                case 'autofill-smart':
                case 'autofill-form':
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'executeSmartAutofill',
                        config: { strategy: 'aggressive' }
                    });
                    break;
                case 'scan-fields':
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'scanFields'
                    });
                    break;
            }
        } catch (error) {
            console.error('Context menu action failed:', error);
        }
    }
}

// Main Service Worker Class
class BackgroundServiceWorker {
    constructor() {
        this.analyticsManager = new AnalyticsManager();
        this.notificationManager = new NotificationManager(this.analyticsManager);
        this.contextMenuManager = new ContextMenuManager(this.analyticsManager);
        this.init();
    }

    init() {
        this.setupMessageListeners();
        this.setupAlarmListeners();
        this.setupInstallListeners();
        console.log('✅ Background Service Worker initialized');
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep channel open for async response
        });
    }

    setupAlarmListeners() {
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'analyticsSync') {
                this.analyticsManager.syncAnalytics();
            }
        });
    }

    setupInstallListeners() {
        chrome.runtime.onInstalled.addListener((details) => {
            this.analyticsManager.trackEvent('extension_installed', {
                reason: details.reason,
                version: chrome.runtime.getManifest().version
            });

            if (details.reason === 'install') {
                this.notificationManager.showNotification('WELCOME');
            }
        });
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            const tabId = sender.tab?.id;
            
            this.analyticsManager.trackEvent('message_received', {
                action: message.action,
                tabId
            });

            switch (message.action) {
                case 'autofillCompleted':
                    await this.handleAutofillCompleted(message.data);
                    sendResponse({ success: true });
                    break;

                case 'fieldsDetected':
                    await this.handleFieldsDetected(message.data);
                    sendResponse({ success: true });
                    break;

                case 'contentScriptReady':
                    sendResponse({ success: true, message: 'Background script ready' });
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Message handling failed:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async handleAutofillCompleted(data) {
        this.analyticsManager.trackEvent('autofill_completed', data);
        await this.notificationManager.showNotification('AUTOFILL_SUCCESS', data);
    }

    async handleFieldsDetected(data) {
        this.analyticsManager.trackEvent('fields_detected', data);
    }

    cleanup() {
        console.log('🧹 Service worker cleanup');
        this.analyticsManager.syncAnalytics();
    }
}

// Initialize Service Worker
let serviceWorker;

try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
        serviceWorker = new BackgroundServiceWorker();
        console.log('✅ Service worker initialized successfully');
    } else {
        console.error('⚠️ Invalid context for service worker initialization');
    }
} catch (error) {
    console.error('❌ Failed to initialize service worker:', error);
}

// Handle service worker termination
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onSuspend) {
    chrome.runtime.onSuspend.addListener(() => {
        if (serviceWorker) {
            serviceWorker.cleanup();
        }
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BackgroundServiceWorker,
        AnalyticsManager,
        NotificationManager,
        ContextMenuManager
    };
}