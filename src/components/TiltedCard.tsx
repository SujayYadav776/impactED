import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export interface TiltedCardProps {
  imageSrc?: string;
  altText?: string;
  captionText?: string;
  containerHeight?: string | number;
  containerWidth?: string | number;
  imageHeight?: string | number;
  imageWidth?: string | number;
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  displayOverlayContent?: boolean;
  overlayContent?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const springValues = {
  damping: 30,
  stiffness: 120,
  mass: 1.5,
};

export const TiltedCard: React.FC<TiltedCardProps> = ({
  imageSrc,
  altText = 'Tilted card image',
  captionText,
  containerHeight,
  containerWidth,
  imageHeight,
  imageWidth,
  scaleOnHover = 1.05,
  rotateAmplitude = 12,
  showMobileWarning = false,
  showTooltip = false,
  displayOverlayContent = false,
  overlayContent,
  children,
  className = '',
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Normalized mouse position (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Springs for 3D rotation & scale
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [rotateAmplitude, -rotateAmplitude]), springValues);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-rotateAmplitude, rotateAmplitude]), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0, { damping: 20, stiffness: 200 });

  // Floating tooltip position tracking
  const tooltipX = useMotionValue(0);
  const tooltipY = useMotionValue(0);
  const smoothTooltipX = useSpring(tooltipX, { damping: 20, stiffness: 220 });
  const smoothTooltipY = useSpring(tooltipY, { damping: 20, stiffness: 220 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);

    tooltipX.set(mouseX);
    tooltipY.set(mouseY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    scale.set(1);
    x.set(0);
    y.set(0);
    opacity.set(0);
  }

  return (
    <div
      className="tilted-card-container relative [perspective:1000px] w-full h-full flex flex-col justify-center"
      style={{
        width: containerWidth || '100%',
        height: containerHeight || '100%',
      }}
    >
      {showMobileWarning && (
        <div className="md:hidden text-[10px] text-stone-400 font-mono text-center mb-1">
          Tilt effect is best experienced on desktop
        </div>
      )}

      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
        }}
        className={`tilted-card-inner relative w-full h-full [transform-style:preserve-3d] will-change-transform ${className}`}
      >
        {children ? (
          children
        ) : (
          imageSrc && (
            <div 
              className="relative overflow-hidden rounded-xl w-full h-full"
              style={{
                width: imageWidth || '100%',
                height: imageHeight || '100%',
              }}
            >
              <img
                src={imageSrc}
                alt={altText || captionText || 'Tilted card image'}
                className="w-full h-full object-cover rounded-xl select-none"
                referrerPolicy="no-referrer"
              />
            </div>
          )
        )}

        {/* 3D Floating Overlay Content */}
        {displayOverlayContent && overlayContent && (
          <div
            className="tilted-card-overlay absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-4"
            style={{ transform: 'translateZ(30px)' }}
          >
            {overlayContent}
          </div>
        )}

        {/* Floating Tooltip following Cursor */}
        {showTooltip && captionText && (
          <motion.div
            style={{
              x: smoothTooltipX,
              y: smoothTooltipY,
              opacity,
              pointerEvents: 'none',
              transform: 'translate(-50%, -120%) translateZ(40px)',
            }}
            className="tilted-card-tooltip absolute top-0 left-0 z-30 pointer-events-none px-3 py-1.5 bg-stone-900/90 text-[#fcdcb6] text-xs font-mono font-bold tracking-wide rounded-md shadow-xl backdrop-blur-sm border border-stone-700/60 whitespace-nowrap"
          >
            {captionText}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default TiltedCard;
