import { useState, useEffect, useCallback } from 'react';
import { TimeframeGroup, TimeframeSelection } from '@/lib/timeframe-storage';

interface UseTimeframeSelectionsReturn {
  timeframeGroups: TimeframeGroup[];
  currentGroup: TimeframeGroup | null;
  isLoading: boolean;
  error: string | null;
  loadTimeframeGroups: () => Promise<void>;
  loadTimeframeGroup: (id: string) => Promise<void>;
  createTimeframeGroup: (name: string, selections: Record<string, TimeframeSelection>) => Promise<TimeframeGroup | null>;
  updateTimeframeGroup: (id: string, name: string, selections: Record<string, TimeframeSelection>) => Promise<TimeframeGroup | null>;
  deleteTimeframeGroup: (id: string) => Promise<boolean>;
  setCurrentGroup: (group: TimeframeGroup | null) => void;
}

export const useTimeframeSelections = (): UseTimeframeSelectionsReturn => {
  const [timeframeGroups, setTimeframeGroups] = useState<TimeframeGroup[]>([]);
  const [currentGroup, setCurrentGroup] = useState<TimeframeGroup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTimeframeGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/timeframes');
      if (!response.ok) {
        throw new Error('Failed to fetch timeframe groups');
      }
      const data = await response.json();
      if (data.success) {
        setTimeframeGroups(data.groups);
      } else {
        throw new Error(data.error || 'Failed to fetch timeframe groups');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTimeframeGroup = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/timeframes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch timeframe group');
      }
      const data = await response.json();
      if (data.success) {
        setCurrentGroup(data.group);
      } else {
        throw new Error(data.error || 'Failed to fetch timeframe group');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTimeframeGroup = useCallback(async (name: string, selections: Record<string, TimeframeSelection>): Promise<TimeframeGroup | null> => {
    try {
      const response = await fetch('/api/timeframes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, selections }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create timeframe group');
      }
      
      const data = await response.json();
      if (data.success) {
        await loadTimeframeGroups(); // Refresh the list
        return data.group;
      } else {
        throw new Error(data.error || 'Failed to create timeframe group');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, [loadTimeframeGroups]);

  const updateTimeframeGroup = useCallback(async (id: string, name: string, selections: Record<string, TimeframeSelection>): Promise<TimeframeGroup | null> => {
    try {
      const response = await fetch('/api/timeframes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, name, selections }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update timeframe group');
      }
      
      const data = await response.json();
      if (data.success) {
        await loadTimeframeGroups(); // Refresh the list
        if (currentGroup?.id === id) {
          setCurrentGroup(data.group);
        }
        return data.group;
      } else {
        throw new Error(data.error || 'Failed to update timeframe group');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, [loadTimeframeGroups, currentGroup?.id]);

  const deleteTimeframeGroup = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/timeframes?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete timeframe group');
      }
      
      const data = await response.json();
      if (data.success) {
        await loadTimeframeGroups(); // Refresh the list
        if (currentGroup?.id === id) {
          setCurrentGroup(null);
        }
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete timeframe group');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [loadTimeframeGroups, currentGroup?.id]);

  // Load timeframe groups on mount
  useEffect(() => {
    loadTimeframeGroups();
  }, [loadTimeframeGroups]);

  return {
    timeframeGroups,
    currentGroup,
    isLoading,
    error,
    loadTimeframeGroups,
    loadTimeframeGroup,
    createTimeframeGroup,
    updateTimeframeGroup,
    deleteTimeframeGroup,
    setCurrentGroup,
  };
};

