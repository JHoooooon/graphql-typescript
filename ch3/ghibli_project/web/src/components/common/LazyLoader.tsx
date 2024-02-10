import React, { useCallback, useEffect, useRef, useState } from 'react';
import Skeleton from './Skeleton/Skeleton';

interface LazyLoaderProps {
  children: React.ReactElement;
  height?: number;
  isDataLoading: boolean;
  isImageLoading: boolean;
}

const LazyLoader = ({ children, height, isDataLoading, isImageLoading }: LazyLoaderProps) => {
  // 해당 element 를 보여줄지 설정하는 state
  const [inView, setInView] = useState<boolean>(false);
  // interceptionObserver target ref
  const ioPlaceholderRef = useRef<HTMLImageElement>(null);
  // interceptionObserver ref
  const ioRef = useRef<IntersectionObserver>();
  // interceptionObserver 콜백
  const lazyLoading: IntersectionObserverCallback = useCallback(
    (entities, obs) => {
      entities.forEach((entity) => {
        // entity 가 intersecting 되었다면,
        if (entity.isIntersecting) {
          // setInview 를 true
          setInView(true);
          // obs.discnnect 한다
          // 이는 한번 실행한후에 다시 실행되지 않도록 하기 위해서다
          obs.disconnect();
        }
      });
    },
    [setInView],
  );

  useEffect(() => {
    // ioRef 할당
    // intersectionObserver 생성
    ioRef.current = new IntersectionObserver(lazyLoading, {
      threshold: 0,
      rootMargin: `${height}px 0px 0px 0px`
    });
    // ioPlaceholderRef 가 있다면
    if (ioPlaceholderRef.current) {
      if (isDataLoading) {
        ioRef.current.unobserve(ioPlaceholderRef.current);
      } else {
        // 타겟설정
        ioRef.current.observe(ioPlaceholderRef.current);
      }
    }
    // unmount 시 disconnect
    return () => {
      if (ioRef.current) {
        ioRef.current.disconnect();
      }
    };
  }, [ioRef, lazyLoading, ioPlaceholderRef, isDataLoading, height]);

  return (
    <>
      {inView ? (
        children
      ) : (
        <Skeleton ref={ioPlaceholderRef} animationEffect={true} height={height} rounded={20} />
      )}
    </>
  );
};

export default LazyLoader;
