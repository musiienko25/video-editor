"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTimeframeStore } from '@/features/editor/store/use-timeframe-store';
import useStore from '@/features/editor/store/use-store';
import { Download, Play } from 'lucide-react';

interface ExportSelectionsModalProps {
  onExport?: () => void;
}

export const ExportSelectionsModal = ({ onExport }: ExportSelectionsModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportType, setExportType] = useState<'selected' | 'all'>('selected');
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  
  const { selections } = useTimeframeStore();
  const { playerRef, fps } = useStore();
  
  const selectionsArray = Object.entries(selections);

  const handleExport = async () => {
    if (exportType === 'selected' && !selectedPart) {
      alert('Please select a part to export');
      return;
    }

    setIsExporting(true);
    
    try {
      if (exportType === 'selected') {
        // Export single selection
        await exportSingleSelection(selectedPart);
      } else {
        // Export all selections
        await exportAllSelections();
      }
      
      setIsOpen(false);
      onExport?.();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportSingleSelection = async (selectionName: string) => {
    const selection = selections[selectionName];
    if (!selection) return;

    // This would integrate with the existing export system
    console.log('Exporting single selection:', selectionName, selection);
    
    // For now, just simulate export
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, you would:
    // 1. Get the video source from the player
    // 2. Use FFmpeg or similar to extract the segment
    // 3. Export with same frame rate and bitrate
    // 4. Download the file
  };

  const exportAllSelections = async () => {
    // This would export all selections as separate files
    console.log('Exporting all selections:', selections);
    
    // For now, just simulate export
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // In a real implementation, you would:
    // 1. Loop through all selections
    // 2. Export each as a separate MP4 file
    // 3. Create a zip file with all exports
    // 4. Download the zip
  };

  if (selectionsArray.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Selections
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Timeframe Selections</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Export Type</Label>
            <RadioGroup
              value={exportType}
              onValueChange={(value: 'selected' | 'all') => setExportType(value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="selected" />
                <Label htmlFor="selected">Export Selected Part</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">Export All Parts</Label>
              </div>
            </RadioGroup>
          </div>

          {exportType === 'selected' && (
            <div>
              <Label htmlFor="part-select">Select Part to Export</Label>
              <select
                id="part-select"
                value={selectedPart}
                onChange={(e) => setSelectedPart(e.target.value)}
                className="w-full mt-2 p-2 border rounded-md"
              >
                <option value="">Choose a part...</option>
                {selectionsArray.map(([name, selection]) => (
                  <option key={name} value={name}>
                    {name} ({selection.start}s - {selection.end}s)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p>Export settings:</p>
            <ul className="mt-1 space-y-1">
              <li>• Format: MP4 H.264</li>
              <li>• Frame rate: {fps} fps (same as source)</li>
              <li>• Bitrate: Same as source file</li>
              <li>• Quality: High</li>
            </ul>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || (exportType === 'selected' && !selectedPart)}
              className="gap-2"
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
