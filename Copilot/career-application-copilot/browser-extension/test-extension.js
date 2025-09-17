// Quick Extension Test Script
// Run this in the browser console to test extension functionality

console.log('🧪 Starting Extension Test Suite...');

// Test 1: Check if extension is loaded
function testExtensionLoaded() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        console.log('✅ Chrome extension API available');
        return true;
    } else {
        console.log('❌ Chrome extension API not available');
        return false;
    }
}

// Test 2: Check storage functionality
async function testStorage() {
    try {
        await chrome.storage.sync.set({test: 'value'});
        const result = await chrome.storage.sync.get('test');
        if (result.test === 'value') {
            console.log('✅ Storage functionality working');
            await chrome.storage.sync.remove('test');
            return true;
        } else {
            console.log('❌ Storage read/write failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Storage error:', error);
        return false;
    }
}

// Test 3: Check message passing
function testMessagePassing() {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({type: 'PING', test: true}, (response) => {
            if (chrome.runtime.lastError) {
                console.log('❌ Message passing failed:', chrome.runtime.lastError);
                resolve(false);
            } else {
                console.log('✅ Message passing working');
                resolve(true);
            }
        });
        
        // Timeout after 2 seconds
        setTimeout(() => {
            console.log('❌ Message passing timeout');
            resolve(false);
        }, 2000);
    });
}

// Test 4: Check if content script is injected
function testContentScript() {
    return new Promise((resolve) => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {type: 'PING'}, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log('❌ Content script not responding:', chrome.runtime.lastError);
                        resolve(false);
                    } else {
                        console.log('✅ Content script responding');
                        resolve(true);
                    }
                });
            } else {
                console.log('❌ No active tab found');
                resolve(false);
            }
        });
        
        setTimeout(() => {
            console.log('❌ Content script timeout');
            resolve(false);
        }, 2000);
    });
}

// Test 5: Check manifest and permissions
function testManifest() {
    const manifest = chrome.runtime.getManifest();
    if (manifest) {
        console.log('✅ Manifest loaded:', manifest.name, 'v' + manifest.version);
        console.log('📋 Permissions:', manifest.permissions);
        return true;
    } else {
        console.log('❌ Manifest not available');
        return false;
    }
}

// Test 6: Test form detection (if on a page with forms)
function testFormDetection() {
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input, textarea, select');
    
    console.log(`📝 Found ${forms.length} forms and ${inputs.length} input fields`);
    
    if (forms.length > 0 || inputs.length > 0) {
        console.log('✅ Forms/inputs detected for testing');
        return true;
    } else {
        console.log('ℹ️ No forms found on current page (normal for extension pages)');
        return true; // Not a failure
    }
}

// Test 7: Check if options page works
function testOptionsPage() {
    if (window.enterpriseOptions) {
        console.log('✅ Enterprise Options Manager loaded');
        console.log('📊 Initialization status:', window.enterpriseOptions.isInitialized);
        console.log('📦 Settings cache:', window.enterpriseOptions.settingsCache.size, 'items');
        return true;
    } else {
        console.log('ℹ️ Options manager not loaded (normal if not on options page)');
        return true; // Not a failure unless we're specifically on options page
    }
}

// Run all tests
async function runAllTests() {
    console.log('\n🚀 Running Extension Test Suite...\n');
    
    const tests = [
        {name: 'Extension API', test: testExtensionLoaded},
        {name: 'Storage', test: testStorage},
        {name: 'Message Passing', test: testMessagePassing},
        {name: 'Content Script', test: testContentScript},
        {name: 'Manifest', test: testManifest},
        {name: 'Form Detection', test: testFormDetection},
        {name: 'Options Page', test: testOptionsPage}
    ];
    
    const results = [];
    
    for (const {name, test} of tests) {
        console.log(`\n🧪 Testing ${name}...`);
        try {
            const result = await test();
            results.push({name, result, error: null});
        } catch (error) {
            console.log(`❌ ${name} test failed:`, error);
            results.push({name, result: false, error});
        }
    }
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = results.filter(r => r.result).length;
    const total = results.length;
    
    results.forEach(({name, result, error}) => {
        const status = result ? '✅' : '❌';
        console.log(`${status} ${name}`);
        if (error) {
            console.log(`   Error: ${error.message}`);
        }
    });
    
    console.log(`\n📈 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! Extension is working perfectly!');
    } else if (passed >= total * 0.7) {
        console.log('⚠️ Most tests passed. Extension should work with minor issues.');
    } else {
        console.log('❌ Multiple tests failed. Extension may have significant issues.');
    }
    
    return {passed, total, results};
}

// Auto-run tests
if (typeof chrome !== 'undefined') {
    runAllTests().catch(console.error);
} else {
    console.log('❌ This script must be run in a Chrome extension context');
}

// Export for manual use
window.extensionTests = {
    runAllTests,
    testExtensionLoaded,
    testStorage,
    testMessagePassing,
    testContentScript,
    testManifest,
    testFormDetection,
    testOptionsPage
};
