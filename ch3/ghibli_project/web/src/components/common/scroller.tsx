import React, { Children, ElementType, ReactElement, cloneElement, createElement, useEffect, useRef } from 'react'
import { findDOMNode } from 'react-dom';

interface ScrollerProps {
  children: React.ReactElement;
  // params: {
    
  // }
}

const Scroller = ({children}: ScrollerProps) => {
  const ref = useRef<ReactElement>();
  const Elem = cloneElement(Children.only(children), { ref })
  useEffect(() => {
    console.log(ref.current)
  }, [])
  return (
    <div>{Elem}</div>
  )
}

export default Scroller