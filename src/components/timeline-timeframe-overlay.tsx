"use client";

import React, { useState, useRef } from 'react';
import { useTimeframeStore } from '@/features/editor/store/use-timeframe-store';
import { TimeframeSelection } from '@/lib/timeframe-storage';
import { useAutoZoom } from '@/hooks/use-auto-zoom';
import useStore from '@/features/editor/store/use-store';

interface TimelineTimeframeOverlayProps {
  scale: { zoom: number; unit: number };
  duration: number;
  width: number;
}

export const TimelineTimeframeOverlay = ({ scale, duration, width }: TimelineTimeframeOverlayProps) => {
  const { selections, updateSelection } = useTimeframeStore();
  const { playerRef, fps } = useStore();
  const [draggingHandle, setDraggingHandle] = useState<{ name: string; type: 'start' | 'end' } | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  
  const { startDrag, updateDrag, stopDrag } = useAutoZoom({
    onZoomChange: (zoom) => {
      // This would need to be implemented in the store
      console.log('Zoom changed to:', zoom);
    }
  });

  const timeToPosition = (time: number) => {
    return (time / duration) * width;
  };

  const positionToTime = (position: number) => {
    return (position / width) * duration;
  };

  const getSelectionColor = (index: number) => {
    const colors = [
      '#3B82F6', // blue
      '#EF4444', // red
      '#10B981', // green
      '#F59E0B', // yellow
      '#8B5CF6', // purple
      '#F97316', // orange
      '#06B6D4', // cyan
      '#EC4899', // pink
    ];
    return colors[index % colors.length];
  };

  const selectionsArray = Object.entries(selections);

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent, name: string, type: 'start' | 'end') => {
    e.preventDefault();
    e.stopPropagation();
    
    setDraggingHandle({ name, type });
    setDragStartX(e.clientX);
    setDragStartTime(positionToTime(e.clientX));
    
    startDrag(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingHandle) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaTime = (deltaX / width) * duration;
    
    updateDrag(e.clientX);
    
    // Update player preview if available
    if (playerRef?.current) {
      const newTime = dragStartTime + deltaTime;
      const frame = (newTime * fps) / 1000;
      playerRef.current.seekTo(frame);
    }
  };

  const handleMouseUp = () => {
    if (!draggingHandle) return;
    
    // Update the selection
    const currentX = dragStartX + (draggingHandle.type === 'start' ? 0 : 0); // Simplified for now
    const newTime = positionToTime(currentX);
    
    const currentSelection = selections[draggingHandle.name];
    if (currentSelection) {
      const updatedSelection = {
        ...currentSelection,
        [draggingHandle.type]: Math.max(0, Math.min(duration, newTime))
      };
      updateSelection(draggingHandle.name, updatedSelection);
    }
    
    setDraggingHandle(null);
    stopDrag();
    
    // Return player to current playhead position
    if (playerRef?.current) {
      // This would need to get the current playhead position
      // For now, just pause
      playerRef.current.pause();
    }
  };

  // Add global mouse event listeners
  React.useEffect(() => {
    if (draggingHandle) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingHandle]);

  if (selectionsArray.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {selectionsArray.map(([name, selection], index) => {
        const startPos = timeToPosition(selection.start);
        const endPos = timeToPosition(selection.end);
        const width = endPos - startPos;
        const color = getSelectionColor(index);

        return (
          <div
            key={name}
            className="absolute h-full border-2 border-white shadow-lg"
            style={{
              left: startPos,
              width: Math.max(width, 4), // Minimum width for visibility
              backgroundColor: color,
              opacity: 0.8,
            }}
          >
            {/* Selection label */}
            <div
              className="absolute -top-6 left-0 px-2 py-1 text-xs text-white font-medium bg-black bg-opacity-70 rounded whitespace-nowrap"
              style={{
                transform: 'translateX(-50%)',
                left: Math.max(width / 2, 20),
              }}
            >
              {name}
            </div>
            
            {/* Start handle */}
            <div
              className="absolute left-0 top-0 w-2 h-full bg-white cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity"
              style={{ transform: 'translateX(-50%)' }}
              onMouseDown={(e) => handleMouseDown(e, name, 'start')}
            />
            
            {/* End handle */}
            <div
              className="absolute right-0 top-0 w-2 h-full bg-white cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity"
              style={{ transform: 'translateX(50%)' }}
              onMouseDown={(e) => handleMouseDown(e, name, 'end')}
            />
          </div>
        );
      })}
    </div>
  );
};

