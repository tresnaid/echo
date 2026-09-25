import React, { useState } from 'react';
import {
  NavList,
  NavItem,
  IconButton,
  Badge,
} from '@tresnaid/atlas';
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

function EditIcon({ size = 13 }: { size?: number }) {
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

function PlusIcon({ size = 13 }: { size?: number }) {
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

function FolderIcon({ size = 15 }: { size?: number }) {
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
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
  );
}

function SparklesIcon({ size = 15 }: { size?: number }) {
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

function InboxIcon({ size = 15 }: { size?: number }) {
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
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
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
    <aside
      style={{
        width: '240px',
        flexShrink: 0,
        backgroundColor: 'var(--atlas-color-bg-surface, #ffffff)',
        border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
        borderRadius: 'var(--atlas-radius-lg, 8px)',
        padding: '0.75rem 0.5rem',
        boxShadow: 'var(--atlas-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.04))',
        ...style,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
              letterSpacing: '0.08em',
              color: 'var(--atlas-color-text-muted, #64748b)',
            }}
          >
            Library
          </span>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Create collection"
            title="Create new collection"
            icon={<PlusIcon size={14} />}
            onClick={() => setCreateModalOpen(true)}
            style={{
              minWidth: '24px',
              minHeight: '24px',
              width: '24px',
              height: '24px',
              borderRadius: 'var(--atlas-radius-md, 6px)',
              color: 'var(--atlas-color-text-secondary, #475569)',
            }}
          />
        </div>

        {/* Official Atlas NavList */}
        <NavList density="compact">
          {/* All Prompts */}
          <NavItem
            icon={<SparklesIcon size={15} />}
            label="All Prompts"
            badge={
              <Badge
                variant="subtle"
                intent={selectedView === 'all' ? 'info' : 'neutral'}
                size="sm"
              >
                {counts.all}
              </Badge>
            }
            badgePosition="trailing"
            isSelected={selectedView === 'all'}
            onClick={() => onSelectView('all')}
          />

          {/* Uncollected */}
          <NavItem
            icon={<InboxIcon size={15} />}
            label="Uncollected"
            badge={
              <Badge
                variant="subtle"
                intent={selectedView === 'uncollected' ? 'info' : 'neutral'}
                size="sm"
              >
                {counts.uncollected}
              </Badge>
            }
            badgePosition="trailing"
            isSelected={selectedView === 'uncollected'}
            onClick={() => onSelectView('uncollected')}
          />
        </NavList>

        {/* Collections Section Divider & Heading */}
        <div
          style={{
            height: '1px',
            backgroundColor: 'var(--atlas-color-border-subtle, #e2e8f0)',
            margin: '0.25rem 0.25rem',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 0.5rem',
          }}
        >
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--atlas-color-text-muted, #64748b)',
            }}
          >
            Collections ({collections.length})
          </span>
        </div>

        {collections.length === 0 ? (
          <div
            style={{
              padding: '0.75rem 0.5rem',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--atlas-color-text-muted, #94a3b8)',
              fontStyle: 'italic',
            }}
          >
            No custom collections yet
          </div>
        ) : (
          <NavList density="compact">
            {collections.map((col) => {
              const isSelected = selectedView === col.id;
              return (
                <NavItem
                  key={col.id}
                  icon={<FolderIcon size={15} />}
                  label={col.name}
                  badge={
                    <Badge
                      variant="subtle"
                      intent={isSelected ? 'info' : 'neutral'}
                      size="sm"
                    >
                      {col.prompt_count}
                    </Badge>
                  }
                  badgePosition="trailing"
                  isSelected={isSelected}
                  onClick={() => onSelectView(col.id)}
                  actions={
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        aria-label={`Rename ${col.name}`}
                        title={`Rename ${col.name}`}
                        icon={<EditIcon size={12} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingCollection(col);
                        }}
                        style={{
                          minWidth: '22px',
                          minHeight: '22px',
                          width: '22px',
                          height: '22px',
                          borderRadius: 'var(--atlas-radius-sm, 4px)',
                          color: 'var(--atlas-color-text-muted, #94a3b8)',
                        }}
                      />
                      <IconButton
                        size="sm"
                        variant="ghost"
                        isDanger
                        aria-label={`Delete ${col.name}`}
                        title={`Delete ${col.name}`}
                        icon={<TrashIcon size={12} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingCollection(col);
                        }}
                        style={{
                          minWidth: '22px',
                          minHeight: '22px',
                          width: '22px',
                          height: '22px',
                          borderRadius: 'var(--atlas-radius-sm, 4px)',
                        }}
                      />
                    </div>
                  }
                />
              );
            })}
          </NavList>
        )}
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
