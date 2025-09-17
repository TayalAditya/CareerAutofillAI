import React, { useEffect, useState } from 'react';

const AnimatedContainer = ({ 
  children, 
  animation = 'fadeIn',
  delay = 0,
  duration = 600,
  className = '',
  trigger = true
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, delay]);

  const animations = {
    fadeIn: isVisible ? 'animate-fade-in' : 'opacity-0',
    slideIn: isVisible ? 'animate-slide-in' : 'opacity-0 -translate-x-10',
    slideUp: isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-10',
    scaleIn: isVisible ? 'animate-scale-in' : 'opacity-0 scale-95',
    float: isVisible ? 'animate-float' : 'opacity-0',
    bounceGentle: isVisible ? 'animate-bounce-gentle' : 'opacity-0'
  };

  return (
    <div 
      className={`transition-all duration-${duration} ${animations[animation]} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;