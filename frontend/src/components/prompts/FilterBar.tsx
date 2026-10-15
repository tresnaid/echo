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

  const categoryOptions = [
    { id: '', label: 'All' },
    ...categories.map((c) => ({
      id: c.id,
      label: c.name,
    })),
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.875rem',
        width: '100%',
      }}
    >
      {/* Category Segment Tabs & Active Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div
          role="tablist"
          aria-label="Filter by category"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            backgroundColor: 'var(--atlas-color-bg-subtle, #f1f5f9)',
            padding: '3px',
            borderRadius: 'var(--atlas-radius-md, 8px)',
          }}
        >
          {categoryOptions.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id || 'all'}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onCategoryChange(cat.id)}
                style={{
                  appearance: 'none',
                  cursor: 'pointer',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isActive
                    ? 'var(--atlas-color-text-primary, #0f172a)'
                    : 'var(--atlas-color-text-secondary, #64748b)',
                  backgroundColor: isActive
                    ? 'var(--atlas-color-bg-surface, #ffffff)'
                    : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  boxShadow: isActive ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Active Tag Filter Indicator */}
        {selectedTag && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'var(--atlas-color-bg-subtle, #f1f5f9)',
              border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
              borderRadius: '6px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              color: 'var(--atlas-color-text-primary, #0f172a)',
            }}
          >
            <span style={{ color: 'var(--atlas-color-text-secondary, #64748b)' }}>Tag:</span>
            <span style={{ fontWeight: 600 }}>#{selectedTag}</span>
            <button
              type="button"
              onClick={() => onTagChange('')}
              aria-label="Remove tag filter"
              style={{
                background: 'none',
                border: 'none',
                padding: '0 2px',
                cursor: 'pointer',
                color: 'var(--atlas-color-text-secondary, #64748b)',
                fontSize: '0.875rem',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Right Search Input & Reset Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexGrow: 1,
          justifyContent: 'flex-end',
          minWidth: '220px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--atlas-color-bg-subtle, #f8fafc)',
            border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
            borderRadius: 'var(--atlas-radius-md, 8px)',
            padding: '0.45rem 0.75rem',
            width: '100%',
            maxWidth: '280px',
            boxSizing: 'border-box',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--atlas-color-text-secondary, #64748b)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search prompts"
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '0.8125rem',
              color: 'var(--atlas-color-text-primary, #0f172a)',
              outline: 'none',
              width: '100%',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: 'var(--atlas-color-text-secondary, #64748b)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.4rem 0.6rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--atlas-color-text-secondary, #64748b)',
              whiteSpace: 'nowrap',
              borderRadius: '6px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--atlas-color-text-primary, #0f172a)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--atlas-color-text-secondary, #64748b)')}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;
