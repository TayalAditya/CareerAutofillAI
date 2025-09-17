// background.js - Advanced service worker with AI features
console.log('🚀 Career AutoFill Assistant Pro - Advanced background script loaded');

// Enhanced configuration
const CONFIG = {
    API_BASE: 'http://localhost:8000',
    SESSION_TIMEOUT: 3600000, // 1 hour
    MAX_SESSIONS: 5,
    ANALYTICS_ENABLED: true
};

// State management
let activeSessions = new Map();
let analyticsData = {
    totalFields: 0,
    successfulFills: 0,
    sitesVisited: new Set(),
    lastActivity: Date.now()
};

// Enhanced installation handler
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('🎉 Career AutoFill Assistant Pro installed/updated');
    
    // Set enhanced default settings
    await chrome.storage.local.set({
        autoDetect: true,
        showIndicator: true,
        animatedFill: true,
        smartSuggestions: true,
        apiUrl: CONFIG.API_BASE,
        confidenceThreshold: 0.7,
        fillSpeed: 50,
        notificationsEnabled: true,
        analyticsEnabled: true,
        version: '2.0',
        installDate: Date.now()
    });
    
    // Create enhanced context menus
    await createAdvancedContextMenus();
    
    // Show installation notification
    if (details.reason === 'install') {
        await showWelcomeNotification();
    }
    
    console.log('✅ Extension setup complete');
});

// Advanced context menu system
async function createAdvancedContextMenus() {
    try {
        await chrome.contextMenus.removeAll();
        
        // Main autofill menu
        chrome.contextMenus.create({
            id: 'autofill-main',
            title: '🚀 AutoFill with Career Assistant',
            contexts: ['editable']
        });
        
        // Sub-menus for specific actions
        chrome.contextMenus.create({
            id: 'autofill-all',
            parentId: 'autofill-main',
            title: '🤖 Fill All Fields',
            contexts: ['editable']
        });
        
        chrome.contextMenus.create({
            id: 'autofill-smart',
            parentId: 'autofill-main',
            title: '🧠 Smart Fill (High Confidence)',
            contexts: ['editable']
        });
        
        chrome.contextMenus.create({
            id: 'separator1',
            parentId: 'autofill-main',
            type: 'separator',
            contexts: ['editable']
        });
        
        chrome.contextMenus.create({
            id: 'open-dashboard',
            parentId: 'autofill-main',
            title: '📋 Open Dashboard',
            contexts: ['editable']
        });
        
        chrome.contextMenus.create({
            id: 'settings',
            parentId: 'autofill-main',
            title: '⚙️ Settings',
            contexts: ['editable']
        });
        
        console.log('✅ Advanced context menus created');
    } catch (error) {
        console.error('❌ Context menu creation failed:', error);
    }
}

// Enhanced message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📩 Message received:', request.action);
    
    switch (request.action) {
        case 'fieldsDetected':
            handleFieldsDetected(request, sender);
            break;
            
        case 'autofillCompleted':
            handleAutofillCompleted(request, sender);
            break;
            
        case 'getAnalytics':
            sendResponse({ analytics: analyticsData });
            break;
            
        case 'resetAnalytics':
            resetAnalytics();
            sendResponse({ success: true });
            break;
            
        case 'exportData':
            exportUserData().then(data => {
                sendResponse({ data: data });
            });
            return true; // Async response
            
        default:
            console.log('🤷‍♂️ Unknown action:', request.action);
            sendResponse({ success: false, error: 'Unknown action' });
    }
    
    sendResponse({ success: true });
});

// Enhanced fields detection handler
async function handleFieldsDetected(request, sender) {
    const { count, url, site } = request;
    const tabId = sender.tab.id;
    
    // Update analytics
    analyticsData.totalFields += count;
    analyticsData.sitesVisited.add(new URL(url).hostname);
    analyticsData.lastActivity = Date.now();
    
    // Update badge with enhanced styling
    await updateBadge(tabId, count, site);
    
    // Create or update session
    activeSessions.set(tabId, {
        url: url,
        site: site,
        fieldCount: count,
        timestamp: Date.now(),
        tabId: tabId
    });
    
    // Show notification for high-value sites
    if (isHighValueSite(url)) {
        await showJobSiteNotification(site, count);
    }
    
    console.log(`✅ Detected ${count} fields on ${site || 'website'}`);
}

// Handle autofill completion
async function handleAutofillCompleted(request, sender) {
    const { fieldsCount, successCount } = request;
    
    // Update analytics
    analyticsData.successfulFills += successCount;
    
    // Show success notification
    if (request.notificationsEnabled !== false) {
        await chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon48.png',
            title: 'AutoFill Completed! 🎉',
            message: `Successfully filled ${successCount}/${fieldsCount} fields`
        });
    }
    
    console.log(`✅ AutoFill completed: ${successCount}/${fieldsCount} fields`);
}

