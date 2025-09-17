import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../ui/Card';

const StatCard = ({ title, value, change, trend, icon: Icon, color, description }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };
  
  const glowClasses = {
    blue: 'shadow-blue-500/25',
    green: 'shadow-green-500/25',
    purple: 'shadow-purple-500/25',
    orange: 'shadow-orange-500/25'
  };
  
  useEffect(() => {
    // Animate number counting
    const numericValue = parseInt(value.toString().replace(/\D/g, ''));
    if (numericValue) {
      let start = 0;
      const duration = 1000;
      const increment = numericValue / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          setAnimatedValue(numericValue);
          clearInterval(timer);
        } else {
          setAnimatedValue(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [value]);
  
  const displayValue = value.toString().includes('%') 
    ? `${animatedValue}%` 
    : value.toString().includes('days')
    ? `${animatedValue} days`
    : animatedValue || value;

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 ${
        isHovered ? `shadow-2xl ${glowClasses[color]} scale-105` : 'hover:shadow-xl'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-current rounded-full -translate-y-10 translate-x-10"></div>
        </div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className={`w-14 h-14 bg-gradient-to-r ${colorClasses[color]} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Icon size={28} className="text-white" />
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
              trend === 'up' 
                ? 'text-green-700 bg-green-100/80' 
                : 'text-red-700 bg-red-100/80'
            }`}>
              {trend === 'up' ? (
                <TrendingUp size={16} className="animate-pulse" />
              ) : (
                <TrendingDown size={16} className="animate-pulse" />
              )}
              <span>{change}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
              {displayValue}
            </p>
            <p className="text-sm font-medium text-gray-700">{title}</p>
            {description && (
              <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
            )}
          </div>
          
          {/* Progress bar for visual appeal */}
          <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-1000 ease-out`}
              style={{ 
                width: `${Math.min(
                  (parseInt(value.toString().replace(/\D/g, '')) || 50) / 100 * 100, 
                  100
                )}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;