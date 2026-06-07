import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  requireText,
  variant = 'default',
  loading = false,
}) {
  const [text, setText] = useState('');
  const canConfirm = !requireText || text === requireText;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    await onConfirm?.();
    setText('');
    onOpenChange?.(false);
  };

  const handleOpenChange = (value) => {
    if (!value) setText('');
    onOpenChange?.(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-surface-1 border-border">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {requireText && (
          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              Type <span className="font-mono text-foreground">{requireText}</span> to confirm
            </Label>
            <Input
              id="confirm-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={requireText}
              className="bg-surface-2 border-border"
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
