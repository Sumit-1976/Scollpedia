import React from 'react';
import { Link } from 'react-router-dom';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
};

const Logo: React.FC<LogoProps> = ({ size = 'md', animated = false }) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  return (
    <Link to="/" className="flex items-center gap-2">
      <div className={`${dimensions[size]} relative ${animated ? 'logo-scroll' : ''}`}>
        <img 
          src="/assets/logo.png" 
          alt="Scrollpedia Logo" 
          className="w-full h-full object-contain" 
        />
      </div>
      <span className="font-bold text-xl text-primary">Scrollpedia</span>
    </Link>
  );
};

export default Logo;