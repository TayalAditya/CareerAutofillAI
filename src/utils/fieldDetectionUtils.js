// Utility functions for field detection

// Enhanced field type mapping with more comprehensive patterns
export const fieldTypeMap = {
  email: {
    keywords: ['email', 'e-mail', 'mail', 'electronic', 'contact-email'],
    patterns: [/@/, /email/i, /mail/i],
    inputTypes: ['email']
  },
  name: {
    keywords: ['name', 'fullname', 'full-name', 'firstname', 'lastname', 'first-name', 'last-name', 'given', 'family', 'applicant'],
    patterns: [/name/i, /first/i, /last/i, /full/i],
    inputTypes: ['text']
  },
  phone: {
    keywords: ['phone', 'telephone', 'mobile', 'contact', 'cell', 'number'],
    patterns: [/phone/i, /tel/i, /mobile/i, /contact/i],
    inputTypes: ['tel', 'phone']
  },
  address: {
    keywords: ['address', 'street', 'city', 'state', 'zip', 'postal', 'location', 'residence'],
    patterns: [/address/i, /street/i, /city/i, /state/i, /zip/i, /postal/i],
    inputTypes: ['text']
  },
  company: {
    keywords: ['company', 'organization', 'employer', 'workplace', 'firm', 'corporation', 'business'],
    patterns: [/company/i, /employer/i, /organization/i, /workplace/i],
    inputTypes: ['text']
  },
  position: {
    keywords: ['position', 'title', 'job', 'role', 'designation', 'occupation'],
    patterns: [/position/i, /title/i, /job/i, /role/i, /designation/i],
    inputTypes: ['text']
  },
  experience: {
    keywords: ['experience', 'years', 'work', 'career', 'professional', 'tenure'],
    patterns: [/experience/i, /years/i, /work/i, /career/i],
    inputTypes: ['text', 'number', 'select']
  },
  skills: {
    keywords: ['skills', 'expertise', 'abilities', 'competencies', 'technologies', 'tools'],
    patterns: [/skills/i, /expertise/i, /abilities/i, /competenc/i],
    inputTypes: ['text', 'textarea']
  },
  education: {
    keywords: ['education', 'degree', 'university', 'college', 'school', 'qualification', 'academic'],
    patterns: [/education/i, /degree/i, /university/i, /college/i, /school/i],
    inputTypes: ['text', 'select']
  },
  website: {
    keywords: ['website', 'url', 'portfolio', 'linkedin', 'github', 'link', 'profile'],
    patterns: [/website/i, /url/i, /portfolio/i, /linkedin/i, /github/i, /http/i],
    inputTypes: ['url', 'text']
  }
};

// Enhanced resume data with more comprehensive information
export const resumeData = {
  name: 'Aditya Tayal',
  email: 'aditya.tayal@example.com',
  phone: '+91-9876543210',
  address: 'New Delhi, India',
  company: 'Tech Solutions Inc.',
  position: 'Senior Software Developer',
  experience: '5+ years',
  skills: 'React, JavaScript, Node.js, Python, AI/ML, Full-Stack Development',
  education: 'B.Tech Computer Science Engineering',
  website: 'https://github.com/AdityaTayal'
};

// Get label text for a field
export const getFieldLabel = (element) => {
  // Try to find associated label by 'for' attribute
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent.trim();
  }
  
  // Try to find parent label
  const parentLabel = element.closest('label');
  if (parentLabel) {
    return parentLabel.textContent.replace(element.value || '', '').trim();
  }
  
  // Try to find preceding label or text
  let sibling = element.previousElementSibling;
  while (sibling) {
    if (sibling.tagName === 'LABEL') {
      return sibling.textContent.trim();
    }
    if (sibling.textContent && sibling.textContent.trim().length > 0 && sibling.textContent.trim().length < 50) {
      return sibling.textContent.trim();
    }
    sibling = sibling.previousElementSibling;
  }
  
  // Try to find nearby text in parent container
  const parent = element.parentElement;
  if (parent) {
    const textNodes = Array.from(parent.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent.trim())
      .filter(text => text.length > 0 && text.length < 50);
    
    if (textNodes.length > 0) {
      return textNodes[0];
    }
    
    // Check for span or div with text before the input
    const textElements = parent.querySelectorAll('span, div, p');
    for (const textEl of textElements) {
      if (textEl.textContent.trim().length > 0 && textEl.textContent.trim().length < 50) {
        return textEl.textContent.trim();
      }
    }
  }
  
  return null;
};

