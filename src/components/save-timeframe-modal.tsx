"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTimeframeSelections } from '@/hooks/use-timeframe-selections';
import { TimeframeSelection } from '@/lib/timeframe-storage';
import { Save } from 'lucide-react';

interface SaveTimeframeModalProps {
  selections: Record<string, TimeframeSelection>;
  currentName?: string;
  onSave?: () => void;
}

export const SaveTimeframeModal = ({ selections, currentName = '', onSave }: SaveTimeframeModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);
  const { createTimeframeGroup, updateTimeframeGroup } = useTimeframeSelections();

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a name for the timeframe group');
      return;
    }

    setIsSaving(true);
    try {
      let result;
      
      if (currentName) {
        // Update existing group (you'll need to pass the ID)
        // For now, we'll create a new one
        result = await createTimeframeGroup(name.trim(), selections);
      } else {
        // Create new group
        result = await createTimeframeGroup(name.trim(), selections);
      }

      if (result) {
        setIsOpen(false);
        onSave?.();
      }
    } catch (error) {
      console.error('Error saving timeframe group:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && isSaving) return; // Prevent closing while saving
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Save className="w-4 h-4" />
          Save Selections
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentName ? 'Update Timeframe Group' : 'Save Timeframe Group'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for this group"
              disabled={isSaving}
            />
          </div>

          <div className="text-sm text-gray-600">
            <p>This will save {Object.keys(selections).length} timeframe selections:</p>
            <ul className="mt-2 space-y-1">
              {Object.entries(selections).map(([key, selection]) => (
                <li key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span>{selection.start}s - {selection.end}s</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="gap-2"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {currentName ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

