// content.js - AI-powered content script with proper backend integration
console.log('🚀 Career AutoFill Assistant Pro - AI-powered content script loaded');

// Advanced configuration with AI endpoints
const CONFIG = {
    API_BASE: 'http://localhost:8000',
    AUTO_DETECT_DELAY: 1500,
    FILL_ANIMATION_SPEED: 30,
    CONFIDENCE_THRESHOLD: 0.7,
    MAX_FIELDS_PER_PAGE: 50,
    AI_ENDPOINTS: {
        ANALYZE_JOB: '/ai/analyze-job',
        GENERATE_APP: '/ai/generate-application', 
        GET_PROFILE: '/ai/profile',
        EXTENSION_PROFILE: '/api/extension/profile'
    },
    SUPPORTED_SITES: {
        'linkedin.com': { 
            selectors: ['input[id*="jobs-apply"]', 'textarea[id*="jobs-apply"]'],
            name: 'LinkedIn',
            jobDescriptionSelector: '.jobs-description-content__text'
        },
        'naukri.com': { 
            selectors: ['input[name*="name"]', 'input[name*="email"]'],
            name: 'Naukri',
            jobDescriptionSelector: '.job-description'
        },
        'indeed.com': { 
            selectors: ['input[data-testid*="input"]'],
            name: 'Indeed',
            jobDescriptionSelector: '.jobsearch-jobDescriptionText'
        }
    }
};

// State management with AI integration
let detectedFields = [];
let userProfile = null;
let isAutofillActive = false;
let currentSite = detectCurrentSite();
let currentJobDescription = '';
let aiAnalysis = null;

// Advanced field detection with AI-like pattern matching
class SmartFieldDetector {
    constructor() {
        this.fieldPatterns = {
            name: {
                keywords: ['name', 'full.?name', 'first.?name', 'last.?name', 'candidate.?name'],
                attributes: ['name', 'id', 'placeholder', 'aria-label'],
                confidence: 0.95
            },
            email: {
                keywords: ['email', 'e.?mail', 'contact.?email', 'work.?email'],
                attributes: ['type', 'name', 'id', 'placeholder'],
                confidence: 0.98
            },
            phone: {
                keywords: ['phone', 'mobile', 'tel', 'contact.?number', 'phone.?number'],
                attributes: ['type', 'name', 'id', 'placeholder'],
                confidence: 0.90
            },
            skills: {
                keywords: ['skill', 'technolog', 'expertise', 'competenc', 'programming'],
                attributes: ['name', 'id', 'placeholder', 'aria-label'],
                confidence: 0.85
            },
            experience: {
                keywords: ['experience', 'work.?experience', 'previous.?role', 'job.?history'],
                attributes: ['name', 'id', 'placeholder', 'aria-label'],
                confidence: 0.80
            },
            education: {
                keywords: ['education', 'university', 'college', 'degree', 'qualification'],
                attributes: ['name', 'id', 'placeholder', 'aria-label'],
                confidence: 0.85
            },
            cover_letter: {
                keywords: ['cover.?letter', 'why.?interested', 'motivation', 'message', 'additional.?info'],
                attributes: ['name', 'id', 'placeholder', 'aria-label'],
                confidence: 0.75
            },
            location: {
                keywords: ['location', 'city', 'address', 'country', 'residence'],
                attributes: ['name', 'id', 'placeholder', 'aria-label'],
                confidence: 0.80
            }
        };
    }

