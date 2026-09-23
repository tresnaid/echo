import React, { useState } from 'react';
import {
  Stack,
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

interface SidebarItemProps {
  label: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
  actions?: React.ReactNode;
}

function SidebarItem({
  label,
  count,
  isSelected,
  onClick,
  actions,
}: SidebarItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0.35rem 0.5rem',
        borderRadius: 'var(--atlas-radius-sm, 4px)',
        border: isSelected
          ? '1px solid var(--atlas-color-border-focus, #3b82f6)'
          : '1px solid transparent',
        backgroundColor: isSelected
          ? 'var(--atlas-color-bg-subtle, rgba(59, 130, 246, 0.08))'
          : isHovered
            ? 'var(--atlas-color-bg-subtle, rgba(0, 0, 0, 0.04))'
            : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        userSelect: 'none',
        boxSizing: 'border-box',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexGrow: 1,
          minWidth: 0,
        }}
      >
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
            flexShrink: 0,
          }}
        >
          {count}
        </span>
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: isSelected ? 600 : 450,
            color: isSelected ? '#0f172a' : '#475569',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {label}
        </span>
      </div>

      {actions && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flexShrink: 0 }}
        >
          {actions}
        </div>
      )}
    </div>
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
      <Stack direction="vertical" gap="1">
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

        {/* All Prompts */}
        <SidebarItem
          label="All Prompts"
          count={counts.all}
          isSelected={selectedView === 'all'}
          onClick={() => onSelectView('all')}
        />

        {/* Collections List */}
        {collections.map((col) => {
          const isSelected = selectedView === col.id;
          return (
            <SidebarItem
              key={col.id}
              label={col.name}
              count={col.prompt_count}
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
        <SidebarItem
          label="Uncollected"
          count={counts.uncollected}
          isSelected={selectedView === 'uncollected'}
          onClick={() => onSelectView('uncollected')}
        />
      </Stack>

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
