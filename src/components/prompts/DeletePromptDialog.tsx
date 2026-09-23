import { useState } from 'react';
import { AlertDialog } from '@atlas/ds';
import { deletePrompt } from '../../api/prompts';
import { Prompt } from '../../types';

interface DeletePromptDialogProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (deletedId: number) => void;
}

export function DeletePromptDialog({
  prompt,
  open,
  onOpenChange,
  onDeleted,
}: DeletePromptDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!prompt) return null;

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await deletePrompt(prompt.id);
      onOpenChange(false);
      if (onDeleted) {
        onDeleted(prompt.id);
      }
    } catch (err) {
      console.error('Failed to delete prompt:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete prompt "${prompt.title}"?`}
      description="This prompt will be removed from your library. This action cannot be undone from the application."
      confirmLabel={submitting ? 'Deleting...' : 'Delete Prompt'}
      cancelLabel="Cancel"
      variant="danger"
      onConfirm={handleConfirm}
      onCancel={() => onOpenChange(false)}
    />
  );
}