// Enhanced badge system
async function updateBadge(tabId, count, site) {
    try {
        // Color coding based on field count and site
        let color = '#667eea'; // Default blue
        
        if (isHighValueSite(site)) {
            color = '#28a745'; // Green for job sites
        } else if (count > 10) {
            color = '#ffc107'; // Yellow for many fields
        } else if (count > 20) {
            color = '#dc3545'; // Red for too many fields
        }
        
        await chrome.action.setBadgeText({
            text: count.toString(),
            tabId: tabId
        });
        
        await chrome.action.setBadgeBackgroundColor({
            color: color,
            tabId: tabId
        });
        
        // Update tooltip
        await chrome.action.setTitle({
            title: `Career AutoFill Pro - ${count} fields detected${site ? ` on ${site}` : ''}`,
            tabId: tabId
        });
        
    } catch (error) {
        console.error('❌ Badge update failed:', error);
    }
}

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    console.log('🖱️ Context menu clicked:', info.menuItemId);
    
    switch (info.menuItemId) {
        case 'autofill-all':
            await sendMessageToTab(tab.id, { action: 'performAutofill', mode: 'all' });
            break;
            
        case 'autofill-smart':
            await sendMessageToTab(tab.id, { action: 'performAutofill', mode: 'smart' });
            break;
            
        case 'open-dashboard':
            await chrome.tabs.create({ url: 'http://localhost:3000' });
            break;
            
        case 'settings':
            await chrome.runtime.openOptionsPage();
            break;
            
        default:
            console.log('🤷‍♂️ Unknown menu item:', info.menuItemId);
    }
});

// Enhanced tab management
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        // Clear badge
        await chrome.action.setBadgeText({ text: '', tabId: tabId });
        
        // Clean up session
        activeSessions.delete(tabId);
        
        // Reset title
        await chrome.action.setTitle({
            title: 'Career AutoFill Assistant Pro',
            tabId: tabId
        });
    }
});

// Tab removal cleanup
chrome.tabs.onRemoved.addListener((tabId) => {
    activeSessions.delete(tabId);
});

// Utility functions
function isHighValueSite(url) {
    if (!url) return false;
    
    const jobSites = [
        'linkedin.com',
        'naukri.com',
        'indeed.com',
        'glassdoor.com',
        'monster.com',
        'shine.com',
        'freshersworld.com',
        'timesjobs.com'
    ];
    
    return jobSites.some(site => url.includes(site));
}

async function sendMessageToTab(tabId, message) {
    try {
        await chrome.tabs.sendMessage(tabId, message);
    } catch (error) {
        console.error('❌ Failed to send message to tab:', error);
    }
}

async function showWelcomeNotification() {
    try {
        await chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon48.png',
            title: 'Career AutoFill Assistant Pro Installed! 🎉',
            message: 'Upload your resume and start auto-filling job applications!'
        });
    } catch (error) {
        console.error('❌ Welcome notification failed:', error);
    }
}

async function showJobSiteNotification(site, fieldCount) {
    try {
        await chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon48.png',
            title: `Job Site Detected! 💼`,
            message: `Found ${fieldCount} fields on ${site}. Click extension to auto-fill!`
        });
    } catch (error) {
        console.error('❌ Job site notification failed:', error);
    }
}

function resetAnalytics() {
    analyticsData = {
        totalFields: 0,
        successfulFills: 0,
        sitesVisited: new Set(),
        lastActivity: Date.now()
    };
    console.log('🔄 Analytics reset');
}

async function exportUserData() {
    try {
        const storage = await chrome.storage.local.get();
        return {
            settings: storage,
            analytics: analyticsData,
            sessions: Array.from(activeSessions.entries()),
            exportDate: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Data export failed:', error);
        return null;
    }
}

// Periodic cleanup
setInterval(() => {
    const now = Date.now();
    for (const [tabId, session] of activeSessions.entries()) {
        if (now - session.timestamp > CONFIG.SESSION_TIMEOUT) {
            activeSessions.delete(tabId);
        }
    }
}, 300000); // 5 minutes

// Storage change listener
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes.userProfile) {
            console.log('👤 User profile updated');
            
            // Notify all active tabs
            activeSessions.forEach(async (session) => {
                await sendMessageToTab(session.tabId, {
                    action: 'profileUpdated',
                    profile: changes.userProfile.newValue
                });
            });
        }
        
        if (changes.settings) {
            console.log('⚙️ Settings updated');
        }
    }
});

console.log('🎉 Career AutoFill Assistant Pro background script ready!');
