import React, { useState } from 'react';
import { FileText, Brain, Download, Copy, Check, Zap, Target } from 'lucide-react';

const ResumeTailor = ({ profile, jobData }) => {
  const [generatedBullets, setGeneratedBullets] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedBullets, setSelectedBullets] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleGenerateBullets = async () => {
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockBullets = [
        "Developed AI-powered accessible learning platform using Flask and TensorFlow, improving learning outcomes for 500+ dyslexic students",
        "Built real-time camera enhancement application with TensorFlow and Android SDK, achieving 40% improvement in photo clarity",
        "Implemented vision transformer-based deepfake detection pipeline with 95% accuracy using PyTorch and computer vision techniques",
        "Led technical workshops and mentored 50+ junior students as STAC Core Member, fostering collaborative learning environment",
        "Coordinated coding competitions and hackathons as GCS Core Member, organizing events for 200+ participants",
        "Engineered responsive web applications using React and Next.js, delivering seamless user experiences across multiple platforms"
      ];
      
      setGeneratedBullets(mockBullets);
      setIsGenerating(false);
    }, 2000);
  };

  const toggleBulletSelection = (index) => {
    setSelectedBullets(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const copyBullet = (bullet, index) => {
    navigator.clipboard.writeText(bullet).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const exportSelectedBullets = () => {
    const selected = selectedBullets.map(index => generatedBullets[index]).join('\n• ');
    const content = `Selected Resume Bullets:\n\n• ${selected}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tailored-resume-bullets.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Tailor</h1>
        <p className="text-gray-600">Generate ATS-optimized resume bullets tailored to specific job requirements</p>
      </div>

      {/* Job Context */}
      {jobData && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Target Position</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-semibold text-gray-900">{jobData.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Company</p>
              <p className="font-semibold text-gray-900">{jobData.company}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Key Skills Required</p>
            <div className="flex flex-wrap gap-2">
              {jobData.extractedSkills?.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generate Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Resume Optimization</h2>
          <p className="text-gray-600 mb-6">Generate tailored resume bullets that highlight your relevant experience and match job requirements</p>
          
          <button
            onClick={handleGenerateBullets}
            disabled={isGenerating}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium rounded-xl transition-all mx-auto"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating Tailored Bullets...</span>
              </>
            ) : (
              <>
                <Zap size={20} />
                <span>Generate Resume Bullets</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Bullets */}
      {generatedBullets.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FileText size={24} className="text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Generated Resume Bullets</h2>
            </div>
            {selectedBullets.length > 0 && (
              <button
                onClick={exportSelectedBullets}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
              >
                <Download size={16} />
                <span>Export Selected ({selectedBullets.length})</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {generatedBullets.map((bullet, index) => (
              <div
                key={index}
                className={`p-4 border rounded-xl transition-all cursor-pointer ${
                  selectedBullets.includes(index)
                    ? 'bg-blue-50/50 border-blue-300 shadow-md'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => toggleBulletSelection(index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                      selectedBullets.includes(index)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedBullets.includes(index) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <p className="text-gray-900 leading-relaxed flex-1">{bullet}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyBullet(bullet, index);
                    }}
                    className="ml-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {copiedIndex === index ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50/50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              <strong>Pro Tip:</strong> Select the bullets that best represent your experience and align with the job requirements. 
              These bullets are optimized for ATS systems and include relevant keywords.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeTailor;