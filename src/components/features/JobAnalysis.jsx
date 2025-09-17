import React, { useState } from 'react';
import { BrainCircuit, BarChart3, CircleCheck, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import AnimatedContainer from '../ui/AnimatedContainer';

const JobAnalysis = ({ 
  jobDescription, 
  setJobDescription, 
  onAnalyze, 
  analysisResult, 
  loading, 
  error 
}) => {
  const [charCount, setCharCount] = useState(0);

  const handleTextChange = (e) => {
    const text = e.target.value;
    setJobDescription(text);
    setCharCount(text.length);
  };

  const getMatchScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMatchScoreGradient = (score) => {
    if (score >= 0.8) return 'from-green-500 to-emerald-500';
    if (score >= 0.6) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <AnimatedContainer animation="slideIn" delay={100}>
      <Card variant="glass">
        <Card.Header>
          <div className="text-center">
            <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BrainCircuit size={32} className="text-purple-500" />
            </div>
            <Card.Title className="gradient-text">Job Description Analysis</Card.Title>
            <p className="text-gray-600 mt-2">Paste the job description for AI-powered analysis</p>
          </div>
        </Card.Header>
        
        <Card.Content>
          {!analysisResult ? (
            <div className="space-y-6">
              <div className="relative">
                <textarea
                  value={jobDescription}
                  onChange={handleTextChange}
                  placeholder="Paste the complete job description here..."
                  rows={12}
                  className="w-full p-4 border border-gray-200/50 rounded-xl bg-white/50 backdrop-blur-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {charCount} characters
                </div>
              </div>
              
              <Button
                onClick={onAnalyze}
                disabled={!jobDescription.trim() || loading}
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
              >
                {loading ? 'Analyzing with AI...' : 'Analyze Job Description'}
              </Button>
              
              {loading && (
                <div className="text-center py-8">
                  <LoadingSpinner variant="ai" size="xl" text="AI agents are analyzing the job requirements..." />
                </div>
              )}
            </div>
          ) : (
            <AnimatedContainer animation="scaleIn" delay={200}>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${getMatchScoreGradient(analysisResult.match_score)} p-1 animate-pulse-glow`}>
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${getMatchScoreColor(analysisResult.match_score)}`}>
                            {Math.round(analysisResult.match_score * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">Match</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mt-4">Analysis Complete</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card variant="gradient" className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <CircleCheck className="text-green-500" size={24} />
                      <h4 className="font-semibold text-gray-900">Matching Skills</h4>
                    </div>
                    <div className="space-y-2">
                      {analysisResult.matching_skills?.slice(0, 5).map((skill, i) => (
                        <AnimatedContainer key={i} animation="slideIn" delay={i * 100}>
                          <div className="bg-green-50/50 backdrop-blur-xl px-3 py-2 rounded-lg border border-green-200/50">
                            <span className="text-green-700 font-medium">{skill}</span>
                          </div>
                        </AnimatedContainer>
                      ))}
                    </div>
                  </Card>

                  <Card variant="gradient" className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <AlertCircle className="text-orange-500" size={24} />
                      <h4 className="font-semibold text-gray-900">Skills to Develop</h4>
                    </div>
                    <div className="space-y-2">
                      {analysisResult.missing_skills?.slice(0, 5).map((skill, i) => (
                        <AnimatedContainer key={i} animation="slideIn" delay={i * 100 + 200}>
                          <div className="bg-orange-50/50 backdrop-blur-xl px-3 py-2 rounded-lg border border-orange-200/50">
                            <span className="text-orange-700 font-medium">{skill}</span>
                          </div>
                        </AnimatedContainer>
                      ))}
                    </div>
                  </Card>
                </div>

                <div className="bg-blue-50/30 backdrop-blur-xl rounded-xl p-6 border border-blue-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <BarChart3 className="text-blue-500" size={24} />
                    <h4 className="font-semibold text-gray-900">Key Insights</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{analysisResult.keywords?.length || 0}</div>
                      <div className="text-sm text-gray-600">Keywords Found</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{analysisResult.difficulty_level || 'Medium'}</div>
                      <div className="text-sm text-gray-600">Difficulty Level</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{Math.round(analysisResult.match_score * 100)}%</div>
                      <div className="text-sm text-gray-600">Overall Fit</div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedContainer>
          )}
          
          {error && (
            <AnimatedContainer animation="slideUp" delay={100}>
              <div className="mt-4 p-4 bg-red-50/50 backdrop-blur-xl border border-red-200/50 rounded-xl flex items-center space-x-3">
                <AlertCircle size={20} className="text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            </AnimatedContainer>
          )}
        </Card.Content>
      </Card>
    </AnimatedContainer>
  );
};

export default JobAnalysis;