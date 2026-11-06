import { Category } from '../../types';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedTag: string;
  onTagChange: (value: string) => void;
  categories: Category[];
  availableTags: string[];
  totalResults: number;
}

export function FilterBar({ search, onSearchChange, selectedCategory, onCategoryChange, selectedTag, onTagChange, categories, availableTags }: FilterBarProps) {
  const active = Boolean(search || selectedCategory || selectedTag);
  return (
    <div className="echo-filter-bar" role="search">
      <label className="echo-search-field">
        <span className="sr-only">Search prompts</span>
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search prompts" />
      </label>
      <label>
        <span className="sr-only">Prompt type</span>
        <select value={selectedCategory} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="">All types</option>
          {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
        </select>
      </label>
      <label>
        <span className="sr-only">Tag</span>
        <select value={selectedTag} onChange={(event) => onTagChange(event.target.value)}>
          <option value="">All tags</option>
          {availableTags.map((tag) => <option value={tag} key={tag}>{tag}</option>)}
        </select>
      </label>
      <button type="button" className="echo-clear-button" disabled={!active} onClick={() => { onSearchChange(''); onCategoryChange(''); onTagChange(''); }}>Clear filters</button>
    </div>
  );
}
