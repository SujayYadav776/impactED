import React, { useRef, useState, useEffect, useCallback } from 'react';

export interface SpecularButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | string;
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const SpecularButton: React.FC<SpecularButtonProps> = ({
  children,
  size = 'md',
  radius = 18,
  tint = '#ffffff',
  tintOpacity = 0,
  blur = 0,
  textColor = '#f5f5f5',
  lineColor = '#ffffff',
  baseColor = '#525252',
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  className = '',
  style,
  onClick,
  disabled = false,
  type = 'button',
  ...rest
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [angle, setAngle] = useState(0);
  const [activeFactor, setActiveFactor] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Size styling classes
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-xs sm:text-sm font-semibold tracking-wider uppercase',
  }[size as 'sm' | 'md' | 'lg'] || 'px-6 py-2.5 text-sm';

  // Animation frame handler
  useEffect(() => {
    if (!autoAnimate) return;

    let animId: number;
    let currentAngle = angle;

    const animate = () => {
      currentAngle = (currentAngle + speed * 3) % 360;
      setAngle(currentAngle);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [autoAnimate, speed]);

  // Global mouse move tracking for proximity and followMouse
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!buttonRef.current || autoAnimate) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Distance from cursor to button boundary
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const edgeDist = Math.hypot(dx, dy);

      if (followMouse && edgeDist <= proximity) {
        // Calculate angle towards mouse
        const mouseAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
        const normalizedAngle = (mouseAngle + 360) % 360;
        setAngle(normalizedAngle);

        // Proximity factor (1 when at edge or inside, fading to 0 at proximity radius)
        const factor = Math.max(0, 1 - edgeDist / proximity);
        setActiveFactor(factor);

        // Relative coordinates for surface glint
        const rx = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const ry = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
        setMousePos({ x: rx, y: ry });
      } else if (!isHovered) {
        setActiveFactor(prev => Math.max(0, prev - 0.05));
      }
    },
    [autoAnimate, followMouse, proximity, isHovered]
  );

  useEffect(() => {
    if (!followMouse || autoAnimate) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [followMouse, autoAnimate, handleMouseMove]);

  const innerRadius = Math.max(0, radius - thickness);
  const currentIntensity = Math.min(1, Math.max(0, (isHovered ? 1 : activeFactor) * intensity));

  // Compute conic specular gradient stops based on shineSize and shineFade
  const halfSize = Math.max(2, shineSize / 2);
  const fade = Math.max(halfSize + 2, shineFade);

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovered(true);
        setActiveFactor(1);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      className={`specular-button group relative inline-flex items-center justify-center select-none cursor-pointer outline-none transition-transform duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none overflow-hidden shadow-sm ${className}`}
      style={{
        borderRadius: `${radius}px`,
        padding: `${thickness}px`,
        backgroundColor: baseColor,
        ...style,
      }}
      {...rest}
    >
      {/* 1. Base subtle border outline */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          borderRadius: `${radius}px`,
          border: `${thickness}px solid rgba(255, 255, 255, 0.15)`,
        }}
      />

      {/* 2. Dynamic Specular Border Highlight (Conic Angle Follower) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          borderRadius: `${radius}px`,
          opacity: currentIntensity,
          background: `conic-gradient(from ${angle - 90}deg at 50% 50%, transparent 0deg, transparent ${180 - fade}deg, ${lineColor} ${180 - halfSize}deg, ${lineColor} ${180 + halfSize}deg, transparent ${180 + fade}deg, transparent 360deg)`,
        }}
      />

      {/* 3. Button Body / Core Surface Container */}
      <div
        className={`relative z-10 w-full h-full flex items-center justify-center font-sans ${sizeClasses}`}
        style={{
          borderRadius: `${innerRadius}px`,
          backgroundColor: baseColor,
          color: textColor,
          backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
          WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      >
        {/* Surface Tint Layer */}
        {tintOpacity > 0 && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: `${innerRadius}px`,
              backgroundColor: tint,
              opacity: tintOpacity,
            }}
          />
        )}

        {/* Surface Specular Radial Highlight */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            borderRadius: `${innerRadius}px`,
            opacity: currentIntensity * 0.4,
            background: `radial-gradient(140px circle at ${mousePos.x}px ${mousePos.y}px, ${lineColor} 0%, transparent 80%)`,
          }}
        />

        {/* Ambient Top Rim Highlight */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[1px] pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.2) 50%, transparent 90%)',
          }}
        />

        {/* Button Content */}
        <span className="relative z-20 flex items-center justify-center gap-2">
          {children}
        </span>
      </div>
    </button>
  );
};

export default SpecularButton;
