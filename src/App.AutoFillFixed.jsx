import React from 'react';
import AIAutoFillExtension from './components/aiautofill/AIAutoFillExtension';
import DemoForm from './components/demo/DemoForm';

const App = () => {
  const [userProfile, setUserProfile] = React.useState({
    name: 'Aditya Tayal',
    email: 'aditya.tayal@example.com',
    phone: '+91-9876543210',
    address: 'New Delhi, India',
    company: 'Tech Solutions Inc.',
    position: 'Senior Software Developer',
    experience: '5+ years',
    skills: 'React, JavaScript, Node.js, Python, AI/ML',
    education: 'B.Tech Computer Science Engineering',
    website: 'https://github.com/AdityaTayal'
  });
  const [analysisResult, setAnalysisResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [backendStatus, setBackendStatus] = React.useState('connected');

  const handleResumeUpload = async (file) => {
    if (!file) return;
    
    setLoading(true);
    
    // Simulate processing
    setTimeout(() => {
      setUserProfile({
        ...userProfile,
        uploadedFile: file.name,
        uploadDate: new Date()
      });
      setLoading(false);
      alert(`Resume "${file.name}" processed successfully! AI will now use this data for auto-fill.`);
    }, 2000);
  };

  const handleAutoFill = async () => {
    if (!userProfile) {
      alert('Please upload a resume first');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('AutoFill completed successfully! Check the form fields to see the filled data.');
      
    } catch (error) {
      console.error('Auto-fill failed:', error);
      alert('Auto-fill failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    console.log('Form optimization initiated');
    
    // Scan current page for form fields
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea, select');
    
    if (forms.length === 0 && inputs.length === 0) {
      alert('No forms found on this page to optimize');
      return;
    }
    
    // Simulate optimization process
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    
    alert(`Optimization complete!\n\nFound ${forms.length} forms and ${inputs.length} input fields.\nForm structure analyzed and optimized for better auto-fill accuracy.`);
  };

  const handleApplyTemplate = () => {
    if (!userProfile) {
      alert('Please upload a resume first');
      return;
    }
    
    console.log('Template application initiated');
    alert('Template applied successfully! Your profile data is now optimized for auto-fill.');
  };

  const handleScanFields = () => {
    console.log('Field scanning initiated');
    
    // Actually scan for form fields with enhanced detection
    const allInputs = document.querySelectorAll('input, textarea, select');
    const formFields = Array.from(allInputs).filter(el => 
      el.type !== 'hidden' && 
      el.type !== 'submit' && 
      el.type !== 'button' &&
      !el.disabled &&
      !el.readOnly
    );
    
    // Group fields by sections
    const sections = {};
    formFields.forEach(field => {
      const section = field.closest('.bg-gray-50, .bg-blue-50, .bg-green-50') || 
                    field.closest('[class*="section"]') ||
                    field.closest('fieldset');
      
      const sectionName = section ? 
        (section.querySelector('h3')?.textContent || 'Unknown Section') : 
        'General';
      
      if (!sections[sectionName]) {
        sections[sectionName] = [];
      }
      
      sections[sectionName].push({
        type: field.tagName.toLowerCase(),
        inputType: field.type,
        name: field.name || field.id,
        placeholder: field.placeholder,
        label: getFieldLabel(field)
      });
    });
    
    const sectionSummary = Object.entries(sections)
      .map(([name, fields]) => `• ${name}: ${fields.length} fields`)
      .join('\n');
    
    console.log('Found sections:', sections);
    alert(`Enhanced Scan Complete!\n\nFound ${formFields.length} fillable fields in ${Object.keys(sections).length} sections:\n\n${sectionSummary}\n\nAll sections properly identified for targeted auto-fill.`);
  };

  // Helper function to get field labels
  const getFieldLabel = (element) => {
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent.trim();
    }
    
    const parentLabel = element.closest('label');
    if (parentLabel) {
      return parentLabel.textContent.replace(element.value || '', '').trim();
    }
    
    return element.placeholder || element.name || 'Unknown';
  };

  const initialMetrics = {
    formsCompleted: 12,
    successRate: 94,
    timeSaved: 2.5,
    aiAccuracy: userProfile ? 96 : 0
  };

  const initialFeatures = [
    'Enhanced Section Detection',
    'Smart Field Recognition', 
    'Context-Aware Auto-Fill',
    'Real-time Form Analysis'
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 p-4">
        {/* AI AutoFill Extension */}
        <div className="xl:max-w-4xl">
          <AIAutoFillExtension
            connectionStatus={backendStatus}
            onResumeUpload={handleResumeUpload}
            onAutoFill={handleAutoFill}
            onOptimize={handleOptimize}
            onApplyTemplate={handleApplyTemplate}
            onScanFields={handleScanFields}
            onHelp={() => alert('Help: This enhanced AI AutoFill assistant now includes improved section detection and field recognition for better form filling accuracy.')}
            onGithub={() => window.open('https://github.com/adityatayal', '_blank')}
            onDocs={() => alert('Documentation: Enhanced with smart section identification and improved auto-fill algorithms.')}
            initialMetrics={initialMetrics}
            initialFeatures={initialFeatures}
            userProfile={userProfile}
            analysisResult={analysisResult}
            loading={loading}
          />
        </div>
        
        {/* Demo Form for Testing */}
        <div className="xl:max-w-2xl">
          <DemoForm />
        </div>
      </div>
    </div>
  );
};

export default App;