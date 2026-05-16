import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="glass rounded-3xl p-8 mb-6">
        <Icon className="h-16 w-16 text-muted-foreground opacity-50" />
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-lg mb-6 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg" className="font-bold">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
