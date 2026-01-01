/**
 * View Toggle Component
 * 
 * Segmented control to switch between peptide-first and vendor-first views
 */

import { Button } from '@/components/ui/button';
import { Grid3x3, Table } from 'lucide-react';

export type ViewMode = 'peptide' | 'vendor';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center rounded-lg border border-glass-border bg-card p-1 gap-1">
        <Button
          variant={view === 'peptide' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('peptide')}
          className="flex items-center gap-2 transition-all duration-200"
        >
          <Grid3x3 className="w-4 h-4" />
          View by Peptide
        </Button>
        <Button
          variant={view === 'vendor' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('vendor')}
          className="flex items-center gap-2 transition-all duration-200"
        >
          <Table className="w-4 h-4" />
          View by Vendor
        </Button>
      </div>
    </div>
  );
};

