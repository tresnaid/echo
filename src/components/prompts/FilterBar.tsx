import React from 'react';
import { Stack, Input, Button, Tag, Text } from '@atlas/ds';
import { Category } from '../../types';

interface FilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  categories: Category[];
  availableTags: string[];
}

export function FilterBar({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTag,
  onTagChange,
  categories,
  availableTags,
}: FilterBarProps) {
  const hasActiveFilters = Boolean(search.trim() || selectedCategory || selectedTag);

  const handleClearAll = () => {
    onSearchChange('');
    onCategoryChange('');
    onTagChange('');
  };

  return (
    <Stack direction="vertical" gap="3">
      {/* Search Input and Reset Action */}
      <Stack direction="horizontal" align="center" gap="3">
        <div style={{ flexGrow: 1, position: 'relative' }}>
          <Input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            placeholder="Search prompts by title, description, or tags..."
            style={{ paddingRight: search ? '2.5rem' : '0.875rem' }}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--atlas-color-text-muted, #9ca3af)',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.25rem',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            Reset Filters
          </Button>
        )}
      </Stack>

      {/* Category Filter Pills */}
      <Stack direction="horizontal" align="center" wrap="wrap" gap="2">
        <Text size="xs" color="muted" weight="medium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.25rem' }}>
          Type:
        </Text>

        <Button
          variant={selectedCategory === '' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange('')}
          style={{ padding: '0.25rem 0.75rem', height: 'auto', fontSize: '0.8125rem' }}
        >
          All Types
        </Button>

        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(selectedCategory === cat.id ? '' : cat.id)}
            style={{ padding: '0.25rem 0.75rem', height: 'auto', fontSize: '0.8125rem' }}
          >
            {cat.name}
          </Button>
        ))}
      </Stack>

      {/* Tag Filter row (if tags exist or if a tag is selected) */}
      {(availableTags.length > 0 || selectedTag) && (
        <Stack direction="horizontal" align="center" wrap="wrap" gap="2">
          <Text size="xs" color="muted" weight="medium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.25rem' }}>
            Tags:
          </Text>

          {selectedTag ? (
            <Tag
              size="sm"
              variant="solid"
              intent="neutral"
              onRemove={() => onTagChange('')}
            >
              #{selectedTag} (Active)
            </Tag>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {availableTags.slice(0, 10).map((tag) => (
                <Tag
                  key={tag}
                  size="sm"
                  variant="subtle"
                  intent="neutral"
                  onSelect={() => onTagChange(tag)}
                  style={{ cursor: 'pointer' }}
                >
                  #{tag}
                </Tag>
              ))}
            </div>
          )}
        </Stack>
      )}
    </Stack>
  );
}
