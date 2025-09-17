import React from 'react';
import { HelpCircle, Github, Code } from 'lucide-react';

const NavigationMenu = ({ onHelp, onGithub, onDocs }) => {
  const menuItems = [
    {
      label: 'Help',
      icon: HelpCircle,
      onClick: onHelp || (() => alert('Help coming soon')),
      className: 'text-slate-400 hover:text-slate-300'
    },
    {
      label: 'GitHub',
      icon: Github,
      onClick: onGithub || (() => window.open('https://github.com', '_blank')),
      className: 'text-slate-400 hover:text-slate-300'
    },
    {
      label: 'Docs',
      icon: Code,
      onClick: onDocs || (() => alert('Documentation coming soon')),
      className: 'text-blue-400 hover:text-blue-300 font-medium'
    }
  ];

  return (
    <div className="flex items-center justify-center space-x-6 py-4 border-t border-slate-700">
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={index}
            onClick={item.onClick}
            className={`flex items-center space-x-1 text-sm transition-colors ${item.className}`}
          >
            <Icon size={16} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default NavigationMenu;