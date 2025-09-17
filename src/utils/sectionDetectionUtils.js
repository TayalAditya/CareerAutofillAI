import { Users, Briefcase, GraduationCap } from 'lucide-react';

// Section identification patterns with improved specificity
export const sectionPatterns = {
  personal: {
    keywords: ['personal', 'contact', 'basic', 'individual', 'applicant', 'bio'],
    icon: Users,
    color: 'blue',
    priority: 1
  },
  professional: {
    keywords: ['professional', 'work', 'career', 'employment', 'job', 'experience', 'current'],
    icon: Briefcase,
    color: 'green',
    priority: 2
  },
  education: {
    keywords: ['education', 'academic', 'qualification', 'degree', 'school', 'university', 'additional'],
    icon: GraduationCap,
    color: 'purple',
    priority: 3
  }
};

// Remove duplicate sections based on DOM hierarchy and content similarity
export const deduplicateSections = (sections) => {
  const uniqueSections = [];
  const processedElements = new Set();
  
  // Sort by confidence and priority
  const sortedSections = sections.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.confidence - a.confidence;
  });
  
  for (const section of sortedSections) {
    // Skip if this element or its parent has already been processed
    if (processedElements.has(section.element)) continue;
    
    // Check if this section is a child of an already processed section
    const isChildOfProcessed = Array.from(processedElements).some(processedEl => 
      processedEl.contains(section.element)
    );
    
    if (isChildOfProcessed) continue;
    
    // Check for similar sections (same type and similar content)
    const hasSimilar = uniqueSections.some(existing => 
      existing.type === section.type && 
      Math.abs(existing.fieldCount - section.fieldCount) <= 1 &&
      existing.title.toLowerCase().includes(section.type) &&
      section.title.toLowerCase().includes(section.type)
    );
    
    if (!hasSimilar) {
      uniqueSections.push(section);
      processedElements.add(section.element);
      
      // Mark all child elements as processed to avoid nested duplicates
      const childSections = section.element.querySelectorAll('div, fieldset, section');
      childSections.forEach(child => processedElements.add(child));
    }
  }
  
  return uniqueSections;
};

// Analyze section element with improved detection
export const analyzeSectionElement = (element) => {
  const textContent = element.textContent?.toLowerCase() || '';
  const className = element.className?.toLowerCase() || '';
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headingText = Array.from(headings).map(h => h.textContent.toLowerCase()).join(' ');
  
  const allText = `${textContent} ${className} ${headingText}`;
  
  let bestMatch = null;
  let highestScore = 0;
  
  for (const [sectionType, config] of Object.entries(sectionPatterns)) {
    let score = 0;
    let matchedKeywords = 0;
    
    // Check for keyword matches with weighted scoring
    config.keywords.forEach((keyword, index) => {
      if (allText.includes(keyword)) {
        matchedKeywords++;
        // Give higher weight to more specific keywords (later in array)
        score += (index + 1) * 10;
      }
    });
    
    // Bonus for heading matches
    if (headingText.includes(sectionType)) {
      score += 20;
    }
    
    // Bonus for class name matches
    if (className.includes(sectionType)) {
      score += 15;
    }
    
    // Calculate confidence as percentage
    const confidence = Math.min((score / 50) * 100, 95);
    
    if (confidence > 20 && confidence > highestScore) {
      highestScore = confidence;
      bestMatch = {
        type: sectionType,
        element: element,
        confidence: confidence,
        title: headings[0]?.textContent || `${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} Information`,
        fieldCount: element.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select').length,
        icon: config.icon,
        color: config.color,
        priority: config.priority,
        matchedKeywords: matchedKeywords
      };
    }
  }
  
  return bestMatch;
};

// Identify form sections with improved logic
export const identifyFormSections = () => {
  const sections = [];
  
  // Look for section containers with priority order
  const sectionSelectors = [
    'fieldset',
    '.form-section',
    '[class*="section"]',
    '.bg-gray-50',
    '.bg-blue-50', 
    '.bg-green-50',
    'div[class*="p-4"]',
    '.section'
  ];
  
  sectionSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      // Skip if element has no form fields
      const hasFormFields = element.querySelectorAll('input, textarea, select').length > 0;
      if (!hasFormFields) return;
      
      const sectionInfo = analyzeSectionElement(element);
      if (sectionInfo) {
        sections.push(sectionInfo);
      }
    });
  });
  
  // Remove duplicates and return clean list
  return deduplicateSections(sections);
};