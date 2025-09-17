// popup.js - Popup interface logic
const API_BASE = 'http://localhost:8000';

let currentProfile = null;
let detectedFields = [];

// DOM elements
const statusEl = document.getElementById('status');
const profileSection = document.getElementById('profile-section');
const autofillSection = document.getElementById('autofill-section');
const profileNameEl = document.getElementById('profile-name');
const profileEmailEl = document.getElementById('profile-email');
const profileSkillsEl = document.getElementById('profile-skills');
const fieldCountEl = document.getElementById('field-count');
const detectedFieldsEl = document.getElementById('detected-fields');
const autoFillBtn = document.getElementById('auto-fill-btn');
const aiAnalyzeBtn = document.getElementById('ai-analyze-btn');
const aiOptimizeBtn = document.getElementById('ai-optimize-btn');
const refreshFieldsBtn = document.getElementById('refresh-fields-btn');
const openDashboardBtn = document.getElementById('open-dashboard-btn');
const uploadResumeBtn = document.getElementById('upload-resume-btn');

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    await checkBackendConnection();
    await loadUserProfile();
    await detectFormFields();
    setupEventListeners();
});

// Check if backend is running
async function checkBackendConnection() {
    try {
        const response = await fetch(`${API_BASE}/`);
        if (response.ok) {
            statusEl.className = 'status connected';
            statusEl.textContent = '✅ Connected to backend';
        } else {
            throw new Error('Backend not responding');
        }
    } catch (error) {
        statusEl.className = 'status disconnected';
        statusEl.textContent = '❌ Backend not running - Start your local server';
    }
}

// Load user profile from storage or backend
async function loadUserProfile() {
    try {
        // First check Chrome storage for saved session
        const result = await chrome.storage.local.get(['sessionId', 'userProfile']);
        
        if (result.sessionId && result.userProfile) {
            currentProfile = result.userProfile;
            displayProfile(currentProfile);
        } else {
            // Try to load default profile from backend
            try {
                const response = await fetch(`${API_BASE}/api/extension/profile`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.profile) {
                        currentProfile = data.profile;
                        displayProfile(currentProfile);
                        
                        // Save to storage for future use
                        await chrome.storage.local.set({
                            userProfile: currentProfile,
                            sessionId: 'default-session'
                        });
                        
                        console.log('✅ Profile loaded from backend:', data.source);
                        return;
                    }
                }
            } catch (backendError) {
                console.warn('⚠️ Failed to load profile from backend:', backendError);
            }
            
            // No profile found anywhere
            profileSection.style.display = 'none';
            autofillSection.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Display user profile
function displayProfile(profile) {
    profileNameEl.textContent = profile.name || 'Unknown';
    profileEmailEl.textContent = profile.email || 'Not provided';
    profileSkillsEl.textContent = profile.skills.slice(0, 3).join(', ') + 
        (profile.skills.length > 3 ? '...' : '');
    
    profileSection.style.display = 'block';
    autofillSection.style.display = 'block';
}

// Detect form fields on current page
async function detectFormFields() {
    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Inject content script to detect fields
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: scanForFormFields
        });
        
        if (results && results[0] && results[0].result) {
            detectedFields = results[0].result;
            displayDetectedFields(detectedFields);
        }
    } catch (error) {
        console.error('Error detecting fields:', error);
        fieldCountEl.textContent = '0';
        detectedFieldsEl.innerHTML = '<div class="field-item">Error detecting fields on this page</div>';
    }
}

// Function to be injected into page to scan for form fields
function scanForFormFields() {
    const fields = [];
    
    // Common form field selectors
    const selectors = [
        'input[type="text"]',
        'input[type="email"]',
        'input[type="tel"]',
        'input[type="url"]',
        'textarea',
        'select'
    ];
    
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            // Skip hidden or disabled fields
            if (element.offsetWidth === 0 || element.offsetHeight === 0 || element.disabled) {
                return;
            }
            
            const fieldInfo = {
                selector: selector,
                index: index,
                id: element.id,
                name: element.name,
                placeholder: element.placeholder,
                label: getFieldLabel(element),
                type: element.type || element.tagName.toLowerCase(),
                value: element.value
            };
            
            // Determine field purpose
            fieldInfo.purpose = determineFieldPurpose(fieldInfo);
            fields.push(fieldInfo);
        });
    });
    
    return fields;
}

