import React, { useEffect, useState } from 'react';

export const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}> = ({ value, duration = 800, prefix = '', suffix = '', className = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const stepIncrement = (end - start) / totalSteps;

    let current = start;
    const timer = setInterval(() => {
      current += stepIncrement;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span className={`font-display tabular-nums ${className}`}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
};
