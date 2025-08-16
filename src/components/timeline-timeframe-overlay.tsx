"use client";

import { useTimeframeStore } from '@/features/editor/store/use-timeframe-store';
import { TimeframeSelection } from '@/lib/timeframe-storage';

interface TimelineTimeframeOverlayProps {
  scale: { zoom: number; unit: number };
  duration: number;
  width: number;
}

export const TimelineTimeframeOverlay = ({ scale, duration, width }: TimelineTimeframeOverlayProps) => {
  const { selections } = useTimeframeStore();

  const timeToPosition = (time: number) => {
    return (time / duration) * width;
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
            />
            
            {/* End handle */}
            <div
              className="absolute right-0 top-0 w-2 h-full bg-white cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity"
              style={{ transform: 'translateX(50%)' }}
            />
          </div>
        );
      })}
    </div>
  );
};