// Helper function to get field label
function getFieldLabel(element) {
    // Try different ways to find the label
    if (element.labels && element.labels.length > 0) {
        return element.labels[0].textContent.trim();
    }
    
    // Look for label with for attribute
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) {
        return label.textContent.trim();
    }
    
    // Look for preceding text or parent text
    const parent = element.parentElement;
    if (parent) {
        const text = parent.textContent.replace(element.value, '').trim();
        if (text.length < 100) {
            return text;
        }
    }
    
    return element.placeholder || element.name || 'Unknown field';
}

// Determine what type of data a field expects
function determineFieldPurpose(fieldInfo) {
    const text = (fieldInfo.label + ' ' + fieldInfo.name + ' ' + fieldInfo.placeholder).toLowerCase();
    
    if (text.includes('name') && !text.includes('company') && !text.includes('file')) return 'name';
    if (text.includes('email')) return 'email';
    if (text.includes('phone') || text.includes('mobile') || text.includes('tel')) return 'phone';
    if (text.includes('skill') || text.includes('technolog')) return 'skills';
    if (text.includes('experience') || text.includes('work')) return 'experience';
    if (text.includes('education') || text.includes('university') || text.includes('college')) return 'university';
    if (text.includes('degree') || text.includes('qualification')) return 'degree';
    if (text.includes('cover') || text.includes('letter') || text.includes('why')) return 'cover_letter';
    if (text.includes('resume') || text.includes('cv')) return 'resume';
    
    return 'unknown';
}

// Display detected fields in popup
function displayDetectedFields(fields) {
    fieldCountEl.textContent = fields.length;
    
    if (fields.length === 0) {
        detectedFieldsEl.innerHTML = '<div class="field-item">No fillable fields found on this page</div>';
        autoFillBtn.disabled = true;
        return;
    }
    
    detectedFieldsEl.innerHTML = '';
    fields.forEach((field, index) => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'field-item';
        
        const confidence = getFieldConfidence(field.purpose);
        
        fieldDiv.innerHTML = `
            <div class="field-name">${field.label || field.name || 'Field ' + (index + 1)}</div>
            <div class="field-confidence">${confidence}%</div>
        `;
        
        detectedFieldsEl.appendChild(fieldDiv);
    });
    
    autoFillBtn.disabled = false;
}

// Get confidence score for field matching
function getFieldConfidence(purpose) {
    const confidenceMap = {
        'name': 95,
        'email': 95,
        'phone': 90,
        'skills': 85,
        'university': 85,
        'degree': 80,
        'experience': 75,
        'cover_letter': 70,
        'resume': 70,
        'unknown': 20
    };
    
    return confidenceMap[purpose] || 20;
}

// Setup event listeners
function setupEventListeners() {
    // AI Job Analysis Button
    aiAnalyzeBtn.addEventListener('click', async () => {
        aiAnalyzeBtn.disabled = true;
        aiAnalyzeBtn.textContent = '🤖 Analyzing...';
        
        try {
            await performAIAnalysis();
            aiAnalyzeBtn.textContent = '✅ Analysis complete!';
            setTimeout(() => {
                aiAnalyzeBtn.textContent = '🤖 AI Job Analysis';
                aiAnalyzeBtn.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('AI analysis error:', error);
            aiAnalyzeBtn.textContent = '❌ Analysis failed';
            setTimeout(() => {
                aiAnalyzeBtn.textContent = '🤖 AI Job Analysis';
                aiAnalyzeBtn.disabled = false;
            }, 2000);
        }
    });

    // AI Optimize Button
    aiOptimizeBtn.addEventListener('click', async () => {
        aiOptimizeBtn.disabled = true;
        aiOptimizeBtn.textContent = '⚡ Optimizing...';
        
        try {
            await performAIOptimization();
            aiOptimizeBtn.textContent = '✅ Optimized!';
            setTimeout(() => {
                aiOptimizeBtn.textContent = '⚡ AI Optimize Application';
                aiOptimizeBtn.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('AI optimization error:', error);
            aiOptimizeBtn.textContent = '❌ Optimization failed';
            setTimeout(() => {
                aiOptimizeBtn.textContent = '⚡ AI Optimize Application';
                aiOptimizeBtn.disabled = false;
            }, 2000);
        }
    });

    // Smart Auto-Fill Button
    autoFillBtn.addEventListener('click', async () => {
        if (!currentProfile) {
            alert('Please upload your resume first');
            return;
        }
        
        autoFillBtn.disabled = true;
        autoFillBtn.textContent = '🎯 AI Filling...';
        
        try {
            await performSmartAutoFill();
            autoFillBtn.textContent = '✅ Fields filled!';
            setTimeout(() => {
                autoFillBtn.textContent = '🎯 Smart Auto-Fill';
                autoFillBtn.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('Auto-fill error:', error);
            autoFillBtn.textContent = '❌ Error occurred';
            setTimeout(() => {
                autoFillBtn.textContent = '🎯 Smart Auto-Fill';
                autoFillBtn.disabled = false;
            }, 2000);
        }
    });
    
    refreshFieldsBtn.addEventListener('click', detectFormFields);
    
    openDashboardBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:3000' });
    });
    
    uploadResumeBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:3000' });
    });
}

// Perform auto-fill operation
async function performAutoFill() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Prepare autofill data
    const autofillData = {
        name: currentProfile.name,
        email: currentProfile.email,
        phone: currentProfile.phone,
        university: currentProfile.university,
        degree: currentProfile.degree,
        skills: currentProfile.skills.join(', '),
        experience: formatExperience(currentProfile.experience),
        cover_letter: await generateCoverLetter()
    };
    
    // Inject autofill script
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: fillFormFields,
        args: [detectedFields, autofillData]
    });
}

