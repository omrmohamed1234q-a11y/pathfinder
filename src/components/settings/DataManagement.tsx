import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const DataManagement: React.FC = () => {
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleExport = () => {
    try {
      const data = {
        progress: localStorage.getItem('pathfinder_progress'),
        achievements: localStorage.getItem('pathfinder_achievements'),
        streak: localStorage.getItem('pathfinder_streak'),
        contentCache: localStorage.getItem('pathfinder_content_cache'),
        soundEnabled: localStorage.getItem('pathfinder_sound_enabled'),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pathfinder-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!', {
        description: 'Your progress has been saved to a file.'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data', {
        description: 'Please try again or contact support.'
      });
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      try {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const text = await file.text();
        const data = JSON.parse(text);

        // Validate data structure
        if (!data.progress || !data.exportDate) {
          throw new Error('Invalid backup file');
        }

        // Restore data
        if (data.progress) localStorage.setItem('pathfinder_progress', data.progress);
        if (data.achievements) localStorage.setItem('pathfinder_achievements', data.achievements);
        if (data.streak) localStorage.setItem('pathfinder_streak', data.streak);
        if (data.contentCache) localStorage.setItem('pathfinder_content_cache', data.contentCache);
        if (data.soundEnabled) localStorage.setItem('pathfinder_sound_enabled', data.soundEnabled);

        toast.success('Data imported successfully!', {
          description: 'Your progress has been restored. Refreshing page...'
        });

        // Refresh page to load new data
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import data', {
          description: 'The file may be corrupted or invalid.'
        });
      }
    };
    input.click();
  };

  const handleClearData = () => {
    try {
      localStorage.removeItem('pathfinder_progress');
      localStorage.removeItem('pathfinder_achievements');
      localStorage.removeItem('pathfinder_streak');
      localStorage.removeItem('pathfinder_content_cache');

      toast.success('All data cleared!', {
        description: 'Your progress has been reset. Refreshing page...'
      });

      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Clear error:', error);
      toast.error('Failed to clear data', {
        description: 'Please try again or contact support.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-2">Data Management</h3>
        <p className="text-sm text-muted-foreground">
          Export, import, or clear your learning progress
        </p>
      </div>

      <div className="space-y-3">
        {/* Export */}
        <div className="glass rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="glass-strong rounded-full p-2">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Export Data</h4>
              <p className="text-sm text-muted-foreground">
                Download your progress as a backup file
              </p>
            </div>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Import */}
        <div className="glass rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="glass-strong rounded-full p-2">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Import Data</h4>
              <p className="text-sm text-muted-foreground">
                Restore progress from a backup file
              </p>
            </div>
          </div>
          <Button onClick={handleImport} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>

        {/* Clear Data */}
        <div className="glass rounded-xl p-4 flex items-center justify-between border-2 border-red-500/20">
          <div className="flex items-start gap-3">
            <div className="glass-strong rounded-full p-2 bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h4 className="font-semibold text-red-400">Clear All Data</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete all your progress
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowClearDialog(true)}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Clear All Data?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your progress, achievements, and settings will be permanently deleted.
              <br /><br />
              <strong>Make sure to export your data first if you want to keep a backup!</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, Clear Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
