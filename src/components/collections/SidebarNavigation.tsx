import { useState } from 'react';
import {
  Stack,
  Heading,
  Text,
  Badge,
  Button,
  Card,
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
      <Stack direction="vertical" gap="5">
        {/* Main Navigation Items */}
        <Stack direction="vertical" gap="1">
          {/* All Prompts */}
          <button
            type="button"
            onClick={() => onSelectView('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--atlas-radius-md, 6px)',
              border: selectedView === 'all'
                ? '1px solid var(--atlas-color-border-focus, #3b82f6)'
                : '1px solid transparent',
              backgroundColor: selectedView === 'all'
                ? 'var(--atlas-color-bg-subtle, rgba(59, 130, 246, 0.08))'
                : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              font: 'inherit',
              transition: 'background-color 0.15s ease',
            }}
          >
            <Text weight={selectedView === 'all' ? 'semibold' : 'normal'}>
              All Prompts
            </Text>
            <Badge variant="subtle" intent="neutral" size="sm">
              {counts.all}
            </Badge>
          </button>

          {/* Uncollected */}
          <button
            type="button"
            onClick={() => onSelectView('uncollected')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--atlas-radius-md, 6px)',
              border: selectedView === 'uncollected'
                ? '1px solid var(--atlas-color-border-focus, #3b82f6)'
                : '1px solid transparent',
              backgroundColor: selectedView === 'uncollected'
                ? 'var(--atlas-color-bg-subtle, rgba(59, 130, 246, 0.08))'
                : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              font: 'inherit',
              transition: 'background-color 0.15s ease',
            }}
          >
            <Text weight={selectedView === 'uncollected' ? 'semibold' : 'normal'}>
              Uncollected
            </Text>
            <Badge variant="subtle" intent="neutral" size="sm">
              {counts.uncollected}
            </Badge>
          </button>
        </Stack>

        {/* Collections Section */}
        <Stack direction="vertical" gap="2">
          <Stack direction="horizontal" align="center" justify="between">
            <Heading level={4} style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Collections
            </Heading>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              style={{ padding: '0.25rem 0.5rem', height: 'auto', fontSize: '0.8125rem' }}
            >
              + New
            </Button>
          </Stack>

          {collections.length === 0 ? (
            <Card variant="outline" style={{ padding: '0.75rem', textAlign: 'center' }}>
              <Text size="sm" color="muted">
                No collections yet. Click "+ New" to create one.
              </Text>
            </Card>
          ) : (
            <Stack direction="vertical" gap="1">
              {collections.map((col) => {
                const isSelected = selectedView === col.id;
                return (
                  <div
                    key={col.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--atlas-radius-md, 6px)',
                      border: isSelected
                        ? '1px solid var(--atlas-color-border-focus, #3b82f6)'
                        : '1px solid transparent',
                      backgroundColor: isSelected
                        ? 'var(--atlas-color-bg-subtle, rgba(59, 130, 246, 0.08))'
                        : 'transparent',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectView(col.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexGrow: 1,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        font: 'inherit',
                        padding: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <Text
                        weight={isSelected ? 'semibold' : 'normal'}
                        truncate
                        style={{ maxWidth: '140px' }}
                      >
                        {col.name}
                      </Text>
                      <Badge variant="subtle" intent="neutral" size="sm">
                        {col.prompt_count}
                      </Badge>
                    </button>

                    {/* Collection Actions */}
                    <Stack direction="horizontal" gap="1" align="center">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Rename collection ${col.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingCollection(col);
                        }}
                        style={{ padding: '0.125rem 0.375rem', height: 'auto', fontSize: '0.75rem' }}
                      >
                        Rename
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        isDanger
                        aria-label={`Delete collection ${col.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingCollection(col);
                        }}
                        style={{ padding: '0.125rem 0.375rem', height: 'auto', fontSize: '0.75rem' }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </div>
                );
              })}
            </Stack>
          )}
        </Stack>
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
