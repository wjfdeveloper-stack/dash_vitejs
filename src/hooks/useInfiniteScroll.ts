import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

interface UseInfiniteScrollReturn {
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  setHasMore: (hasMore: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  observerRef: (node: HTMLElement | null) => void;
}

export const useInfiniteScroll = (
  onLoadMore: () => Promise<void> | void,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn => {
  const { threshold = 1.0, rootMargin = '0px' } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);

  const observerRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading || !hasMore) return;
      
      if (observer) observer.disconnect();
      
      const newObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            loadMore();
          }
        },
        {
          threshold,
          rootMargin,
        }
      );
      
      if (node) newObserver.observe(node);
      setObserver(newObserver);
    },
    [isLoading, hasMore, threshold, rootMargin]
  );

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      await onLoadMore();
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onLoadMore, isLoading, hasMore]);

  useEffect(() => {
    return () => {
      if (observer) observer.disconnect();
    };
  }, [observer]);

  return {
    isLoading,
    hasMore,
    loadMore,
    setHasMore,
    setIsLoading,
    observerRef,
  };
};