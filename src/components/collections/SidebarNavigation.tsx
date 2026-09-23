import React, { useState } from 'react';
import {
  NavList,
  NavItem,
} from '@atlas/ds';
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

function EditIcon({ size = 12 }: { size?: number }) {
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
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon({ size = 12 }: { size?: number }) {
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

function PlusIcon({ size = 12 }: { size?: number }) {
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function SidebarNavigation({
  collections,
  counts,
  selectedView,
  onSelectView,
  onCollectionsChanged,
  style,
}: SidebarNavigationProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [renamingCollection, setRenamingCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);

  const handleCreated = (newCol: Collection) => {
    onCollectionsChanged();
    onSelectView(newCol.id);
  };

  const handleRenamed = () => {
    onCollectionsChanged();
  };

  const handleDeleted = (deletedId: number) => {
    onCollectionsChanged();
    if (selectedView === deletedId) {
      onSelectView('all');
    }
  };

  return (
    <aside style={{ width: '210px', flexShrink: 0, ...style }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {/* Navigation Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 0.5rem 0.25rem',
          }}
        >
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--atlas-color-text-muted, #94a3b8)',
            }}
          >
            Collections
          </span>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            aria-label="Create collection"
            title="Create collection"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '2px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '3px',
            }}
          >
            <PlusIcon size={13} />
          </button>
        </div>

        {/* Official Atlas NavList */}
        <NavList density="compact">
          {/* All Prompts */}
          <NavItem
            label="All Prompts"
            badge={
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: selectedView === 'all' ? '#2563eb' : '#64748b',
                  backgroundColor: selectedView === 'all' ? 'rgba(37, 99, 235, 0.12)' : '#f1f5f9',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  minWidth: '18px',
                  textAlign: 'center',
                  lineHeight: '1.4',
                }}
              >
                {counts.all}
              </span>
            }
            badgePosition="leading"
            isSelected={selectedView === 'all'}
            onClick={() => onSelectView('all')}
          />

          {/* Collections List */}
          {collections.map((col) => {
            const isSelected = selectedView === col.id;
            return (
              <NavItem
                key={col.id}
                label={col.name}
                badge={
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: isSelected ? '#2563eb' : '#64748b',
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.12)' : '#f1f5f9',
                      padding: '1px 5px',
                      borderRadius: '10px',
                      minWidth: '18px',
                      textAlign: 'center',
                      lineHeight: '1.4',
                    }}
                  >
                    {col.prompt_count}
                  </span>
                }
                badgePosition="leading"
                isSelected={isSelected}
                onClick={() => onSelectView(col.id)}
                actions={
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    <button
                      type="button"
                      aria-label={`Rename ${col.name}`}
                      title={`Rename ${col.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingCollection(col);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        padding: '2px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '3px',
                      }}
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${col.name}`}
                      title={`Delete ${col.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingCollection(col);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444',
                        padding: '2px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '3px',
                      }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                }
              />
            );
          })}

          {/* Uncollected */}
          <NavItem
            label="Uncollected"
            badge={
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: selectedView === 'uncollected' ? '#2563eb' : '#64748b',
                  backgroundColor: selectedView === 'uncollected' ? 'rgba(37, 99, 235, 0.12)' : '#f1f5f9',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  minWidth: '18px',
                  textAlign: 'center',
                  lineHeight: '1.4',
                }}
              >
                {counts.uncollected}
              </span>
            }
            badgePosition="leading"
            isSelected={selectedView === 'uncollected'}
            onClick={() => onSelectView('uncollected')}
          />
        </NavList>
      </div>

      {/* Modals */}
      <CreateCollectionModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={handleCreated}
      />

      <RenameCollectionModal
        collection={renamingCollection}
        open={Boolean(renamingCollection)}
        onOpenChange={(open) => {
          if (!open) setRenamingCollection(null);
        }}
        onRenamed={handleRenamed}
      />

      <DeleteCollectionDialog
        collection={deletingCollection}
        open={Boolean(deletingCollection)}
        onOpenChange={(open) => {
          if (!open) setDeletingCollection(null);
        }}
        onDeleted={handleDeleted}
      />
    </aside>
  );
}
