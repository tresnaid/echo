import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Field,
  Input,
  Textarea,
  Select,
  Button,
  Stack,
  Tag,
  Text,
} from '@atlas/ds';
import { Prompt, Collection, Category } from '../../types';
import { createPrompt, updatePrompt, fetchCategories } from '../../api/prompts';
import { CreateCollectionModal } from '../collections/CreateCollectionModal';

interface PromptFormModalProps {
  prompt?: Prompt | null;
  collections: Collection[];
  defaultCollectionId?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (prompt: Prompt) => void;
  onCollectionCreated?: (collection: Collection) => void;
}

export function PromptFormModal({
  prompt,
  collections,
  defaultCollectionId,
  open,
  onOpenChange,
  onSaved,
  onCollectionCreated,
}: PromptFormModalProps) {
  const isEditing = Boolean(prompt);

  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [description, setDescription] = useState('');
  const [usageDescription, setUsageDescription] = useState('');
  const [collectionId, setCollectionId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; prompt_text?: string; general?: string }>({});

  // Load categories
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Initialize form when opened or prompt changes
  useEffect(() => {
    if (open) {
      if (prompt) {
        setTitle(prompt.title || '');
        setPromptText(prompt.prompt_text || '');
        setDescription(prompt.description || '');
        setUsageDescription(prompt.usage_description || '');
        setCollectionId(prompt.collection_id ? String(prompt.collection_id) : '');
        setCategoryId(prompt.category_id || '');
        setTags(prompt.tags || []);
      } else {
        setTitle('');
        setPromptText('');
        setDescription('');
        setUsageDescription('');
        setCollectionId(defaultCollectionId ? String(defaultCollectionId) : '');
        setCategoryId('');
        setTags([]);
      }
      setTagInput('');
      setErrors({});
    }
  }, [open, prompt, defaultCollectionId]);

  const handleAddTag = (rawTag: string) => {
    const trimmed = rawTag.trim();
    if (!trimmed) return;
    if (!tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleCollectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__CREATE_NEW__') {
      setCreateCollectionOpen(true);
    } else {
      setCollectionId(val);
    }
  };

  const handleInlineCollectionCreated = (newCol: Collection) => {
    if (onCollectionCreated) {
      onCollectionCreated(newCol);
    }
    setCollectionId(String(newCol.id));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const newErrors: typeof errors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!promptText.trim()) {
      newErrors.prompt_text = 'Prompt text is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});

      const payload = {
        title: title.trim(),
        prompt_text: promptText, // exact raw prompt text
        description: description.trim() || null,
        usage_description: usageDescription.trim() || null,
        collection_id: collectionId ? parseInt(collectionId, 10) : null,
        category_id: categoryId || null,
        tags: tags.length > 0 ? tags : undefined,
      };

      let result: Prompt;
      if (isEditing && prompt) {
        result = await updatePrompt(prompt.id, payload);
      } else {
        result = await createPrompt(payload);
      }

      onOpenChange(false);
      if (onSaved) {
        onSaved(result);
      }
    } catch (err: unknown) {
      setErrors({
        general: err instanceof Error ? err.message : 'Failed to save prompt',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        title={isEditing ? 'Edit Prompt' : 'Create New Prompt'}
        description={
          isEditing
            ? 'Update your prompt text, descriptions, and optional organization tags.'
            : 'Add a reusable prompt to your library. Organization is optional.'
        }
        size="lg"
        footer={
          <Stack direction="horizontal" justify="end" gap="3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSubmit()}
              isLoading={submitting}
            >
              {isEditing ? 'Save Changes' : 'Create Prompt'}
            </Button>
          </Stack>
        }
      >
        <form onSubmit={handleSubmit}>
          <Stack direction="vertical" gap="4">
            {errors.general && (
              <Text color="muted" style={{ color: 'var(--atlas-color-danger, #ef4444)' }}>
                {errors.general}
              </Text>
            )}

            {/* Title */}
            <Field label="Title" isRequired errorMessage={errors.title}>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                placeholder="e.g. Next.js App Router Architecture Guide"
                autoFocus
                disabled={submitting}
              />
            </Field>

            {/* Raw Prompt Text */}
            <Field
              label="Prompt Text"
              isRequired
              description="The exact prompt to be copied and used."
              errorMessage={errors.prompt_text}
            >
              <Textarea
                value={promptText}
                onChange={(e) => {
                  setPromptText(e.target.value);
                  if (errors.prompt_text) setErrors({ ...errors, prompt_text: undefined });
                }}
                placeholder="Enter prompt instructions, code template, or generative prompt..."
                rows={6}
                disabled={submitting}
                style={{
                  fontFamily: 'var(--atlas-font-mono, monospace)',
                  fontSize: '0.875rem',
                }}
              />
            </Field>

            {/* Organization row: Category & Collection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Category */}
              <Field label="Category" description="Optional prompt medium type">
                <Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">None (Uncategorized)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </Field>

              {/* Collection */}
              <Field label="Collection" description="Optional organizational group">
                <Select
                  value={collectionId}
                  onChange={handleCollectionChange}
                  disabled={submitting}
                >
                  <option value="">None (Uncollected)</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                  <option value="__CREATE_NEW__">+ Create new collection...</option>
                </Select>
              </Field>
            </div>

            {/* Tags Input */}
            <Field label="Tags" description="Press Enter or comma to add tags">
              <Stack direction="vertical" gap="2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => {
                    if (tagInput.trim()) handleAddTag(tagInput);
                  }}
                  placeholder="e.g. react, code-review, refactoring"
                  disabled={submitting}
                />
                {tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {tags.map((tag, idx) => (
                      <Tag
                        key={idx}
                        size="sm"
                        variant="subtle"
                        intent="neutral"
                        onRemove={() => handleRemoveTag(idx)}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
              </Stack>
            </Field>

            {/* Optional Short Description */}
            <Field label="Short Description" description="Brief summary shown on prompt cards">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Best practices for App Router architecture"
                disabled={submitting}
              />
            </Field>

            {/* Optional Usage Description */}
            <Field label="Usage Instructions" description="Optional guidance on parameters or when to use this prompt">
              <Textarea
                value={usageDescription}
                onChange={(e) => setUsageDescription(e.target.value)}
                placeholder="e.g. Provide the component diff in the designated slot..."
                rows={3}
                disabled={submitting}
              />
            </Field>
          </Stack>
        </form>
      </Dialog>

      {/* Inline Collection Creation Dialog */}
      <CreateCollectionModal
        open={createCollectionOpen}
        onOpenChange={setCreateCollectionOpen}
        onCreated={handleInlineCollectionCreated}
      />
    </>
  );
}
