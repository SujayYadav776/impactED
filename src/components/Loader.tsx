import React from 'react';
import styled from 'styled-components';

interface LoaderProps {
  color?: string;
  alphaColor?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  color = 'rgb(82, 54, 36)', // Matches the signature scholastic brown (#523624) of the impactED box/navbar
  alphaColor = 'rgba(82, 54, 36, 0.12)',
  className = '',
}) => {
  return (
    <StyledWrapper $color={color} $alphaColor={alphaColor} className={className}>
      <div className="spinner">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ $color: string; $alphaColor: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 600px;
  margin: 0 auto 2.75rem auto;

  .spinner {
    width: 70.4px;
    height: 70.4px;
    --clr: ${(props) => props.$color};
    --clr-alpha: ${(props) => props.$alphaColor};
    animation: spinner 1.6s infinite ease;
    transform-style: preserve-3d;
    position: relative;
  }

  .spinner > div {
    background-color: var(--clr-alpha);
    height: 100%;
    position: absolute;
    width: 100%;
    border: 3.5px solid var(--clr);
    box-sizing: border-box;
  }

  .spinner div:nth-of-type(1) {
    transform: translateZ(-35.2px) rotateY(180deg);
  }

  .spinner div:nth-of-type(2) {
    transform: rotateY(-270deg) translateX(50%);
    transform-origin: top right;
  }

  .spinner div:nth-of-type(3) {
    transform: rotateY(270deg) translateX(-50%);
    transform-origin: center left;
  }

  .spinner div:nth-of-type(4) {
    transform: rotateX(90deg) translateY(-50%);
    transform-origin: top center;
  }

  .spinner div:nth-of-type(5) {
    transform: rotateX(-90deg) translateY(50%);
    transform-origin: bottom center;
  }

  .spinner div:nth-of-type(6) {
    transform: translateZ(35.2px);
  }

  @keyframes spinner {
    0% {
      transform: rotate(45deg) rotateX(-25deg) rotateY(25deg);
    }

    50% {
      transform: rotate(45deg) rotateX(-385deg) rotateY(25deg);
    }

    100% {
      transform: rotate(45deg) rotateX(-385deg) rotateY(385deg);
    }
  }
`;

export default Loader;
