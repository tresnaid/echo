import React, { useState, useEffect } from 'react';
import { Dialog, Field, Input, Button, Stack } from '@tresnaid/atlas';
import { renameCollection } from '../../api/collections';
import { Collection } from '../../types';

interface RenameCollectionModalProps {
  collection: Collection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRenamed?: (updated: Collection) => void;
}

export function RenameCollectionModal({
  collection,
  open,
  onOpenChange,
  onRenamed,
}: RenameCollectionModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setError(null);
    }
  }, [collection, open]);

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!collection) return;

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Collection name cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const updated = await renameCollection(collection.id, trimmed);
      onOpenChange(false);
      if (onRenamed) {
        onRenamed(updated);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to rename collection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rename Collection"
      size="sm"
      footer={
        <Stack direction="horizontal" justify="end" gap="3">
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleSubmit()} isLoading={submitting}>
            Save
          </Button>
        </Stack>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack direction="vertical" gap="4">
          <Field
            label="Collection Name"
            isRequired
            errorMessage={error || undefined}
          >
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Collection name"
              autoFocus
              disabled={submitting}
            />
          </Field>
        </Stack>
      </form>
    </Dialog>
  );
}
