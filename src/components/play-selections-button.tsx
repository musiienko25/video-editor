"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { useTimeframeStore } from '@/features/editor/store/use-timeframe-store';
import useStore from '@/features/editor/store/use-store';

export const PlaySelectionsButton = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSelectionIndex, setCurrentSelectionIndex] = useState(0);
  const { selections } = useTimeframeStore();
  const { playerRef, fps } = useStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectionsArray = Object.entries(selections);

  // Find next selection from current time
  const findNextSelection = (currentTime: number) => {
    const sortedSelections = selectionsArray
      .map(([name, selection]) => ({ name, ...selection }))
      .sort((a, b) => a.start - b.start);

    for (let i = 0; i < sortedSelections.length; i++) {
      if (sortedSelections[i].start > currentTime) {
        return { selection: sortedSelections[i], index: i };
      }
    }
    return { selection: sortedSelections[0], index: 0 };
  };

  // Play specific selection
  const playSelection = async (selection: { start: number; end: number }) => {
    if (!playerRef?.current) return;

    // Seek to start of selection - convert seconds to frames
    const startFrame = Math.round(selection.start * fps);
    playerRef.current.seekTo(startFrame);
    
    // Start playing
    playerRef.current.play();
    setIsPlaying(true);
    setCurrentSelectionIndex(currentSelectionIndex);

    // Set up auto-advance
    const duration = selection.end - selection.start;
    timeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        // Pause for 0.5s at the end
        playerRef.current?.pause();
        
        setTimeout(() => {
          // Find and play next selection
          const nextIndex = (currentSelectionIndex + 1) % selectionsArray.length;
          if (selectionsArray[nextIndex]) {
            const [_, nextSelection] = selectionsArray[nextIndex];
            setCurrentSelectionIndex(nextIndex);
            playSelection(nextSelection);
          } else {
            setIsPlaying(false);
          }
        }, 500);
      }
    }, duration * 1000);
  };

  // Handle yellow play button click
  const handleYellowPlay = () => {
    if (selectionsArray.length === 0) return;

    if (isPlaying) {
      // Stop playing
      playerRef?.current?.pause();
      setIsPlaying(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Get current time - convert frame to seconds
    const currentFrame = playerRef?.current?.getCurrentFrame() || 0;
    const currentTime = (currentFrame / fps) * 1000;
    
    // Find next selection from current time
    const { selection, index } = findNextSelection(currentTime);
    
    setCurrentSelectionIndex(index);
    playSelection(selection);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Update current selection index when selections change
  useEffect(() => {
    if (selectionsArray.length === 0) {
      setIsPlaying(false);
      setCurrentSelectionIndex(0);
    }
  }, [selectionsArray.length]);

  if (selectionsArray.length === 0) {
    return null;
  }

  return (
    <Button
      onClick={handleYellowPlay}
      className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold gap-2"
      size="sm"
    >
      {isPlaying ? (
        <>
          <Pause className="w-4 h-4" />
          Stop Selections
        </>
      ) : (
        <>
          <Play className="w-4 h-4" />
          Play Selections
        </>
      )}
    </Button>
  );
};
