import React, { useState, useEffect } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import ScanningProgress from './ScanningProgress';
import SectionCard from './SectionCard';
import FieldCard from './FieldCard';
import DetectionStats from './DetectionStats';
import { analyzeField } from '../../utils/fieldDetectionUtils';
import { identifyFormSections } from '../../utils/sectionDetectionUtils';

const FormFieldDetector = ({ onFieldsDetected, isScanning = false }) => {
  const [detectedFields, setDetectedFields] = useState([]);
  const [detectedSections, setDetectedSections] = useState([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, completed, error

  // Detect form fields and sections from the live DOM
  const detectFormFields = async () => {
    setScanStatus('scanning');
    setScanProgress(0);

    try {
      // 1) Identify sections in the current page
      const rawSections = identifyFormSections();

      // Normalize sections for UI (confidence 0..1)
      const normalizedSections = rawSections.map((s) => ({
        name: s.title || `${s.type?.charAt(0).toUpperCase() + s.type?.slice(1)} Information`,
        id: s.type || 'unknown',
        fieldCount: s.fieldCount ?? 0,
        confidence: (typeof s.confidence === 'number' ? s.confidence : 0) / 100,
        element: s.element
      }));

      setDetectedSections(normalizedSections);

      // 2) Collect candidate inputs
      const inputs = Array.from(
        document.querySelectorAll(
          'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
        )
      );

      if (inputs.length === 0) {
        // No fields on page
        setScanProgress(100);
        setDetectedFields([]);
        setScanStatus('completed');
        onFieldsDetected && onFieldsDetected([]);
        return;
      }

      // 3) Analyze each field with progressive UI
      const analyzed = [];
      for (let i = 0; i < inputs.length; i++) {
        const el = inputs[i];
        try {
          const analysis = analyzeField(el, rawSections);
          // Normalize confidence to 0..1 for UI components
          const confidence = (typeof analysis.confidence === 'number' ? analysis.confidence : 0) / 100;

          analyzed.push({
            // Keep a stable id if available
            id: analysis.id || el.id || `field_${i}`,
            name: el.name || analysis.label || '',
            label: analysis.label || el.placeholder || el.name || el.id || `Field ${i + 1}`,
            type: el.type || 'text',
            fieldType: analysis.type || 'unknown',
            section: analysis.sectionTitle || (analysis.section ? `${analysis.section.charAt(0).toUpperCase()}${analysis.section.slice(1)} Information` : 'Unknown Section'),
            sectionId: analysis.section || 'unknown',
            required: el.required || false,
            confidence,
            canFill: !!analysis.canFill,
            value: analysis.suggestedValue || '',
            suggestedValue: analysis.suggestedValue || '',
            element: el,
            selector: analysis.selector
          });
        } catch (e) {
          // Continue scanning even if one field errors out
          console.warn('Field analysis error:', e);
        }

        // Update progress (up to 95% during scanning)
        const pct = Math.min(95, Math.round(((i + 1) / inputs.length) * 95));
        setScanProgress(pct);
        // Small delay to make progress feel natural and avoid jank
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 20));
      }

      // 4) Finalize scan
      setScanProgress(100);
      setDetectedFields(analyzed);
      setScanStatus('completed');
      onFieldsDetected && onFieldsDetected(analyzed);
    } catch (err) {
      console.error('Form scan failed:', err);
      setScanStatus('error');
    }
  };

  // Start scanning when triggered
  useEffect(() => {
    if (isScanning) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        detectFormFields();
      }, 100);
    }
  }, [isScanning]);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-500/20 p-2 rounded-lg">
            <Search size={20} className="text-cyan-400" />
          </div>
          <h3 className="text-slate-100 font-semibold">Smart Field Detection</h3>
        </div>
        <div className="flex items-center space-x-2">
          {scanStatus === 'scanning' && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400">Scanning...</span>
            </div>
          )}
          {scanStatus === 'completed' && (
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-xs text-slate-400">Complete</span>
            </div>
          )}
        </div>
      </div>

      <ScanningProgress 
        progress={scanProgress} 
        status={scanStatus} 
        message="Analyzing form structure..."
      />

      {/* Sections Overview */}
      {detectedSections.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Detected Sections</h4>
          <div className="grid grid-cols-1 gap-2">
            {detectedSections.map((section, index) => (
              <SectionCard key={index} section={section} index={index} />
            ))}
          </div>
        </div>
      )}

      <DetectionStats 
        sectionsCount={detectedSections.length}
        totalFields={detectedFields.length}
        fillableFields={detectedFields.filter(f => f.canFill).length}
      />

      {detectedFields.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {detectedFields.map((field, index) => (
            <FieldCard key={field.id} field={field} index={index} />
          ))}
        </div>
      )}

      {scanStatus === 'completed' && detectedFields.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Search size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No form fields detected on this page</p>
          <p className="text-xs mt-1">Try navigating to a page with a form</p>
        </div>
      )}
    </div>
  );
};

export default FormFieldDetector;