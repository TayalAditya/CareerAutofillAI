import React, { useState } from 'react';
import { Mail, Wand2, Copy, Download, RefreshCw, Sparkles, Target } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { CoverLetterTone } from '../../careerCopilotMockData';

const CoverLetterGenerator = ({ profile, jobData }) => {
  const [selectedTone, setSelectedTone] = useState(CoverLetterTone.PROFESSIONAL);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [letterStats, setLetterStats] = useState(null);
  const { toast } = useToast();

  const tones = [
    { 
      value: CoverLetterTone.PROFESSIONAL, 
      label: 'Professional', 
      description: 'Formal and business-appropriate',
      color: 'primary'
    },
    { 
      value: CoverLetterTone.ENTHUSIASTIC, 
      label: 'Enthusiastic', 
      description: 'Energetic and passionate',
      color: 'success'
    },
    { 
      value: CoverLetterTone.CREATIVE, 
      label: 'Creative', 
      description: 'Unique and innovative approach',
      color: 'gradient'
    },
    { 
      value: CoverLetterTone.FORMAL, 
      label: 'Formal', 
      description: 'Traditional and conservative',
      color: 'default'
    }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobData?.title || 'Software Engineering Intern'} position at ${jobData?.company || 'your company'}. As a Computer Science student at IIT Mandi with a passion for AI and machine learning, I am excited about the opportunity to contribute to your innovative team.

During my academic journey, I have developed several impactful projects that align perfectly with your requirements. My work on DyslexoFly, an AI-powered accessible learning platform, demonstrates my ability to combine technical expertise with social impact. Using Flask, TensorFlow, and React, I created a solution that has improved learning outcomes for over 500 dyslexic students. This project showcases my proficiency in the Python and machine learning technologies mentioned in your job description.

Additionally, my experience as a STAC Core Member has honed my leadership and mentoring skills, where I've guided 50+ junior students through technical workshops. My role as GCS Core Member further developed my project management abilities while organizing coding competitions for 200+ participants.

I am particularly drawn to ${jobData?.company || 'your company'} because of your commitment to innovation and technological excellence. I am confident that my technical skills, combined with my passion for creating meaningful solutions, would make me a valuable addition to your team.

Thank you for considering my application. I look forward to the opportunity to discuss how my background and enthusiasm can contribute to your team's success.

Sincerely,
Aditya Tayal`;

      setGeneratedLetter(mockLetter);
      setLetterStats({
        wordCount: mockLetter.split(' ').length,
        readingTime: Math.ceil(mockLetter.split(' ').length / 200),
        atsScore: 0.92,
        keywordMatch: 0.87
      });
      setIsGenerating(false);
      toast.success('Cover letter generated successfully!');
    }, 2500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    toast.success('Cover letter copied to clipboard!');
  };

  const downloadLetter = () => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${jobData?.company || 'application'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Cover letter downloaded!');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cover Letter Generator</h1>
        <p className="text-gray-600">Create personalized, ATS-optimized cover letters tailored to specific job applications</p>
      </div>

      {/* Job Context */}
      {jobData && (
        <Card variant="gradient" className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Target Position</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-semibold text-gray-900">{jobData.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Company</p>
              <p className="font-semibold text-gray-900">{jobData.company}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Match Score</p>
              <Badge variant="success">{Math.round(jobData.matchScore * 100)}%</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Configuration */}
      <Card>
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <Wand2 size={24} className="text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Customize Your Letter</h2>
          </div>

          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Writing Tone</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {tones.map((tone) => (
                <button
                  key={tone.value}
                  onClick={() => setSelectedTone(tone.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedTone === tone.value
                      ? 'border-blue-500 bg-blue-50/50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{tone.label}</h3>
                    {selectedTone === tone.value && (
                      <Sparkles size={16} className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{tone.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Instructions (Optional)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Emphasize my leadership experience, mention specific projects, highlight remote work capabilities..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            loading={isGenerating}
            size="lg"
            className="w-full"
            icon={Wand2}
          >
            {isGenerating ? 'Crafting Your Perfect Letter...' : 'Generate Cover Letter'}
          </Button>
        </div>
      </Card>

      {/* Generated Letter */}
      {generatedLetter && (
        <Card className="animate-scale-in">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail size={24} className="text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Generated Cover Letter</h2>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  icon={Copy}
                >
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadLetter}
                  icon={Download}
                >
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerate}
                  icon={RefreshCw}
                >
                  Regenerate
                </Button>
              </div>
            </div>

            {/* Stats */}
            {letterStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-green-50/50 to-blue-50/50 rounded-xl border border-green-200/50">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{letterStats.wordCount}</p>
                  <p className="text-sm text-gray-600">Words</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{letterStats.readingTime}m</p>
                  <p className="text-sm text-gray-600">Read Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{Math.round(letterStats.atsScore * 100)}%</p>
                  <p className="text-sm text-gray-600">ATS Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{Math.round(letterStats.keywordMatch * 100)}%</p>
                  <p className="text-sm text-gray-600">Keyword Match</p>
                </div>
              </div>
            )}

            {/* Letter Content */}
            <div className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl p-6">
              <div className="prose prose-gray max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                  {generatedLetter}
                </pre>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50/50 border border-yellow-200/50 rounded-xl p-4">
              <h3 className="font-medium text-yellow-800 mb-2">💡 Pro Tips</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Review and personalize the letter before sending</li>
                <li>• Ensure all company and position details are accurate</li>
                <li>• Consider adding specific examples from your experience</li>
                <li>• Keep the letter concise and focused (under 400 words)</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CoverLetterGenerator;