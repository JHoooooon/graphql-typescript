import React, { Children, useCallback, useEffect, useRef } from 'react'
import { FilmsQuery } from '../../generated/graphql';

interface ScrollerProps {
  children: React.ReactElement;
  onEnter: () => void; 
  lastCursor: FilmsQuery['films']['cursor'];
}

const Scroller = ({children, onEnter, lastCursor}: ScrollerProps) => {
  // children 에 대한 ref
  const containerRef = useRef<Element>(null);

  // Children 은 오직 하나이어야 하며, ref 를 연결하기 위해 cloneElement 사용
  // 하여 ref 를 연결한 클론 엘리먼트 생성
  const Elem = React.cloneElement(Children.only(children), { ref: containerRef })

  // intersection observer callback 함수
  const scrollerAction: IntersectionObserverCallback = useCallback((entries, observer) => {
    entries.forEach(entity => {
      if (entity.isIntersecting) {
        console.log('intersection');
        onEnter()
      }
    })
  }, [onEnter]);

  useEffect(() => {
    if (containerRef.current) {
      const observer = new IntersectionObserver(scrollerAction, {
        threshold: 0.9
      });
      observer.observe(containerRef.current)
      console.log(containerRef.current)
    }
  })
  return (
    // 클론 엘리먼트 사용
    <div>{Elem}</div>
  )
}

export default Scroller