    detectFields() {
        const fields = [];
        const selectors = [
            'input[type="text"]',
            'input[type="email"]',
            'input[type="tel"]',
            'input[type="url"]',
            'textarea',
            'select',
            'input:not([type])'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element, index) => {
                if (this.isFieldVisible(element)) {
                    const fieldInfo = this.analyzeField(element, selector, index);
                    if (fieldInfo.confidence > 0.3) {
                        fields.push(fieldInfo);
                    }
                }
            });
        });

        return this.rankFieldsByConfidence(fields);
    }

    isFieldVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && 
               !element.disabled && 
               !element.readOnly &&
               getComputedStyle(element).display !== 'none' &&
               getComputedStyle(element).visibility !== 'hidden';
    }

    analyzeField(element, selector, index) {
        const fieldInfo = {
            element: element,
            selector: selector,
            index: index,
            id: element.id,
            name: element.name,
            placeholder: element.placeholder || '',
            label: this.getFieldLabel(element),
            type: element.type || element.tagName.toLowerCase(),
            value: element.value,
            purpose: 'unknown',
            confidence: 0,
            position: element.getBoundingClientRect()
        };

        // Advanced purpose detection
        fieldInfo.purpose = this.determinePurpose(fieldInfo);
        fieldInfo.confidence = this.calculateConfidence(fieldInfo);

        return fieldInfo;
    }

    getFieldLabel(element) {
        // Multiple strategies to find field labels
        let label = '';

        // Strategy 1: Associated label elements
        if (element.labels && element.labels.length > 0) {
            label = element.labels[0].textContent.trim();
        }

        // Strategy 2: Label with 'for' attribute
        if (!label && element.id) {
            const labelEl = document.querySelector(`label[for="${element.id}"]`);
            if (labelEl) label = labelEl.textContent.trim();
        }

        // Strategy 3: Placeholder or aria-label
        if (!label) {
            label = element.placeholder || element.getAttribute('aria-label') || '';
        }

        // Strategy 4: Parent element text
        if (!label) {
            const parent = element.closest('div, fieldset, section');
            if (parent) {
                const text = parent.textContent.replace(element.value, '').trim();
                if (text.length < 100) label = text;
            }
        }

        // Strategy 5: Previous sibling text
        if (!label) {
            let sibling = element.previousElementSibling;
            while (sibling && !label) {
                if (sibling.textContent.trim().length < 50) {
                    label = sibling.textContent.trim();
                    break;
                }
                sibling = sibling.previousElementSibling;
            }
        }

        return label;
    }

    determinePurpose(fieldInfo) {
        const searchText = (
            fieldInfo.label + ' ' + 
            fieldInfo.name + ' ' + 
            fieldInfo.placeholder + ' ' + 
            fieldInfo.id + ' ' +
            (fieldInfo.element.getAttribute('aria-label') || '')
        ).toLowerCase();

        let bestMatch = 'unknown';
        let highestScore = 0;

        Object.entries(this.fieldPatterns).forEach(([purpose, pattern]) => {
            let score = 0;
            
            pattern.keywords.forEach(keyword => {
                const regex = new RegExp(keyword, 'i');
                if (regex.test(searchText)) {
                    score += 1;
                }
            });

            // Bonus for exact type matches
            if (purpose === 'email' && fieldInfo.type === 'email') score += 2;
            if (purpose === 'phone' && fieldInfo.type === 'tel') score += 2;

            if (score > highestScore) {
                highestScore = score;
                bestMatch = purpose;
            }
        });

        return bestMatch;
    }

    calculateConfidence(fieldInfo) {
        const basePurpose = this.fieldPatterns[fieldInfo.purpose];
        if (!basePurpose) return 0.2;

        let confidence = basePurpose.confidence;

        // Adjust based on field type matches
        if (fieldInfo.purpose === 'email' && fieldInfo.type === 'email') confidence += 0.05;
        if (fieldInfo.purpose === 'phone' && fieldInfo.type === 'tel') confidence += 0.05;

        // Adjust based on label quality
        if (fieldInfo.label.length > 0) confidence += 0.1;
        if (fieldInfo.label.length > 10) confidence += 0.05;

        // Site-specific adjustments
        if (currentSite && currentSite.name) confidence += 0.05;

        return Math.min(confidence, 1.0);
    }

    rankFieldsByConfidence(fields) {
        return fields.sort((a, b) => b.confidence - a.confidence);
    }
}