// Generate more robust CSS selector
export const getElementSelector = (element) => {
  if (element.id) return `#${element.id}`;
  if (element.name) return `[name="${element.name}"]`;
  
  // Generate path-based selector with better specificity
  const path = [];
  let current = element;
  
  while (current && current.nodeType === Node.ELEMENT_NODE && path.length < 6) {
    let selector = current.nodeName.toLowerCase();
    
    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    }
    
    if (current.className) {
      const classes = current.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        selector += '.' + classes.slice(0, 2).join('.');
      }
    }
    
    // Add nth-child if needed for specificity
    const siblings = Array.from(current.parentElement?.children || []);
    const sameTagSiblings = siblings.filter(s => s.tagName === current.tagName);
    if (sameTagSiblings.length > 1) {
      const index = sameTagSiblings.indexOf(current) + 1;
      selector += `:nth-child(${index})`;
    }
    
    path.unshift(selector);
    current = current.parentElement;
  }
  
  return path.join(' > ');
};

// Enhanced field analysis with better pattern matching and context awareness
export const analyzeField = (element, sections = []) => {
  const id = element.id?.toLowerCase() || '';
  const name = element.name?.toLowerCase() || '';
  const placeholder = element.placeholder?.toLowerCase() || '';
  const label = getFieldLabel(element)?.toLowerCase() || '';
  const className = element.className?.toLowerCase() || '';
  
  // Get context from parent section
  const parentSection = sections.find(section => 
    section.element.contains(element)
  );
  
  // Include section context in analysis
  const sectionContext = parentSection ? parentSection.type : '';
  const allText = `${id} ${name} ${placeholder} ${label} ${className} ${sectionContext}`;
  
  // Determine field type with improved scoring
  let bestMatch = null;
  let highestConfidence = 0;
  
  for (const [type, config] of Object.entries(fieldTypeMap)) {
    let score = 0;
    let matchDetails = [];
    
    // Keyword matching with context weighting
    const keywordMatches = config.keywords.filter(keyword => {
      if (allText.includes(keyword)) {
        // Give extra weight if keyword matches in label or placeholder
        if (label.includes(keyword) || placeholder.includes(keyword)) {
          score += 25;
          matchDetails.push(`label/placeholder: ${keyword}`);
        } else if (name.includes(keyword) || id.includes(keyword)) {
          score += 20;
          matchDetails.push(`name/id: ${keyword}`);
        } else {
          score += 10;
          matchDetails.push(`context: ${keyword}`);
        }
        return true;
      }
      return false;
    });
    
    // Pattern matching
    const patternMatches = config.patterns.filter(pattern => {
      if (pattern.test(allText)) {
        score += 15;
        matchDetails.push(`pattern: ${pattern}`);
        return true;
      }
      return false;
    });
    
    // Input type matching
    if (config.inputTypes.includes(element.type) || 
        (element.tagName.toLowerCase() === 'select' && config.inputTypes.includes('select')) ||
        (element.tagName.toLowerCase() === 'textarea' && config.inputTypes.includes('textarea'))) {
      score += 20;
      matchDetails.push(`input type: ${element.type}`);
    }
    
    // Section context bonus
    if (parentSection && parentSection.type === 'professional' && 
        ['company', 'position', 'experience'].includes(type)) {
      score += 15;
      matchDetails.push('section context bonus');
    } else if (parentSection && parentSection.type === 'personal' && 
               ['name', 'email', 'phone', 'address'].includes(type)) {
      score += 15;
      matchDetails.push('section context bonus');
    } else if (parentSection && parentSection.type === 'education' && 
               ['education'].includes(type)) {
      score += 15;
      matchDetails.push('section context bonus');
    }
    
    // Avoid misclassification penalties
    if (type === 'name' && (allText.includes('company') || allText.includes('organization'))) {
      score -= 30; // Penalize name classification for company fields
    }
    
    if (type === 'company' && allText.includes('name') && !allText.includes('company')) {
      score -= 10; // Small penalty for company classification without company keyword
    }
    
    const confidence = Math.min(score, 95);
    
    if (confidence > 25 && confidence > highestConfidence) {
      highestConfidence = confidence;
      bestMatch = {
        type,
        confidence,
        matchDetails
      };
    }
  }
  
  const fieldType = bestMatch ? bestMatch.type : 'unknown';
  const finalConfidence = bestMatch ? bestMatch.confidence : 0;
  
  return {
    id: element.id || `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    element: element,
    type: fieldType,
    confidence: finalConfidence,
    label: getFieldLabel(element) || placeholder || name || id,
    value: element.value,
    canFill: fieldType !== 'unknown' && resumeData[fieldType],
    suggestedValue: resumeData[fieldType] || '',
    selector: getElementSelector(element),
    section: parentSection?.type || 'unknown',
    sectionTitle: parentSection?.title || 'Unknown Section',
    matchDetails: bestMatch?.matchDetails || []
  };
};