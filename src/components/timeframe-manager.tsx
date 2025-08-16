"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useTimeframeSelections } from '@/hooks/use-timeframe-selections';
import { TimeframeGroup } from '@/lib/timeframe-storage';
import { Clock, Play, Save, Trash2 } from 'lucide-react';

interface TimeframeManagerProps {
  onLoadTimeframeGroup: (group: TimeframeGroup) => void;
}

export const TimeframeManager = ({ onLoadTimeframeGroup }: TimeframeManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<TimeframeGroup | null>(null);
  const {
    timeframeGroups,
    isLoading,
    error,
    deleteTimeframeGroup,
  } = useTimeframeSelections();

  const handleLoadGroup = (group: TimeframeGroup) => {
    onLoadTimeframeGroup(group);
    setSelectedGroup(group);
    setIsOpen(false);
  };

  const handleDeleteGroup = async (id: string) => {
    if (confirm('Are you sure you want to delete this timeframe group?')) {
      await deleteTimeframeGroup(id);
    }
  };

  const formatDuration = (start: number, end: number) => {
    const duration = end - start;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Clock className="w-4 h-4" />
          Timeframe Selections
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Available Timeframe Groups</DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            {timeframeGroups.length === 0 ? (
              <div className="text-center text-gray-500 p-8">
                No timeframe groups available. Create one by editing a video and saving your selections.
              </div>
            ) : (
              <div className="space-y-3">
                {timeframeGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                      selectedGroup?.id === group.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{group.name}</h3>
                        <div className="space-y-2">
                          {Object.entries(group.selections).map(([name, selection]) => (
                            <div key={name} className="flex items-center gap-2 text-sm">
                              <Badge variant="secondary" className="text-xs">
                                {name}
                              </Badge>
                              <span className="text-gray-600">
                                {formatDuration(selection.start, selection.end)}
                              </span>
                              <span className="text-gray-400">
                                ({selection.start}s - {selection.end}s)
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          Created: {new Date(group.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleLoadGroup(group)}
                          className="gap-1"
                        >
                          <Play className="w-3 h-3" />
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteGroup(group.id)}
                          className="gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

