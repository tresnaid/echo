import React, { useState } from 'react';
import { Dialog, Field, Input, Button, Stack, Text } from '@tresnaid/atlas';
import { createCollection } from '../../api/collections';
import { Collection } from '../../types';

interface CreateCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (collection: Collection) => void;
}

export function CreateCollectionModal({
  open,
  onOpenChange,
  onCreated,
}: CreateCollectionModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setName('');
    setError(null);
    onOpenChange(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Collection name cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const created = await createCollection(trimmed);
      setName('');
      onOpenChange(false);
      if (onCreated) {
        onCreated(created);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create collection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Collection"
      description="Organize your reusable prompts into custom collections."
      size="sm"
      footer={
        <Stack direction="horizontal" justify="end" gap="3">
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleSubmit()} isLoading={submitting}>
            Create
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
              placeholder="e.g. Code Review, Marketing, Creative Writing"
              autoFocus
              disabled={submitting}
            />
          </Field>
          <Text size="sm" color="muted">
            You can always rename or delete collections later without losing your prompts.
          </Text>
        </Stack>
      </form>
    </Dialog>
  );
}
