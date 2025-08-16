import { create } from 'zustand';
import { TimeframeGroup, TimeframeSelection } from '@/lib/timeframe-storage';

interface TimeframeStore {
  // Current loaded timeframe group
  currentGroup: TimeframeGroup | null;
  
  // Current selections being edited
  selections: Record<string, TimeframeSelection>;
  
  // Actions
  loadTimeframeGroup: (group: TimeframeGroup) => void;
  clearTimeframeGroup: () => void;
  updateSelection: (name: string, selection: TimeframeSelection) => void;
  addSelection: (name: string, selection: TimeframeSelection) => void;
  removeSelection: (name: string) => void;
  getSelectionsArray: () => Array<{ name: string; selection: TimeframeSelection }>;
  getCurrentGroupName: () => string;
}

export const useTimeframeStore = create<TimeframeStore>((set, get) => ({
  currentGroup: null,
  selections: {},

  loadTimeframeGroup: (group: TimeframeGroup) => {
    set({
      currentGroup: group,
      selections: { ...group.selections }
    });
  },

  clearTimeframeGroup: () => {
    set({
      currentGroup: null,
      selections: {}
    });
  },

  updateSelection: (name: string, selection: TimeframeSelection) => {
    set((state) => ({
      selections: {
        ...state.selections,
        [name]: selection
      }
    }));
  },

  addSelection: (name: string, selection: TimeframeSelection) => {
    set((state) => ({
      selections: {
        ...state.selections,
        [name]: selection
      }
    }));
  },

  removeSelection: (name: string) => {
    set((state) => {
      const newSelections = { ...state.selections };
      delete newSelections[name];
      return { selections: newSelections };
    });
  },

  getSelectionsArray: () => {
    const state = get();
    return Object.entries(state.selections).map(([name, selection]) => ({
      name,
      selection
    }));
  },

  getCurrentGroupName: () => {
    const state = get();
    return state.currentGroup?.name || '';
  }
}));

