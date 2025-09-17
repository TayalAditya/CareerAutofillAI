import React from 'react';
import { Upload, BrainCircuit, BarChart3, CircleCheck } from 'lucide-react';
import AnimatedContainer from '../ui/AnimatedContainer';

const ProgressSteps = ({ currentStep }) => {
  const steps = [
    { id: 'upload', label: 'Upload Resume', icon: Upload },
    { id: 'jobInput', label: 'Job Analysis', icon: BrainCircuit },
    { id: 'analysis', label: 'AI Processing', icon: BarChart3 },
    { id: 'result', label: 'Results', icon: CircleCheck }
  ];

  const getStepStatus = (stepId, index) => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const stepIndex = index;
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 -z-10">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out"
              style={{ 
                width: `${(steps.findIndex(s => s.id === currentStep) / (steps.length - 1)) * 100}%` 
              }}
            />
          </div>
          
          {steps.map((step, index) => {
            const status = getStepStatus(step.id, index);
            const Icon = step.icon;
            
            return (
              <AnimatedContainer 
                key={step.id} 
                animation="scaleIn" 
                delay={index * 100}
                className="flex flex-col items-center"
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative z-10
                  ${status === 'completed' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                    : status === 'active'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg animate-pulse-glow'
                    : 'bg-gray-200 text-gray-400'
                  }
                `}>
                  <Icon size={20} />
                </div>
                <div className="mt-3 text-center">
                  <div className={`
                    text-sm font-medium transition-colors duration-300
                    ${status === 'completed' || status === 'active' 
                      ? 'text-gray-900' 
                      : 'text-gray-500'
                    }
                  `}>
                    {step.label}
                  </div>
                </div>
              </AnimatedContainer>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressSteps;