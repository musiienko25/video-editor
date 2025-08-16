import { useState, useRef, useEffect } from 'react';
import useStore from '@/features/editor/store/use-store';

interface UseAutoZoomProps {
  onZoomChange: (zoom: number) => void;
}

export const useAutoZoom = ({ onZoomChange }: UseAutoZoomProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState<number | null>(null);
  const [originalZoom, setOriginalZoom] = useState<number>(1);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { scale } = useStore();

  const DRAG_THRESHOLD = 2000; // 2 seconds
  const MAX_ZOOM = 10; // Maximum zoom level

  // Start dragging
  const startDrag = (position: number) => {
    setIsDragging(true);
    setDragStartTime(Date.now());
    setDragPosition(position);
    setOriginalZoom(scale.zoom);
  };

  // Update drag position
  const updateDrag = (position: number) => {
    if (!isDragging) return;
    
    setDragPosition(position);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for zoom in
    timeoutRef.current = setTimeout(() => {
      if (isDragging && dragPosition === position) {
        // Zoom in to maximum after 2 seconds of no movement
        onZoomChange(MAX_ZOOM);
      }
    }, DRAG_THRESHOLD);
  };

  // Stop dragging
  const stopDrag = () => {
    if (isDragging) {
      // Restore original zoom
      onZoomChange(originalZoom);
      
      // Clean up
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      setIsDragging(false);
      setDragStartTime(null);
      setDragPosition(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isDragging,
    startDrag,
    updateDrag,
    stopDrag,
  };
};