// Advanced autofill engine
class SmartAutofillEngine {
    constructor() {
        this.detector = new SmartFieldDetector();
    }

    async performAutofill() {
        if (!userProfile) {
            this.showNotification('Please upload your resume first!', 'error');
            return;
        }

        const fields = this.detector.detectFields();
        if (fields.length === 0) {
            this.showNotification('No fillable fields found on this page', 'error');
            return;
        }

        // Show autofill modal
        this.showAutofillModal(fields);
    }

    showAutofillModal(fields) {
        const modal = this.createModal(fields);
        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('.career-autofill-btn-primary').addEventListener('click', () => {
            this.startAutofill(fields);
            document.body.removeChild(modal);
        });

        modal.querySelector('.career-autofill-btn-secondary').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    createModal(fields) {
        const overlay = document.createElement('div');
        overlay.className = 'career-autofill-overlay';

        const modal = document.createElement('div');
        modal.className = 'career-autofill-modal';

        const highConfidenceFields = fields.filter(f => f.confidence > CONFIG.CONFIDENCE_THRESHOLD);
        const lowConfidenceFields = fields.filter(f => f.confidence <= CONFIG.CONFIDENCE_THRESHOLD);

        modal.innerHTML = `
            <div class="career-autofill-header">
                <h2 class="career-autofill-title">🚀 Smart AutoFill Ready</h2>
                <p class="career-autofill-subtitle">AI detected ${fields.length} fields on this page</p>
            </div>
            
            <div class="career-autofill-field-list">
                <h4 style="margin: 0 0 10px 0; color: #28a745;">✅ High Confidence Fields (${highConfidenceFields.length})</h4>
                ${highConfidenceFields.map(field => `
                    <div class="career-autofill-field-item">
                        <span class="career-autofill-field-name">${field.label || field.name || 'Field'} (${field.purpose})</span>
                        <span class="career-autofill-confidence">${Math.round(field.confidence * 100)}%</span>
                    </div>
                `).join('')}
                
                ${lowConfidenceFields.length > 0 ? `
                    <h4 style="margin: 15px 0 10px 0; color: #ffc107;">⚠️ Medium Confidence Fields (${lowConfidenceFields.length})</h4>
                    ${lowConfidenceFields.map(field => `
                        <div class="career-autofill-field-item">
                            <span class="career-autofill-field-name">${field.label || field.name || 'Field'} (${field.purpose})</span>
                            <span class="career-autofill-confidence" style="background: #ffc107;">${Math.round(field.confidence * 100)}%</span>
                        </div>
                    `).join('')}
                ` : ''}
            </div>
            
            <div class="career-autofill-buttons">
                <button class="career-autofill-btn career-autofill-btn-primary">
                    🤖 Auto-Fill All Fields (${fields.length})
                </button>
                <button class="career-autofill-btn career-autofill-btn-secondary">
                    ❌ Cancel
                </button>
            </div>
        `;

        overlay.appendChild(modal);
        return overlay;
    }

    async startAutofill(fields) {
        isAutofillActive = true;
        this.showNotification(`Starting autofill for ${fields.length} fields...`);

        const progress = this.createProgressBar();
        document.body.appendChild(progress);

        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            
            // Update progress
            this.updateProgress(progress, (i / fields.length) * 100);
            
            await this.fillField(field);
            await this.delay(CONFIG.FILL_ANIMATION_SPEED);
        }

        this.updateProgress(progress, 100);
        
        setTimeout(() => {
            document.body.removeChild(progress);
            this.showNotification(`✅ Successfully filled ${fields.length} fields!`);
            isAutofillActive = false;
        }, 500);
    }

