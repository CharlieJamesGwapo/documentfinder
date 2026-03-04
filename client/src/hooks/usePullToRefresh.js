import { useState, useEffect, useRef } from 'react';

const usePullToRefresh = (onRefresh, threshold = 80) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e) => {
    if (containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling) return;
    
    currentY.current = e.touches[0].clientY;
    const distance = currentY.current - startY.current;
    
    if (distance > 0 && containerRef.current.scrollTop === 0) {
      e.preventDefault();
      const resistance = distance > threshold ? threshold + (distance - threshold) * 0.3 : distance;
      setPullDistance(Math.min(resistance, threshold * 1.5));
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(0);
      
      onRefresh().finally(() => {
        setIsRefreshing(false);
      });
    } else {
      setPullDistance(0);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, isRefreshing]);

  return {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    pullIndicatorOpacity: Math.min(pullDistance / threshold, 1),
    shouldRefresh: pullDistance >= threshold
  };
};

export default usePullToRefresh;
