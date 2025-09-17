import React from 'react';
import AIAutoFillExtension from './components/aiautofill/AIAutoFillExtension';
import DemoForm from './components/demo/DemoForm';

const App = () => {
  const handleHelp = () => {
    console.log('Help clicked');
    alert('Help: This is the AI AutoFill Personal Assistant. Upload your resume to get started!');
  };

  const handleGithub = () => {
    console.log('GitHub clicked');
    window.open('https://github.com/AdityaTayal', '_blank');
  };

  const handleDocs = () => {
    console.log('Docs clicked');
    alert('Documentation: Visit the GitHub repository for detailed documentation.');
  };

  const handleResumeUpload = (file) => {
    console.log('Resume uploaded:', file.name);
  };

  const handleAutoFill = () => {
    console.log('Auto-fill triggered');
  };

  const handleOptimize = () => {
    console.log('Optimize triggered');
  };

  const handleApplyTemplate = () => {
    console.log('Apply template triggered');
  };

  const handleScanFields = () => {
    console.log('Scan fields triggered');
  };

  const handleFeedback = () => {
    console.log('Feedback clicked');
    alert('Thank you for your interest in providing feedback!');
  };

  const handleUpgrade = () => {
    console.log('Upgrade clicked');
    alert('This is a personal project demo. No upgrade available.');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 p-4">
        {/* AI AutoFill Extension */}
        <div className="xl:max-w-4xl">
          <AIAutoFillExtension
            connectionStatus="connected"
            onResumeUpload={handleResumeUpload}
            onAutoFill={handleAutoFill}
            onOptimize={handleOptimize}
            onApplyTemplate={handleApplyTemplate}
            onScanFields={handleScanFields}
            onHelp={handleHelp}
            onGithub={handleGithub}
            onDocs={handleDocs}
            onFeedback={handleFeedback}
            onUpgrade={handleUpgrade}
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