import React, { useState, useEffect, useRef } from 'react';
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
  Badge,
  Card,
  IconButton,
} from '@tresnaid/atlas';
import { Prompt, Collection, Category, PromptMedia } from '../../types';
import { createPrompt, updatePrompt, fetchCategories, uploadMediaFiles } from '../../api/prompts';
import { getMediaUrl } from '../../api/config';
import { CreateCollectionModal } from '../collections/CreateCollectionModal';

function TrashIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function UploadIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function LinkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

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
  const [mediaList, setMediaList] = useState<PromptMedia[]>([]);

  // URL attachment inputs
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaTypeInput, setMediaTypeInput] = useState<'image' | 'video'>('image');
  const [mediaCaptionInput, setMediaCaptionInput] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; prompt_text?: string; general?: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setMediaList(prompt.media || []);
      } else {
        setTitle('');
        setPromptText('');
        setDescription('');
        setUsageDescription('');
        setCollectionId(defaultCollectionId ? String(defaultCollectionId) : '');
        setCategoryId('');
        setTags([]);
        setMediaList([]);
      }
      setTagInput('');
      setShowUrlInput(false);
      setMediaUrlInput('');
      setMediaCaptionInput('');
      setErrors({});
    }
  }, [open, prompt, defaultCollectionId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploaded = await uploadMediaFiles(Array.from(files));
      setMediaList((prev) => [...prev, ...uploaded]);
    } catch (err: unknown) {
      setErrors((prev) => ({
        ...prev,
        general: err instanceof Error ? err.message : 'Failed to upload files',
      }));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddMediaUrl = () => {
    const trimmedUrl = mediaUrlInput.trim();
    if (!trimmedUrl) return;

    const newMediaItem: PromptMedia = {
      id: Date.now(),
      prompt_id: prompt?.id || 0,
      media_type: mediaTypeInput,
      url: trimmedUrl,
      thumbnail_url: mediaTypeInput === 'image' ? trimmedUrl : null,
      medium_url: mediaTypeInput === 'image' ? trimmedUrl : null,
      caption: mediaCaptionInput.trim() || null,
      created_at: new Date().toISOString(),
    };

    setMediaList((prev) => [...prev, newMediaItem]);
    setMediaUrlInput('');
    setMediaCaptionInput('');
    setShowUrlInput(false);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

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
        prompt_text: promptText, // exact raw prompt text preserved
        description: description.trim() || null,
        usage_description: usageDescription.trim() || null,
        collection_id: collectionId ? parseInt(collectionId, 10) : null,
        category_id: categoryId || null,
        tags: tags.length > 0 ? tags : undefined,
        media: mediaList,
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
            ? 'Update your prompt text, descriptions, media attachments, and optional tags.'
            : 'Add a structured, reusable prompt to your personal prompt library.'
        }
        size="lg"
        footer={
          <Stack direction="horizontal" justify="end" gap="3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting || uploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSubmit()}
              isLoading={submitting}
              disabled={uploading}
            >
              {isEditing ? 'Save Changes' : 'Create Prompt'}
            </Button>
          </Stack>
        }
      >
        <form
          onSubmit={handleSubmit}
          style={{
            maxHeight: 'calc(80vh - 140px)',
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          <Stack direction="vertical" gap="4">
            {errors.general && (
              <Text color="muted" style={{ color: 'var(--atlas-color-danger, #ef4444)', fontSize: '0.875rem' }}>
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
              description="The exact raw prompt to be copied and used."
              errorMessage={errors.prompt_text}
            >
              <Textarea
                value={promptText}
                onChange={(e) => {
                  setPromptText(e.target.value);
                  if (errors.prompt_text) setErrors({ ...errors, prompt_text: undefined });
                }}
                placeholder="Enter prompt instructions, code template, or generative instructions..."
                rows={6}
                disabled={submitting}
                style={{
                  fontFamily: 'var(--atlas-font-mono, monospace)',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                }}
              />
            </Field>

            {/* Organization row: Category & Collection */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {/* Category */}
              <Field label="Category" description="Optional medium type">
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
              <Field label="Collection" description="Optional organizational folder">
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

            {/* Media Attachments Section */}
            <Field
              label="Photos & Videos"
              description="Attach media examples or reference images (thumbnails auto-generated)"
            >
              <Stack direction="vertical" gap="3">
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />

                {/* Upload & Link Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={uploading}
                    disabled={submitting}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <UploadIcon size={14} />
                    <span>{uploading ? 'Processing Media...' : 'Upload File'}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    disabled={submitting || uploading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <LinkIcon size={14} />
                    <span>{showUrlInput ? 'Cancel URL' : 'Add from URL'}</span>
                  </Button>
                </div>

                {/* Optional Media URL Form */}
                {showUrlInput && (
                  <Card variant="outline" style={{ padding: '0.75rem', backgroundColor: 'var(--atlas-color-bg-subtle, #f8fafc)' }}>
                    <Stack direction="vertical" gap="2">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                        <Select
                          value={mediaTypeInput}
                          onChange={(e) => setMediaTypeInput(e.target.value as 'image' | 'video')}
                        >
                          <option value="image">Image URL</option>
                          <option value="video">Video URL</option>
                        </Select>
                        <Input
                          value={mediaUrlInput}
                          onChange={(e) => setMediaUrlInput(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 180px' }}>
                          <Input
                            value={mediaCaptionInput}
                            onChange={(e) => setMediaCaptionInput(e.target.value)}
                            placeholder="Optional caption..."
                          />
                        </div>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={handleAddMediaUrl}
                          disabled={!mediaUrlInput.trim()}
                        >
                          Attach
                        </Button>
                      </div>
                    </Stack>
                  </Card>
                )}

                {/* Media Attachment Previews Grid */}
                {mediaList.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                      gap: '0.5rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {mediaList.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          borderRadius: 'var(--atlas-radius-md, 6px)',
                          border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                          overflow: 'hidden',
                          backgroundColor: 'var(--atlas-color-bg-subtle, #f8fafc)',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        {item.media_type === 'image' ? (
                          <img
                            src={getMediaUrl(item.thumbnail_url || item.medium_url || item.url)}
                            alt={item.caption || item.file_name || 'Media preview'}
                            style={{
                              width: '100%',
                              height: '84px',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '84px',
                              backgroundColor: '#0f172a',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              letterSpacing: '0.04em',
                            }}
                          >
                            VIDEO
                          </div>
                        )}

                        <div
                          style={{
                            padding: '0.375rem 0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: 'var(--atlas-color-bg-surface, #ffffff)',
                            borderTop: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                          }}
                        >
                          <Badge variant="subtle" size="sm" intent={item.media_type === 'video' ? 'warning' : 'info'}>
                            {item.media_type.toUpperCase()}
                          </Badge>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            isDanger
                            aria-label="Remove media"
                            title="Remove media attachment"
                            icon={<TrashIcon size={12} />}
                            onClick={() => handleRemoveMedia(idx)}
                            style={{
                              minWidth: '22px',
                              minHeight: '22px',
                              width: '22px',
                              height: '22px',
                              borderRadius: 'var(--atlas-radius-sm, 4px)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Stack>
            </Field>

            {/* Tags Input */}
            <Field label="Tags" description="Type a tag and press Enter or comma">
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
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.25rem' }}>
                    {tags.map((tag, idx) => (
                      <Tag
                        key={idx}
                        size="sm"
                        variant="subtle"
                        intent="neutral"
                        onRemove={() => handleRemoveTag(idx)}
                      >
                        #{tag}
                      </Tag>
                    ))}
                  </div>
                )}
              </Stack>
            </Field>

            {/* Optional Short Description */}
            <Field label="Short Description" description="Summary displayed on prompt cards">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Comprehensive architectural instructions for App Router"
                disabled={submitting}
              />
            </Field>

            {/* Optional Usage Instructions */}
            <Field label="Usage Instructions" description="Optional parameters, placeholders, or usage notes">
              <Textarea
                value={usageDescription}
                onChange={(e) => setUsageDescription(e.target.value)}
                placeholder="e.g. Replace [MODEL] with your target model..."
                rows={3}
                disabled={submitting}
              />
            </Field>
          </Stack>
        </form>
      </Dialog>

      {/* Inline Collection Creation Modal */}
      <CreateCollectionModal
        open={createCollectionOpen}
        onOpenChange={setCreateCollectionOpen}
        onCreated={handleInlineCollectionCreated}
      />
    </>
  );
}
