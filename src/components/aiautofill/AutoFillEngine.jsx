import React, { useState } from 'react';
import { Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const AutoFillEngine = ({ detectedFields = [], onFillComplete, isActive = false }) => {
  const [fillStatus, setFillStatus] = useState('idle'); // idle, filling, completed, error
  const [fillProgress, setFillProgress] = useState(0);
  const [filledFields, setFilledFields] = useState([]);
  const [fillResults, setFillResults] = useState({ success: 0, failed: 0 });

  // Fill all detected fields with resume data
  const fillAllFields = async () => {
    if (!detectedFields.length) {
      setFillStatus('error');
      return;
    }

    setFillStatus('filling');
    setFillProgress(0);
    setFilledFields([]);
    
    const fillableFields = detectedFields.filter(field => field.canFill);
    const results = { success: 0, failed: 0 };
    const filled = [];

    for (let i = 0; i < fillableFields.length; i++) {
      const field = fillableFields[i];
      const progress = ((i + 1) / fillableFields.length) * 100;
      setFillProgress(progress);

      try {
        const success = await fillField(field);
        if (success) {
          results.success++;
          filled.push({
            ...field,
            fillStatus: 'success',
            filledValue: field.suggestedValue
          });
        } else {
          results.failed++;
          filled.push({
            ...field,
            fillStatus: 'failed',
            error: 'Could not locate field element'
          });
        }
      } catch (error) {
        results.failed++;
        filled.push({
          ...field,
          fillStatus: 'failed',
          error: error.message
        });
      }

      // Add realistic delay between fills
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setFilledFields(filled);
    setFillResults(results);
    setFillStatus('completed');
    
    onFillComplete && onFillComplete({
      totalFields: detectedFields.length,
      fillableFields: fillableFields.length,
      successCount: results.success,
      failedCount: results.failed,
      filledFields: filled
    });
  };

  // Enhanced field filling with better element detection and value setting
  const fillField = async (fieldInfo) => {
    try {
      // Try to find the element using multiple methods with fallbacks
      let element = fieldInfo.element;
      
      // If element reference is stale, try to find it again using multiple strategies
      if (!document.contains(element)) {
        // Try by ID first
        if (fieldInfo.id && fieldInfo.id.startsWith('field_') === false) {
          element = document.getElementById(fieldInfo.id);
        }
        
        // Try by name attribute
        if (!element && fieldInfo.element.name) {
          element = document.querySelector(`[name="${fieldInfo.element.name}"]`);
        }
        
        // Try by selector
        if (!element && fieldInfo.selector) {
          element = document.querySelector(fieldInfo.selector);
        }
        
        // Try by placeholder
        if (!element && fieldInfo.element.placeholder) {
          element = document.querySelector(`[placeholder="${fieldInfo.element.placeholder}"]`);
        }
        
        // Try by type and approximate position
        if (!element) {
          const similarElements = document.querySelectorAll(`${fieldInfo.element.tagName.toLowerCase()}[type="${fieldInfo.element.type}"]`);
          element = Array.from(similarElements).find(el => {
            const label = getFieldLabel(el);
            return label && label.toLowerCase().includes(fieldInfo.type);
          });
        }
      }

      if (!element) {
        throw new Error(`Element not found for field: ${fieldInfo.label}`);
      }

      // Check if element is still fillable
      if (element.disabled || element.readOnly) {
        throw new Error('Element is disabled or readonly');
      }

      // Check if element is visible
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        throw new Error('Element is not visible');
      }

      // Scroll element into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Wait a bit for scroll to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Clear existing value with proper event handling
      const originalValue = element.value;
      element.value = '';
      
      // Focus the element to trigger any event listeners
      element.focus();
      
      // For select elements, handle differently
      if (element.tagName.toLowerCase() === 'select') {
        const options = Array.from(element.options);
        const matchingOption = options.find(option => 
          option.text.toLowerCase().includes(fieldInfo.suggestedValue.toLowerCase()) ||
          option.value.toLowerCase().includes(fieldInfo.suggestedValue.toLowerCase())
        );
        
        if (matchingOption) {
          element.value = matchingOption.value;
        } else {
          // Try to find closest match
          const closeMatch = options.find(option => 
            fieldInfo.suggestedValue.toLowerCase().includes(option.text.toLowerCase()) ||
            option.text.toLowerCase().includes(fieldInfo.suggestedValue.toLowerCase())
          );
          if (closeMatch) {
            element.value = closeMatch.value;
          }
        }
      } else {
        // For input and textarea elements
        element.value = fieldInfo.suggestedValue;
      }
      
      // Trigger comprehensive events to ensure the change is registered by all frameworks
      const events = [
        new Event('input', { bubbles: true, cancelable: true }),
        new Event('change', { bubbles: true, cancelable: true }),
        new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Tab' }),
        new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Tab' }),
        new FocusEvent('blur', { bubbles: true, cancelable: true })
      ];
      
      events.forEach(event => {
        element.dispatchEvent(event);
      });
      
      // Special handling for React and other frameworks
      if (element._valueTracker) {
        element._valueTracker.setValue(originalValue);
      }
      
      // Trigger React's synthetic events if available
      const reactFiberKey = Object.keys(element).find(key => key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber'));
      if (reactFiberKey) {
        const reactInstance = element[reactFiberKey];
        if (reactInstance && reactInstance.memoizedProps && reactInstance.memoizedProps.onChange) {
          reactInstance.memoizedProps.onChange({
            target: element,
            currentTarget: element
          });
        }
      }
      
      // Add enhanced visual feedback with animation
      element.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      element.style.backgroundColor = '#10b981';
      element.style.color = 'white';
      element.style.transform = 'scale(1.02)';
      element.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.3)';
      
      // Add a checkmark indicator
      const checkmark = document.createElement('div');
      checkmark.innerHTML = '✓';
      checkmark.style.cssText = `
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        color: white;
        font-weight: bold;
        font-size: 14px;
        z-index: 1000;
        pointer-events: none;
      `;
      
      const parent = element.parentElement;
      if (parent && parent.style.position !== 'relative') {
        parent.style.position = 'relative';
      }
      parent?.appendChild(checkmark);
      
      setTimeout(() => {
        element.style.backgroundColor = '';
        element.style.color = '';
        element.style.transform = '';
        element.style.boxShadow = '';
        checkmark?.remove();
      }, 1500);

      return true;
    } catch (error) {
      console.error('Error filling field:', error);
      return false;
    }
  };

  // Helper function to get field label (reused from FormFieldDetector)
  const getFieldLabel = (element) => {
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent.trim();
    }
    
    const parentLabel = element.closest('label');
    if (parentLabel) {
      return parentLabel.textContent.replace(element.value || '', '').trim();
    }
    
    return null;
  };

  // Start filling when component becomes active
  React.useEffect(() => {
    if (isActive && detectedFields.length > 0) {
      fillAllFields();
    }
  }, [isActive, detectedFields]);

  const getStatusIcon = () => {
    switch (fillStatus) {
      case 'filling':
        return <Zap size={20} className="text-blue-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-400" />;
      default:
        return <Clock size={20} className="text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (fillStatus) {
      case 'filling':
        return 'Filling form fields...';
      case 'completed':
        return `Filled ${fillResults.success}/${fillResults.success + fillResults.failed} fields`;
      case 'error':
        return 'Error occurred during filling';
      default:
        return 'Ready to fill fields';
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            {getStatusIcon()}
          </div>
          <h3 className="text-slate-100 font-semibold">AutoFill Engine</h3>
        </div>
        <div className="text-xs text-slate-400">
          {getStatusText()}
        </div>
      </div>

      {fillStatus === 'filling' && (
        <div className="mb-4">
          <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
              style={{ width: `${fillProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Filling fields...</span>
            <span>{Math.round(fillProgress)}%</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-blue-400">
            {detectedFields.filter(f => f.canFill).length}
          </div>
          <div className="text-slate-400 text-xs">Fillable</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-400">
            {fillResults.success}
          </div>
          <div className="text-slate-400 text-xs">Success</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-red-400">
            {fillResults.failed}
          </div>
          <div className="text-slate-400 text-xs">Failed</div>
        </div>
      </div>

      {filledFields.length > 0 && (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {filledFields.map((field, index) => (
            <div key={field.id} className="bg-slate-900/50 rounded p-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-200 truncate">
                  {field.label || `Field ${index + 1}`}
                </span>
                <div className="flex items-center space-x-2">
                  {field.fillStatus === 'success' ? (
                    <CheckCircle size={12} className="text-green-400" />
                  ) : (
                    <AlertCircle size={12} className="text-red-400" />
                  )}
                  <span className={`px-2 py-1 rounded text-xs ${
                    field.fillStatus === 'success' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {field.fillStatus === 'success' ? 'Filled' : 'Failed'}
                  </span>
                </div>
              </div>
              {field.fillStatus === 'success' && (
                <div className="text-slate-400 mt-1 truncate">
                  Filled: "{field.filledValue}"
                </div>
              )}
              {field.fillStatus === 'failed' && (
                <div className="text-red-400 mt-1 truncate">
                  Error: {field.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoFillEngine;