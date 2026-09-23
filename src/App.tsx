import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Stack,
  Heading,
  Text,
  Badge,
  Button,
  Dialog,
} from '@atlas/ds';
import { Collection, CollectionCounts, SelectedCollectionView, Prompt, Category } from './types';
import { fetchCollections } from './api/collections';
import { fetchPrompts, fetchCategories, fetchTags } from './api/prompts';
import { SidebarNavigation } from './components/collections/SidebarNavigation';
import { CreateCollectionModal } from './components/collections/CreateCollectionModal';
import { PromptFormModal } from './components/prompts/PromptFormModal';
import { DeletePromptDialog } from './components/prompts/DeletePromptDialog';
import { PromptDetailModal } from './components/prompts/PromptDetailModal';
import { FilterBar } from './components/prompts/FilterBar';
import { PromptGrid } from './components/prompts/PromptGrid';

interface HealthStatus {
  status: string;
  database: string;
  timestamp: string;
}

function useIsMobile(breakpoint = 860) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

export function App() {
  const isMobile = useIsMobile(860);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [counts, setCounts] = useState<CollectionCounts>({ all: 0, uncollected: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Browsing & Filtering state
  const [selectedView, setSelectedView] = useState<SelectedCollectionView>('all');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [promptsLoading, setPromptsLoading] = useState(true);

  // Modals
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<Prompt | null>(null);
  const [detailPrompt, setDetailPrompt] = useState<Prompt | null>(null);
  const [mobileManageOpen, setMobileManageOpen] = useState(false);
  const [mobileCreateCollectionOpen, setMobileCreateCollectionOpen] = useState(false);

  // Load global metadata (health, collections, categories, tags)
  const loadMetadata = useCallback(async () => {
    try {
      const [healthRes, colData, catData, tagData] = await Promise.all([
        fetch('/api/health').then((r) => r.json()).catch(() => null),
        fetchCollections().catch(() => ({ collections: [], counts: { all: 0, uncollected: 0 } })),
        fetchCategories().catch(() => []),
        fetchTags().catch(() => []),
      ]);
      setHealth(healthRes);
      setCollections(colData.collections);
      setCounts(colData.counts);
      setCategories(catData);
      setAvailableTags(tagData);
    } catch (err) {
      console.error('Failed to load metadata:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load filtered prompts
  const loadPrompts = useCallback(async () => {
    try {
      setPromptsLoading(true);
      const params: Parameters<typeof fetchPrompts>[0] = {};

      if (selectedView === 'uncollected') {
        params.collection_id = 'uncollected';
      } else if (typeof selectedView === 'number') {
        params.collection_id = selectedView;
      }

      if (selectedCategory) {
        params.category_id = selectedCategory;
      }

      if (selectedTag) {
        params.tag = selectedTag;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const data = await fetchPrompts(params);
      setPrompts(data);
    } catch (err) {
      console.error('Failed to load prompts:', err);
    } finally {
      setPromptsLoading(false);
    }
  }, [selectedView, selectedCategory, selectedTag, search]);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const handlePromptSaved = () => {
    loadMetadata();
    loadPrompts();
    setEditingPrompt(null);
  };

  const handlePromptDeleted = () => {
    loadMetadata();
    loadPrompts();
    setDeletingPrompt(null);
  };

  const handleOpenCreatePrompt = () => {
    setEditingPrompt(null);
    setPromptModalOpen(true);
  };

  const handleOpenEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setPromptModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedTag('');
  };

  // Determine active view label
  const activeViewLabel = (() => {
    if (selectedView === 'all') return 'All Prompts';
    if (selectedView === 'uncollected') return 'Uncollected Prompts';
    const found = collections.find((c) => c.id === selectedView);
    return found ? found.name : 'Collection';
  })();

  const defaultCollectionForModal = typeof selectedView === 'number' ? selectedView : null;
  const hasActiveFilters = Boolean(search.trim() || selectedCategory || selectedTag);

  return (
    <Container maxWidth="xl" center style={{ padding: isMobile ? '1rem 0.75rem' : '2rem 1rem' }}>
      <Stack direction="vertical" gap={isMobile ? '4' : '6'}>
        {/* Top App Header */}
        <div
          style={{
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--atlas-color-border-subtle, #e5e7eb)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <Stack direction="horizontal" align="center" gap="2">
              <Heading level={1} style={{ fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 700 }}>
                Echo
              </Heading>
              <Badge variant="subtle" intent="info">MVP</Badge>
            </Stack>

            <Stack direction="horizontal" align="center" gap="2">
              {loading ? (
                <Badge variant="subtle" intent="neutral">Connecting...</Badge>
              ) : health?.status === 'ok' ? (
                <Badge variant="subtle" intent="success">API & DB Online</Badge>
              ) : (
                <Badge variant="subtle" intent="danger">Offline</Badge>
              )}
              <Button variant="primary" size={isMobile ? 'sm' : 'md'} onClick={handleOpenCreatePrompt}>
                New Prompt
              </Button>
            </Stack>
          </div>

          <Text color="secondary" size="sm">
            Prompt library for storing, organizing, finding, inspecting, and quickly copying reusable prompts.
          </Text>
        </div>

        {/* Mobile Horizontal Collection Quick Picker */}
        {isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.25rem',
              WebkitOverflowScrolling: 'touch',
              maxWidth: '100%',
            }}
          >
            {/* All Prompts Chip */}
            <button
              type="button"
              onClick={() => setSelectedView('all')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: selectedView === 'all' ? 600 : 500,
                borderRadius: 'var(--atlas-radius-md, 6px)',
                border: selectedView === 'all'
                  ? '1px solid var(--atlas-color-border-focus, #3b82f6)'
                  : '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                backgroundColor: selectedView === 'all'
                  ? 'var(--atlas-color-bg-subtle, rgba(59, 130, 246, 0.08))'
                  : '#ffffff',
                color: selectedView === 'all'
                  ? 'var(--atlas-color-text-primary, #0f172a)'
                  : 'var(--atlas-color-text-secondary, #475569)',
                cursor: 'pointer',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              <span>All</span>
              <Badge variant="subtle" intent="neutral" size="sm">
                {counts.all}
              </Badge>
            </button>

            {/* Custom Collections */}
            {collections.map((col) => {
              const isSelected = selectedView === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setSelectedView(col.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 600 : 500,
                    borderRadius: 'var(--atlas-radius-md, 6px)',
                    border: isSelected
                      ? '1px solid var(--atlas-color-border-focus, #3b82f6)'
                      : '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                    backgroundColor: isSelected
                      ? 'var(--atlas-color-bg-subtle, rgba(59, 130, 246, 0.08))'
                      : '#ffffff',
                    color: isSelected
                      ? 'var(--atlas-color-text-primary, #0f172a)'
                      : 'var(--atlas-color-text-secondary, #475569)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>{col.name}</span>
                  <Badge variant="subtle" intent="neutral" size="sm">
                    {col.prompt_count}
                  </Badge>
                </button>
              );
            })}

            {/* Uncollected */}
            <button
              type="button"
              onClick={() => setSelectedView('uncollected')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: selectedView === 'uncollected' ? 600 : 500,
                borderRadius: 'var(--atlas-radius-md, 6px)',
                border: selectedView === 'uncollected'
                  ? '1px solid var(--atlas-color-border-focus, #3b82f6)'
                  : '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                backgroundColor: selectedView === 'uncollected'
                  ? 'var(--atlas-color-bg-subtle, rgba(59, 130, 246, 0.08))'
                  : '#ffffff',
                color: selectedView === 'uncollected'
                  ? 'var(--atlas-color-text-primary, #0f172a)'
                  : 'var(--atlas-color-text-secondary, #475569)',
                cursor: 'pointer',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              <span>Uncollected</span>
              <Badge variant="subtle" intent="neutral" size="sm">
                {counts.uncollected}
              </Badge>
            </button>

            {/* Manage Collections Modal Button */}
            <button
              type="button"
              onClick={() => setMobileManageOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.375rem 0.625rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                borderRadius: 'var(--atlas-radius-md, 6px)',
                border: '1px dashed var(--atlas-color-border-subtle, #cbd5e1)',
                backgroundColor: '#ffffff',
                color: 'var(--atlas-color-text-secondary, #475569)',
                cursor: 'pointer',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              <span>Manage Collections</span>
            </button>
          </div>
        )}

        {/* Main Product Layout with Sidebar (on desktop) & Product Catalog Grid */}
        <div style={{ display: 'flex', gap: isMobile ? '1rem' : '2rem', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
          {/* Left Sidebar Navigation (Desktop only) */}
          {!isMobile && (
            <SidebarNavigation
              collections={collections}
              counts={counts}
              selectedView={selectedView}
              onSelectView={(view) => {
                setSelectedView(view);
              }}
              onCollectionsChanged={() => {
                loadMetadata();
                loadPrompts();
              }}
            />
          )}

          {/* Product Grid Area */}
          <div style={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
            <Stack direction="vertical" gap={isMobile ? '4' : '5'}>
              {/* Header: Title + Prompt Count */}
              <Stack direction="horizontal" align="center" justify="between" wrap="wrap" gap="2">
                <Stack direction="horizontal" align="center" gap="3">
                  <Heading level={2} style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: 600 }}>
                    {activeViewLabel}
                  </Heading>
                  <Badge variant="subtle" intent="neutral">
                    {prompts.length} {prompts.length === 1 ? 'item' : 'items'}
                  </Badge>
                </Stack>
              </Stack>

              {/* Filter Bar: Search, Category Pills, Tag Selectors */}
              <FilterBar
                search={search}
                onSearchChange={setSearch}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedTag={selectedTag}
                onTagChange={setSelectedTag}
                categories={categories}
                availableTags={availableTags}
              />

              {/* Product Catalog Grid */}
              <PromptGrid
                prompts={prompts}
                loading={promptsLoading}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={handleClearFilters}
                onCreatePrompt={handleOpenCreatePrompt}
                onEditPrompt={handleOpenEditPrompt}
                onDeletePrompt={setDeletingPrompt}
                onTagClick={(tag) => setSelectedTag(tag)}
                onOpenDetails={(prompt) => setDetailPrompt(prompt)}
              />
            </Stack>
          </div>
        </div>
      </Stack>

      {/* Mobile Manage Collections Modal */}
      {isMobile && (
        <Dialog
          open={mobileManageOpen}
          onOpenChange={setMobileManageOpen}
          title="Manage Collections"
          description="Select, create, rename, or delete collections."
          size="sm"
          footer={
            <Button variant="primary" onClick={() => setMobileManageOpen(false)}>
              Done
            </Button>
          }
        >
          <div style={{ padding: '0.25rem 0' }}>
            <SidebarNavigation
              collections={collections}
              counts={counts}
              selectedView={selectedView}
              onSelectView={(view) => {
                setSelectedView(view);
                setMobileManageOpen(false);
              }}
              onCollectionsChanged={() => {
                loadMetadata();
                loadPrompts();
              }}
              style={{ width: '100%' }}
            />
          </div>
        </Dialog>
      )}

      {/* Mobile Create Collection Modal */}
      <CreateCollectionModal
        open={mobileCreateCollectionOpen}
        onOpenChange={setMobileCreateCollectionOpen}
        onCreated={(col) => {
          loadMetadata();
          setSelectedView(col.id);
        }}
      />

      {/* Prompt Detail Modal */}
      <PromptDetailModal
        prompt={detailPrompt}
        isOpen={Boolean(detailPrompt)}
        onClose={() => setDetailPrompt(null)}
        onEdit={(prompt) => {
          setDetailPrompt(null);
          handleOpenEditPrompt(prompt);
        }}
        onDelete={(prompt) => {
          setDetailPrompt(null);
          setDeletingPrompt(prompt);
        }}
        onTagClick={(tag) => {
          setSelectedTag(tag);
        }}
      />

      {/* Prompt Form Modal (Create & Edit) */}
      <PromptFormModal
        prompt={editingPrompt}
        collections={collections}
        defaultCollectionId={defaultCollectionForModal}
        open={promptModalOpen}
        onOpenChange={(open) => {
          setPromptModalOpen(open);
          if (!open) setEditingPrompt(null);
        }}
        onSaved={handlePromptSaved}
        onCollectionCreated={() => {
          loadMetadata();
        }}
      />

      {/* Delete Prompt Dialog */}
      <DeletePromptDialog
        prompt={deletingPrompt}
        open={Boolean(deletingPrompt)}
        onOpenChange={(open) => {
          if (!open) setDeletingPrompt(null);
        }}
        onDeleted={handlePromptDeleted}
      />
    </Container>
  );
}

export default App;
