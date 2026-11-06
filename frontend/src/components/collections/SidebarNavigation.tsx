import { useState } from 'react';
import { Collection, CollectionCounts, SelectedCollectionView } from '../../types';
import { CreateCollectionModal } from './CreateCollectionModal';
import { RenameCollectionModal } from './RenameCollectionModal';
import { DeleteCollectionDialog } from './DeleteCollectionDialog';

interface SidebarNavigationProps {
  collections: Collection[];
  counts: CollectionCounts;
  selectedView: SelectedCollectionView;
  onSelectView: (view: SelectedCollectionView) => void;
  onCollectionsChanged: () => void;
  style?: React.CSSProperties;
}

export function SidebarNavigation({ collections, counts, selectedView, onSelectView, onCollectionsChanged, style }: SidebarNavigationProps) {
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<Collection | null>(null);
  const [deleting, setDeleting] = useState<Collection | null>(null);
  const item = (value: SelectedCollectionView, label: string, count: number) => (
    <button type="button" className={selectedView === value ? 'is-active' : ''} onClick={() => onSelectView(value)}>
      <span>{label}</span><span>{count}</span>
    </button>
  );
  const selectedCollection = typeof selectedView === 'number' ? collections.find((collection) => collection.id === selectedView) : null;

  return (
    <>
      <aside className="echo-collection-rail" style={style} aria-label="Collections">
        <div className="echo-collection-heading"><strong>Collections</strong><button type="button" aria-label="Create collection" onClick={() => setCreating(true)}>+</button></div>
        <div className="echo-collection-list">
          {item('all', 'All prompts', counts.all)}
          {item('uncollected', 'Uncollected', counts.uncollected)}
          {collections.map((collection) => <span key={collection.id}>{item(collection.id, collection.name, collection.prompt_count)}</span>)}
        </div>
        {selectedCollection && (
          <div className="echo-collection-actions">
            <span>Selected collection</span>
            <button type="button" onClick={() => setRenaming(selectedCollection)}>Rename</button>
            <button type="button" onClick={() => setDeleting(selectedCollection)}>Delete</button>
          </div>
        )}
      </aside>
      <CreateCollectionModal open={creating} onOpenChange={setCreating} onCreated={(collection) => { onCollectionsChanged(); onSelectView(collection.id); }} />
      <RenameCollectionModal collection={renaming} open={Boolean(renaming)} onOpenChange={(open) => !open && setRenaming(null)} onRenamed={onCollectionsChanged} />
      <DeleteCollectionDialog collection={deleting} open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} onDeleted={(id) => { onCollectionsChanged(); if (selectedView === id) onSelectView('all'); }} />
    </>
  );
}
