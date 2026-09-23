import { SearchInput, Button, Tag } from '@atlas/ds';
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
}: FilterBarProps) {
  const hasActiveFilters = Boolean(search.trim() || selectedCategory || selectedTag);

  const handleClearAll = () => {
    onSearchChange('');
    onCategoryChange('');
    onTagChange('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Search Input & Reset Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <SearchInput
            value={search}
            onValueChange={onSearchChange}
            onClear={() => onSearchChange('')}
            placeholder="Search prompts..."
            size="sm"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', flexShrink: 0 }}
          >
            Reset
          </Button>
        )}
      </div>

      {/* Category Tabs Filter Under Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          overflowX: 'auto',
          paddingBottom: '0.125rem',
          WebkitOverflowScrolling: 'touch',
          maxWidth: '100%',
        }}
      >
        <button
          type="button"
          onClick={() => onCategoryChange('')}
          style={{
            position: 'relative',
            padding: '0.25rem 0.625rem',
            fontSize: '0.75rem',
            fontWeight: selectedCategory === '' ? 600 : 500,
            borderRadius: 'var(--atlas-radius-sm, 4px)',
            border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
            borderTop: '3px solid #64748b',
            backgroundColor: selectedCategory === '' ? 'var(--atlas-color-bg-subtle, #f1f5f9)' : '#ffffff',
            color: selectedCategory === '' ? 'var(--atlas-color-text-primary, #0f172a)' : 'var(--atlas-color-text-secondary, #475569)',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background-color 0.15s ease, color 0.15s ease',
          }}
        >
          All
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
                position: 'relative',
                padding: '0.25rem 0.625rem',
                fontSize: '0.75rem',
                fontWeight: isSelected ? 600 : 500,
                borderRadius: 'var(--atlas-radius-sm, 4px)',
                border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                borderTop: `3px solid ${accentColor}`,
                backgroundColor: isSelected ? 'var(--atlas-color-bg-subtle, #f1f5f9)' : '#ffffff',
                color: isSelected ? 'var(--atlas-color-text-primary, #0f172a)' : 'var(--atlas-color-text-secondary, #475569)',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
            >
              {cat.name}
            </button>
          );
        })}

        {/* Active Tag Chip (only shown when a tag filter is active) */}
        {selectedTag && (
          <div style={{ marginLeft: '0.25rem', flexShrink: 0 }}>
            <Tag
              size="sm"
              variant="solid"
              intent="neutral"
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
