import { useState } from 'react';
import {
  Stack,
  Text,
  Badge,
  Button,
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
        padding: '0.5rem 0.75rem',
        borderRadius: 'var(--atlas-radius-md, 6px)',
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
          gap: '0.625rem',
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <Badge
          variant="subtle"
          intent="neutral"
          size="sm"
          style={{
            minWidth: '22px',
            textAlign: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {count}
        </Badge>
        <Text
          weight={isSelected ? 'semibold' : 'normal'}
          truncate
          style={{ maxWidth: actions ? '135px' : '185px' }}
        >
          {label}
        </Text>
      </div>

      {actions && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}
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
    <aside style={{ width: '280px', flexShrink: 0 }}>
      <Stack direction="vertical" gap="1">
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
                <Stack direction="horizontal" gap="1" align="center">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Rename collection ${col.name}`}
                    title={`Rename ${col.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingCollection(col);
                    }}
                    style={{
                      padding: '0.25rem',
                      minWidth: '24px',
                      height: '24px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <EditIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    isDanger
                    aria-label={`Delete collection ${col.name}`}
                    title={`Delete ${col.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingCollection(col);
                    }}
                    style={{
                      padding: '0.25rem',
                      minWidth: '24px',
                      height: '24px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrashIcon />
                  </Button>
                </Stack>
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

        {/* Create New Collection Button at the bottom */}
        <div style={{ paddingTop: '0.5rem', marginTop: '0.25rem', borderTop: '1px solid var(--atlas-color-border-subtle, #e2e8f0)' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Create New Collection
          </Button>
        </div>
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
