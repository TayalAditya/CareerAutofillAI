import React, { useState } from 'react';
import { CircleCheck, FileText, Download, Copy, RotateCcw } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import AnimatedContainer from '../ui/AnimatedContainer';
import ProgressBar from '../ui/ProgressBar';

const ApplicationResults = ({ 
  applicationPackage, 
  onRestart, 
  onDownload 
}) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreVariant = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  return (
    <AnimatedContainer animation="fadeIn" delay={200}>
      <div className="space-y-8">
        <div className="text-center">
          <AnimatedContainer animation="scaleIn" delay={300}>
            <div className="bg-green-500/20 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CircleCheck size={48} className="text-green-500" />
            </div>
          </AnimatedContainer>
          <h2 className="text-3xl font-bold gradient-text mb-2">Application Package Ready</h2>
          <p className="text-gray-600 text-lg">Your personalized application materials have been generated using AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AnimatedContainer animation="slideUp" delay={400}>
              <Card variant="glass">
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-blue-500" size={24} />
                      <Card.Title>Tailored Resume Bullets</Card.Title>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(applicationPackage.bullets?.join('\n• '), 'bullets')}
                    >
                      {copiedIndex === 'bullets' ? 'Copied!' : <Copy size={16} />}
                    </Button>
                  </div>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    {applicationPackage.bullets?.map((bullet, i) => (
                      <AnimatedContainer key={i} animation="slideIn" delay={i * 100 + 500}>
                        <div className="group relative bg-white/50 backdrop-blur-xl p-4 rounded-xl border border-gray-200/50 hover:bg-white/70 transition-all duration-300">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-gray-800 leading-relaxed">{bullet}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(bullet, i)}
                          >
                            {copiedIndex === i ? 'Copied!' : <Copy size={14} />}
                          </Button>
                        </div>
                      </AnimatedContainer>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            </AnimatedContainer>

            <AnimatedContainer animation="slideUp" delay={600}>
              <Card variant="glass">
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-purple-500" size={24} />
                      <Card.Title>Personalized Cover Letter</Card.Title>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(applicationPackage.cover_letter, 'cover')}
                    >
                      {copiedIndex === 'cover' ? 'Copied!' : <Copy size={16} />}
                    </Button>
                  </div>
                </Card.Header>
                <Card.Content>
                  <div className="bg-white/50 backdrop-blur-xl p-6 rounded-xl border border-gray-200/50">
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                        {applicationPackage.cover_letter}
                      </p>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </AnimatedContainer>
          </div>

          <div className="space-y-6">
            <AnimatedContainer animation="slideIn" delay={700}>
              <Card variant="glow">
                <Card.Header>
                  <Card.Title>Quality Metrics</Card.Title>
                  <p className="text-gray-600 text-sm mt-1">AI evaluation scores</p>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-6">
                    {[
                      { label: 'Relevance Score', value: applicationPackage.evaluation?.relevance_score || 85 },
                      { label: 'ATS Compatibility', value: applicationPackage.evaluation?.ats_score || 92 },
                      { label: 'Readability', value: applicationPackage.evaluation?.readability_score || 88 }
                    ].map((metric, i) => (
                      <AnimatedContainer key={i} animation="slideIn" delay={i * 100 + 800}>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                            <span className={`text-lg font-bold ${getScoreColor(metric.value)}`}>
                              {metric.value}%
                            </span>
                          </div>
                          <ProgressBar 
                            progress={metric.value} 
                            variant={getScoreVariant(metric.value)}
                            size="sm"
                            animated={true}
                          />
                        </div>
                      </AnimatedContainer>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            </AnimatedContainer>

            <AnimatedContainer animation="slideIn" delay={900}>
              <Card variant="gradient">
                <Card.Content className="p-6">
                  <div className="text-center space-y-4">
                    <h3 className="font-semibold text-gray-900">Ready to Apply?</h3>
                    <p className="text-sm text-gray-600">Download your application package or start a new one</p>
                    <div className="space-y-3">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-full"
                        onClick={onDownload}
                        icon={Download}
                      >
                        Download Package
                      </Button>
                      <Button 
                        variant="outline" 
                        size="md" 
                        className="w-full"
                        onClick={onRestart}
                        icon={RotateCcw}
                      >
                        New Application
                      </Button>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </AnimatedContainer>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default ApplicationResults;