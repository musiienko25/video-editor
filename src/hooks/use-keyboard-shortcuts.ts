import { useEffect, useRef } from 'react';
import useStore from '@/features/editor/store/use-store';
import { useTimeframeStore } from '@/features/editor/store/use-timeframe-store';

export const useKeyboardShortcuts = () => {
  const { playerRef } = useStore();
  const { selections } = useTimeframeStore();
  const lastSpaceTime = useRef<number>(0);
  const DOUBLE_SPACE_THRESHOLD = 300; // milliseconds

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleSpaceKey();
          break;
        
        case 'KeyZ':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            handleUndo();
          }
          break;
      }
    };

    const handleSpaceKey = () => {
      const now = Date.now();
      const timeSinceLastSpace = now - lastSpaceTime.current;
      
      if (timeSinceLastSpace < DOUBLE_SPACE_THRESHOLD) {
        // Double space - yellow play
        handleYellowPlay();
      } else {
        // Single space - regular play/pause
        handleRegularPlay();
      }
      
      lastSpaceTime.current = now;
    };

    const handleRegularPlay = () => {
      if (!playerRef?.current) return;
      
      if (playerRef.current.isPlaying()) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    };

    const handleYellowPlay = () => {
      if (Object.keys(selections).length === 0) return;
      
      // Trigger yellow play button click
      // This would need to be implemented by calling the function directly
      // For now, we'll just log it
      console.log('Yellow play triggered via double space');
      
      // You could also dispatch a custom event here
      window.dispatchEvent(new CustomEvent('yellow-play-triggered'));
    };

    const handleUndo = () => {
      // This would need to be implemented by calling the undo function
      console.log('Undo triggered via cmd+z');
      
      // You could also dispatch a custom event here
      window.dispatchEvent(new CustomEvent('undo-triggered'));
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [playerRef, selections]);

  return null; // This hook doesn't return anything, it just sets up event listeners
};
