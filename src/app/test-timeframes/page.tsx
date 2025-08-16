"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimeframeSelection {
  start: number;
  end: number;
}

interface TimeframeGroup {
  id: string;
  name: string;
  selections: Record<string, TimeframeSelection>;
  createdAt: string;
  updatedAt: string;
}

export default function TestTimeframesPage() {
  const [groups, setGroups] = useState<TimeframeGroup[]>([]);
  const [newName, setNewName] = useState('');
  const [newSelections, setNewSelections] = useState('');
  const [loading, setLoading] = useState(false);

  // Load all groups
  const loadGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/timeframes');
      const data = await response.json();
      if (data.success) {
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new group
  const createGroup = async () => {
    if (!newName.trim() || !newSelections.trim()) {
      alert('Please enter both name and selections');
      return;
    }

    try {
      let selections: Record<string, TimeframeSelection>;
      try {
        selections = JSON.parse(newSelections);
      } catch {
        alert('Invalid JSON format for selections');
        return;
      }

      const response = await fetch('/api/timeframes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), selections }),
      });

      const data = await response.json();
      if (data.success) {
        setNewName('');
        setNewSelections('');
        await loadGroups();
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  // Delete group
  const deleteGroup = async (id: string) => {
    if (confirm('Are you sure you want to delete this group?')) {
      try {
        const response = await fetch(`/api/timeframes?id=${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          await loadGroups();
        }
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Timeframe API Test</h1>
      
      {/* Create new group */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Timeframe Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>
          <div>
            <Label htmlFor="selections">Selections (JSON)</Label>
            <Input
              id="selections"
              value={newSelections}
              onChange={(e) => setNewSelections(e.target.value)}
              placeholder='{"episode 1": {"start": 0, "end": 93}}'
            />
          </div>
          <Button onClick={createGroup} disabled={loading}>
            {loading ? 'Creating...' : 'Create Group'}
          </Button>
        </CardContent>
      </Card>

      {/* Display existing groups */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Timeframe Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={loadGroups} className="mb-4" disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Groups'}
          </Button>
          
          {groups.length === 0 ? (
            <p className="text-gray-500">No groups found</p>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{group.name}</h3>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteGroup(group.id)}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Created: {new Date(group.createdAt).toLocaleString()}
                  </div>
                  <div className="space-y-1">
                    {Object.entries(group.selections).map(([name, selection]) => (
                      <div key={name} className="text-sm">
                        <span className="font-medium">{name}:</span> {selection.start}s - {selection.end}s
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

