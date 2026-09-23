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
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                padding: '0.25rem',
              }}
            >
              Clear
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

        <button
          type="button"
          onClick={() => onCategoryChange('')}
          style={{
            padding: '0.3125rem 0.75rem',
            fontSize: '0.8125rem',
            fontWeight: selectedCategory === '' ? 600 : 500,
            borderRadius: 'var(--atlas-radius-sm, 4px)',
            border: selectedCategory === '' ? '1px solid var(--atlas-color-border-focus, #2563eb)' : '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
            borderTop: selectedCategory === '' ? '2.5px solid var(--atlas-color-brand-primary, #2563eb)' : '2.5px solid #64748b',
            backgroundColor: selectedCategory === '' ? 'var(--atlas-color-bg-subtle, #f8fafc)' : '#ffffff',
            color: selectedCategory === '' ? 'var(--atlas-color-brand-primary, #2563eb)' : 'var(--atlas-color-text-secondary, #475569)',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
          }}
        >
          All Types
        </button>

        {categories.map((cat) => {
          const catColors: Record<string, string> = {
            text: '#3b82f6',
            code: '#8b5cf6',
            image: '#10b981',
            video: '#f59e0b',
          };
          const accentColor = catColors[cat.id.toLowerCase()] || '#64748b';
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(isSelected ? '' : cat.id)}
              style={{
                padding: '0.3125rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: isSelected ? 600 : 500,
                borderRadius: 'var(--atlas-radius-sm, 4px)',
                border: isSelected ? `1px solid ${accentColor}` : '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                borderTop: `2.5px solid ${accentColor}`,
                backgroundColor: isSelected ? `${accentColor}15` : '#ffffff',
                color: isSelected ? accentColor : 'var(--atlas-color-text-secondary, #475569)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
              }}
            >
              {cat.name}
            </button>
          );
        })}
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
