import { useState } from 'react';
import { AlertDialog } from '@atlas/ds';
import { deleteCollection } from '../../api/collections';
import { Collection } from '../../types';

interface DeleteCollectionDialogProps {
  collection: Collection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (deletedId: number) => void;
}

export function DeleteCollectionDialog({
  collection,
  open,
  onOpenChange,
  onDeleted,
}: DeleteCollectionDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!collection) return null;

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await deleteCollection(collection.id);
      onOpenChange(false);
      if (onDeleted) {
        onDeleted(collection.id);
      }
    } catch (err: unknown) {
      console.error('Failed to delete collection:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete collection "${collection.name}"?`}
      description={`Are you sure you want to delete this collection? Prompts in this collection (${collection.prompt_count}) will become Uncollected and will not be deleted.`}
      confirmLabel={submitting ? 'Deleting...' : 'Delete Collection'}
      cancelLabel="Cancel"
      variant="danger"
      onConfirm={handleConfirm}
      onCancel={() => onOpenChange(false)}
    />
  );
}
