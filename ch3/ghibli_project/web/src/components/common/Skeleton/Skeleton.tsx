import { forwardRef } from 'react';
import styled from '@emotion/styled';
import { css, keyframes } from '@emotion/react';

interface SkeletonProps {
  width?: number; // detault: 100%
  height?: number; // default: 100%
  animationEffect?: boolean; // default: false
  rounded?: number; // default: false
  backgroundColor?: string;
}

const skeletonAnim = keyframes`
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
`;

const SkeletonDiv = styled.div<SkeletonProps>`
  width: ${({ width }) => (width ? `${width}px` : '100%')};
  height: ${({ height }) => (height ? `${height}px` : '100%')};
  animation: ${({ animationEffect }) =>
    animationEffect
      ? css`
          ${skeletonAnim} 1.5s infinite
        `
      : ''};
  border-radius: ${({ rounded }) => (rounded ? `${rounded}px` : '0')};
  background-color: ${({ backgroundColor }) => (backgroundColor ? backgroundColor : 'lightGray')};
`;

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>((props, ref) => {
  return <SkeletonDiv {...props} ref={ref} />;
});

export default Skeleton;
