// Shared storage for timeframe groups
// In production, this would be replaced with a proper database

export interface TimeframeSelection {
  start: number;
  end: number;
}

export interface TimeframeGroup {
  id: string;
  name: string;
  selections: Record<string, TimeframeSelection>;
  createdAt: string;
  updatedAt: string;
}

class TimeframeStorage {
  private groups: Record<string, TimeframeGroup> = {};

  // Generate unique ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Get all groups
  getAll(): TimeframeGroup[] {
    return Object.values(this.groups);
  }

  // Get group by ID
  getById(id: string): TimeframeGroup | null {
    return this.groups[id] || null;
  }

  // Create new group
  create(name: string, selections: Record<string, TimeframeSelection>): TimeframeGroup {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    const group: TimeframeGroup = {
      id,
      name,
      selections,
      createdAt: now,
      updatedAt: now
    };

    this.groups[id] = group;
    return group;
  }

  // Update existing group
  update(id: string, name: string, selections: Record<string, TimeframeSelection>): TimeframeGroup | null {
    if (!this.groups[id]) {
      return null;
    }

    this.groups[id] = {
      ...this.groups[id],
      name,
      selections,
      updatedAt: new Date().toISOString()
    };

    return this.groups[id];
  }

  // Delete group
  delete(id: string): boolean {
    if (!this.groups[id]) {
      return false;
    }

    delete this.groups[id];
    return true;
  }

  // Add some sample data for testing
  seedSampleData(): void {
    if (Object.keys(this.groups).length === 0) {
      this.create("Sample Episode 1", {
        "episode 1": { start: 0, end: 93 },
        "episode 2": { start: 121, end: 312 },
        "episode 3": { start: 400, end: 600 }
      });
    }
  }
}

// Export singleton instance
export const timeframeStorage = new TimeframeStorage();

// Seed with sample data
timeframeStorage.seedSampleData();