// Function to be injected to fill form fields
function fillFormFields(fields, data) {
    fields.forEach(field => {
        try {
            // Find the element
            let element;
            if (field.id) {
                element = document.getElementById(field.id);
            } else if (field.name) {
                element = document.querySelector(`[name="${field.name}"]`);
            } else {
                const elements = document.querySelectorAll(field.selector);
                element = elements[field.index];
            }
            
            if (!element) return;
            
            // Get the appropriate value based on field purpose
            let value = '';
            switch (field.purpose) {
                case 'name': value = data.name; break;
                case 'email': value = data.email; break;
                case 'phone': value = data.phone; break;
                case 'university': value = data.university; break;
                case 'degree': value = data.degree; break;
                case 'skills': value = data.skills; break;
                case 'experience': value = data.experience; break;
                case 'cover_letter': value = data.cover_letter; break;
                default: return;
            }
            
            if (!value) return;
            
            // Fill the field
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Visual feedback
            element.style.backgroundColor = '#d4edda';
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 1000);
            
        } catch (error) {
            console.error('Error filling field:', error);
        }
    });
}

// Helper functions
function formatExperience(experience) {
    if (!experience || experience.length === 0) return '';
    
    return experience.map(exp => 
        `${exp.role || 'Role'} at ${exp.company || 'Company'} (${exp.duration || 'Duration'})`
    ).join('\n');
}

async function generateCoverLetter() {
    // This would call your backend API to generate a cover letter
    // For now, return a simple template
    return `Dear Hiring Manager,

I am excited to apply for this position. With my background in ${currentProfile.degree} from ${currentProfile.university}, I believe I would be a great fit for your team.

My technical skills include ${currentProfile.skills.slice(0, 5).join(', ')}, which align well with the requirements of this role.

Thank you for considering my application.

Best regards,
${currentProfile.name}`;
}

// ==================== AI-POWERED FUNCTIONS ====================

// Perform AI analysis of the current job page
async function performAIAnalysis() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to content script to trigger AI analysis
    try {
        const response = await chrome.tabs.sendMessage(tab.id, { 
            action: 'performAIAnalysis' 
        });
        console.log('AI Analysis initiated:', response);
        return response;
    } catch (error) {
        console.error('AI Analysis failed:', error);
        throw error;
    }
}

// Perform AI optimization
async function performAIOptimization() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to content script to generate optimized application
    try {
        const response = await chrome.tabs.sendMessage(tab.id, { 
            action: 'performAIOptimization',
            profile: currentProfile 
        });
        console.log('AI Optimization completed:', response);
        return response;
    } catch (error) {
        console.error('AI Optimization failed:', error);
        throw error;
    }
}

// Perform smart AI-powered autofill
async function performSmartAutoFill() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Use the AI-powered autofill from content script
    try {
        const response = await chrome.tabs.sendMessage(tab.id, { 
            action: 'performAIAutofill' 
        });
        console.log('Smart AutoFill completed:', response);
        return response;
    } catch (error) {
        console.error('Smart AutoFill failed:', error);
        throw error;
    }
}
