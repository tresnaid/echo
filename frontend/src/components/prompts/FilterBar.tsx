import React from 'react';
import { SearchInput, Button, Tag, FilterPills, FilterPillItem } from '@tresnaid/atlas';
import { Category } from '../../types';

interface FilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  categories: Category[];
  availableTags?: string[];
  totalResults?: number;
}

function TextIcon({ size = 14 }: { size?: number }) {
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
      <path d="M17 6.1H3" />
      <path d="M21 12.1H3" />
      <path d="M15.1 18H3" />
    </svg>
  );
}

function CodeIcon({ size = 14 }: { size?: number }) {
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
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function ImageIcon({ size = 14 }: { size?: number }) {
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
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function VideoIcon({ size = 14 }: { size?: number }) {
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
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}

function SparklesIcon({ size = 14 }: { size?: number }) {
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
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  all: <SparklesIcon size={14} />,
  text: <TextIcon size={14} />,
  code: <CodeIcon size={14} />,
  image: <ImageIcon size={14} />,
  video: <VideoIcon size={14} />,
};

export function FilterBar({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTag,
  onTagChange,
  categories,
}: FilterBarProps) {
  const hasActiveFilters = Boolean(search.trim() || selectedCategory || selectedTag);

  const handleClearAll = () => {
    onSearchChange('');
    onCategoryChange('');
    onTagChange('');
  };

  // Build filter pills items
  const filterItems: FilterPillItem[] = [
    {
      id: '',
      label: 'All Media',
      icon: CATEGORY_ICONS.all,
    },
    ...categories.map((cat) => ({
      id: cat.id,
      label: cat.name,
      icon: CATEGORY_ICONS[cat.id.toLowerCase()] || <TextIcon size={14} />,
    })),
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%',
      }}
    >
      {/* Top Search & Reset Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          width: '100%',
        }}
      >
        <div style={{ flex: '1 1 320px', maxWidth: '480px' }}>
          <SearchInput
            value={search}
            onValueChange={onSearchChange}
            onClear={() => onSearchChange('')}
            placeholder="Search prompts by title, description, or tag..."
            size="md"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            style={{
              padding: '0.375rem 0.625rem',
              fontSize: '0.8125rem',
              color: 'var(--atlas-color-text-secondary, #475569)',
              flexShrink: 0,
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Category Filter Pills & Active Tag Chip Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '2px',
        }}
      >
        <FilterPills
          items={filterItems}
          value={selectedCategory}
          onChange={(newId) => onCategoryChange(newId)}
          size="sm"
          variant="pills"
          aria-label="Filter by prompt category"
        />

        {/* Active Tag Filter Indicator */}
        {selectedTag && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginLeft: '0.25rem',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--atlas-color-text-muted, #64748b)',
                fontWeight: 500,
              }}
            >
              Tag:
            </span>
            <Tag
              size="sm"
              variant="solid"
              intent="primary"
              onRemove={() => onTagChange('')}
            >
              #{selectedTag}
            </Tag>
          </div>
        )}
      </div>
    </div>
  );
}
