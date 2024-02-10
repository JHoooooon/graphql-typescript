import React, { useCallback, useEffect, useRef } from 'react';
import { FilmsQuery } from '../../generated/graphql';
import { Box } from '@chakra-ui/react';
import { FaWindowClose } from 'react-icons/fa';

interface ScrollerProps {
  // 스크롤러를 적용할 children
  children: React.ReactElement;
  // intersectionObjserver 의 callback 에서 실행할
  // 함수
  onEnter: () => void;
  // 다음에 query 할 cursor 
  lastCursor: FilmsQuery['films']['cursor'];
  // data 를 loading 중인지 확인
  isLoading: boolean;
}

const Scroller = ({ children, onEnter, isLoading, lastCursor }: ScrollerProps) => {
  // intersectionObserver 의 target ref
  const target = useRef<HTMLDivElement>(null);
  const ioRef = useRef<IntersectionObserver>();

  // intersection observer callback 함수
  const scrollerAction: IntersectionObserverCallback = useCallback(
    (entries) => {
      entries.forEach((entity) => {
        // intersecting 되고 lastCursor 가 있다면
        // onEnter 실행
        if (entity.isIntersecting && lastCursor) {
          onEnter();
        }
      });
    },
    [onEnter, lastCursor],
  );

  useEffect(() => {
    // threshold: 0.8 일때 scrollerAction 실행
    ioRef.current = new IntersectionObserver(scrollerAction, {
      threshold: 0.8,
    });
    // target.current
    if (target.current && ioRef.current) {
      // loading 중이라면 unobserve
      // data 를 받아오는중에 작동을 방지
      if (isLoading) {
        ioRef.current.unobserve(target.current);
      } else {
        // loading 이 완료되면 observe 실행
        ioRef.current.observe(target.current);
      }
    }
    return () => {
      if(ioRef.current) {
        ioRef.current.disconnect();
      }
    }
  }, [ioRef, target, scrollerAction, isLoading]);
  return (
    <>
      {/* children */}
      <div>{children}</div>
      {/* lastCursor 가 있다면, intersectionObserver target 활성화 */}
      {lastCursor && <Box ref={target} h={100} w={'100%'}></Box>}
    </>
  );
};

export default Scroller;