    async fillField(field) {
        const value = this.getValueForField(field);
        if (!value) return;

        const element = field.element;
        
        // Highlight field
        element.classList.add('career-autofill-highlight');
        
        // Add field label
        this.addFieldLabel(element, field.purpose);
        
        // Focus and clear
        element.focus();
        element.value = '';
        
        // Simulate typing
        await this.simulateTyping(element, value);
        
        // Mark as filled
        element.classList.remove('career-autofill-highlight');
        element.classList.add('career-autofill-filled');
        
        // Remove visual indicators after delay
        setTimeout(() => {
            element.classList.remove('career-autofill-filled');
            this.removeFieldLabel(element);
        }, 2000);
    }

    getValueForField(field) {
        if (!userProfile) return '';

        const valueMap = {
            name: userProfile.name,
            email: userProfile.email,
            phone: userProfile.phone,
            university: userProfile.university,
            degree: userProfile.degree,
            skills: userProfile.skills ? userProfile.skills.join(', ') : '',
            experience: this.formatExperience(userProfile.experience),
            cover_letter: this.generateCoverLetter(),
            location: userProfile.location || ''
        };

        return valueMap[field.purpose] || '';
    }

    formatExperience(experience) {
        if (!experience || !Array.isArray(experience)) return '';
        
        return experience.map(exp => 
            `${exp.role || 'Role'} at ${exp.company || 'Company'} (${exp.duration || 'Duration'})`
        ).join('\n');
    }

    generateCoverLetter() {
        if (!userProfile) return '';
        
        return `Dear Hiring Manager,

I am excited to apply for this position. With my background in ${userProfile.degree || 'my field'} from ${userProfile.university || 'university'}, I believe I would be a valuable addition to your team.

My technical skills include ${userProfile.skills ? userProfile.skills.slice(0, 5).join(', ') : 'various technologies'}, which align well with the requirements of this role.

Thank you for considering my application.

Best regards,
${userProfile.name || 'Candidate'}`;
    }

    async simulateTyping(element, value) {
        for (let i = 0; i < value.length; i++) {
            element.value += value[i];
            element.dispatchEvent(new Event('input', { bubbles: true }));
            await this.delay(Math.random() * 50 + 20); // Random typing speed
        }
        
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.blur();
    }

    addFieldLabel(element, purpose) {
        const label = document.createElement('div');
        label.className = 'career-autofill-field-label';
        label.textContent = purpose.replace('_', ' ').toUpperCase();
        label.setAttribute('data-field-id', element.id || element.name || 'field');
        
        element.style.position = 'relative';
        element.parentElement.style.position = 'relative';
        element.parentElement.appendChild(label);
    }

    removeFieldLabel(element) {
        const label = element.parentElement.querySelector('.career-autofill-field-label');
        if (label) {
            label.remove();
        }
    }

