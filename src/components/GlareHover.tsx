import React, { useState } from 'react';

export interface GlareHoverProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number | string;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
  style?: React.CSSProperties;
  borderRadius?: string | number;
}

function parseGlareColor(color: string, opacity: number): string {
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const int = parseInt(hex, 16);
    if (!isNaN(int)) {
      const r = (int >> 16) & 255;
      const g = (int >> 8) & 255;
      const b = int & 255;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  } else if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
  } else if (color.startsWith('rgba(')) {
    return color;
  }
  return `rgba(255, 255, 255, ${opacity})`;
}

export const GlareHover: React.FC<GlareHoverProps> = ({
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.3,
  glareAngle = -30,
  glareSize = 300,
  transitionDuration = 800,
  playOnce = false,
  className = '',
  style,
  borderRadius,
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const rgbaColor = parseGlareColor(glareColor, glareOpacity);
  const sizeValue = typeof glareSize === 'number' ? `${glareSize}%` : glareSize;

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(false);
    onMouseLeave?.(e);
  };

  return (
    <div
      className={`glare-hover relative overflow-hidden ${className}`}
      style={{
        borderRadius,
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}

      {/* Dynamic Glare Light Band */}
      <div
        aria-hidden="true"
        className="glare-hover-overlay pointer-events-none absolute inset-0 z-30 select-none"
        style={{
          borderRadius: borderRadius ?? 'inherit',
          background: `linear-gradient(${glareAngle}deg, transparent 0%, transparent 38%, ${rgbaColor} 50%, transparent 62%, transparent 100%)`,
          backgroundSize: `${sizeValue} ${sizeValue}`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: isHovered ? '100% 100%' : '0% 0%',
          transition: isHovered
            ? `background-position ${transitionDuration}ms cubic-bezier(0.25, 1, 0.5, 1)`
            : playOnce
              ? 'none'
              : `background-position ${transitionDuration}ms ease-out`,
        }}
      />
    </div>
  );
};

export default GlareHover;