    createProgressBar() {
        const container = document.createElement('div');
        container.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; z-index: 999999; background: white; padding: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                    <div class="career-autofill-spinner"></div>
                    <span style="font-weight: 600; color: #333;">AutoFilling fields...</span>
                </div>
                <div class="career-autofill-progress">
                    <div class="career-autofill-progress-bar" style="width: 0%;"></div>
                </div>
            </div>
        `;
        return container;
    }

    updateProgress(progressContainer, percentage) {
        const bar = progressContainer.querySelector('.career-autofill-progress-bar');
        if (bar) {
            bar.style.width = percentage + '%';
        }
    }

    showNotification(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `career-autofill-toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 4000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Utility functions
function detectCurrentSite() {
    const hostname = window.location.hostname.toLowerCase();
    
    for (const [site, config] of Object.entries(CONFIG.SUPPORTED_SITES)) {
        if (hostname.includes(site)) {
            return config;
        }
    }
    
    return null;
}

async function loadUserProfile() {
    try {
        const result = await chrome.storage.local.get(['userProfile']);
        if (result.userProfile) {
            userProfile = result.userProfile;
            console.log('✅ User profile loaded:', userProfile.name);
            return true;
        }
    } catch (error) {
        console.error('❌ Error loading profile:', error);
    }
    return false;
}

function showSmartIndicator(fieldCount) {
    if (document.getElementById('career-autofill-smart-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.id = 'career-autofill-smart-indicator';
    indicator.className = 'career-autofill-smart-indicator';
    indicator.innerHTML = `
        🚀 ${fieldCount} fields detected • Click to AutoFill
        ${currentSite ? ` • ${currentSite.name} detected` : ''}
    `;
    
    indicator.addEventListener('click', () => {
        const engine = new SmartAutofillEngine();
        engine.performAutofill();
    });
    
    document.body.appendChild(indicator);
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }, 8000);
}

// ==================== AI-POWERED INTEGRATION FUNCTIONS ====================

// AI Job Description Analysis
async function analyzeJobDescription() {
    const jobDescription = extractJobDescription();
    if (!jobDescription) {
        console.log('⚠️ No job description found on this page');
        return null;
    }

    try {
        console.log('🤖 Analyzing job description with AI...');
        
        const response = await fetch(`${CONFIG.API_BASE}${CONFIG.AI_ENDPOINTS.ANALYZE_JOB}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                job_description: jobDescription,
                company_name: extractCompanyName(),
                role_title: extractRoleTitle()
            })
        });

        if (response.ok) {
            aiAnalysis = await response.json();
            console.log('✅ AI Analysis complete:', aiAnalysis);
            
            // Show AI insights
            showAIInsights(aiAnalysis);
            
            return aiAnalysis;
        } else {
            console.error('❌ AI analysis failed:', response.status);
            return null;
        }
    } catch (error) {
        console.error('❌ AI analysis error:', error);
        return null;
    }
}

// Extract job description from page
function extractJobDescription() {
    const site = CONFIG.SUPPORTED_SITES[window.location.hostname];
    if (site && site.jobDescriptionSelector) {
        const element = document.querySelector(site.jobDescriptionSelector);
        if (element) {
            return element.innerText || element.textContent;
        }
    }

    // Fallback: look for common job description patterns
    const selectors = [
        '.job-description',
        '.jobs-description',
        '.jobsearch-jobDescriptionText',
        '[data-testid="job-description"]',
        '.description',
        '.content'
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.innerText && element.innerText.length > 100) {
            return element.innerText;
        }
    }

    return null;
}

// AI-powered autofill function
async function performAIAutofill() {
    try {
        // Get user profile from backend
        const profileResponse = await fetch(`${CONFIG.API_BASE}${CONFIG.AI_ENDPOINTS.EXTENSION_PROFILE}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            userProfile = profileData.profile;
            
            console.log('✅ AI Profile loaded:', userProfile);
            
            // Perform smart autofill
            const engine = new SmartAutofillEngine();
            await engine.performAutofill();
            
        } else {
            console.error('❌ Failed to load profile');
        }
    } catch (error) {
        console.error('❌ AI autofill error:', error);
    }
}

// Show AI insights in a floating panel
function showAIInsights(analysis) {
    // Remove existing panel
    const existing = document.getElementById('ai-insights-panel');
    if (existing) {
        existing.remove();
    }

    const panel = document.createElement('div');
    panel.id = 'ai-insights-panel';
    panel.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            width: 320px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            animation: slideIn 0.3s ease-out;
        ">
            <style>
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 18px;">🤖 AI Job Analysis</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; opacity: 0.7; transition: opacity 0.2s;"
                        onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">×</button>
            </div>
            
            <div style="margin-bottom: 12px;">
                <strong>📊 Match Score:</strong> 
                <span style="
                    background: ${analysis.match_score > 0.7 ? '#4CAF50' : analysis.match_score > 0.5 ? '#FF9800' : '#F44336'};
                    padding: 3px 10px;
                    border-radius: 15px;
                    font-weight: bold;
                    margin-left: 5px;
                ">${(analysis.match_score * 100).toFixed(1)}%</span>
            </div>
            
            <div style="margin-bottom: 12px;">
                <strong>✅ Matching Skills:</strong><br>
                <div style="margin-top: 5px;">
                    ${analysis.matching_skills.slice(0, 4).map(skill => 
                        `<span style="background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 10px; margin: 2px 3px 2px 0; display: inline-block; font-size: 12px;">${skill}</span>`
                    ).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>⚠️ Missing Skills:</strong><br>
                <div style="margin-top: 5px;">
                    ${analysis.missing_skills.slice(0, 3).map(skill => 
                        `<span style="background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 10px; margin: 2px 3px 2px 0; display: inline-block; font-size: 12px; border: 1px solid rgba(255,255,255,0.2);">${skill}</span>`
                    ).join('')}
                </div>
            </div>
            
            <button onclick="performAIAutofill()" style="
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                border: none;
                padding: 12px 18px;
                border-radius: 8px;
                cursor: pointer;
                width: 100%;
                font-weight: bold;
                font-size: 14px;
                transition: transform 0.2s, box-shadow 0.2s;
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(76, 175, 80, 0.4)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(76, 175, 80, 0.3)'">
                🎯 AI-Powered AutoFill
            </button>
        </div>
    `;

    document.body.appendChild(panel);

    // Auto-hide after 45 seconds
    setTimeout(() => {
        if (document.getElementById('ai-insights-panel')) {
            panel.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => panel.remove(), 300);
        }
    }, 45000);

    console.log('✅ AI Insights panel displayed');
}

// Make function globally available
window.performAIAutofill = performAIAutofill;

// Main initialization
async function initializeExtension() {
    console.log('🚀 Initializing Career AutoFill Assistant Pro...');
    
    // Load user profile
    await loadUserProfile();
    
    // Wait for page to fully load
    setTimeout(async () => {
        const detector = new SmartFieldDetector();
        detectedFields = detector.detectFields();
        
        if (detectedFields.length > 0) {
            console.log(`✅ Detected ${detectedFields.length} fields on ${window.location.hostname}`);
            
            // Show smart indicator
            showSmartIndicator(detectedFields.length);
            
            // Send message to background script
            try {
                chrome.runtime.sendMessage({
                    action: 'fieldsDetected',
                    count: detectedFields.length,
                    url: window.location.href,
                    site: currentSite?.name || 'Unknown'
                });
            } catch (error) {
                console.log('Message send failed:', error);
            }
        }
        
        // Auto-analyze job description if on a job page
        if (extractJobDescription()) {
            console.log('🔍 Job description detected, starting AI analysis...');
            setTimeout(() => {
                analyzeJobDescription();
            }, 2000);
        }
    }, CONFIG.AUTO_DETECT_DELAY);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📩 Message received:', request);
    
    switch (request.action) {
        case 'performAutofill':
            const engine = new SmartAutofillEngine();
            engine.performAutofill();
            sendResponse({ success: true });
            break;
            
        case 'performAIAnalysis':
            analyzeJobDescription().then(result => {
                sendResponse({ success: true, analysis: result });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true; // Keep message channel open for async response
            
        case 'performAIAutofill':
            performAIAutofill().then(result => {
                sendResponse({ success: true, result });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true; // Keep message channel open for async response
            
        case 'performAIOptimization':
            // For now, just perform AI autofill as optimization
            performAIAutofill().then(result => {
                sendResponse({ success: true, result, message: 'Application optimized with AI' });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true; // Keep message channel open for async response
            
        case 'getDetectedFields':
            sendResponse({ fields: detectedFields });
            break;
            
        case 'profileUpdated':
            userProfile = request.profile;
            console.log('✅ Profile updated');
            sendResponse({ success: true });
            break;
            
        default:
            sendResponse({ success: false, error: 'Unknown action' });
    }
});

// Initialize when page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}

console.log('🎉 Career AutoFill Assistant Pro content script ready!');
