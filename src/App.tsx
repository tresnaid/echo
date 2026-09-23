import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Stack,
  Heading,
  Text,
  Badge,
  Button,
} from '@atlas/ds';
import { Collection, CollectionCounts, SelectedCollectionView, Prompt, Category } from './types';
import { fetchCollections } from './api/collections';
import { fetchPrompts, fetchCategories, fetchTags } from './api/prompts';
import { SidebarNavigation } from './components/collections/SidebarNavigation';
import { PromptFormModal } from './components/prompts/PromptFormModal';
import { DeletePromptDialog } from './components/prompts/DeletePromptDialog';
import { FilterBar } from './components/prompts/FilterBar';
import { PromptGrid } from './components/prompts/PromptGrid';

interface HealthStatus {
  status: string;
  database: string;
  timestamp: string;
}

export function App() {
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
    <Container maxWidth="xl" center style={{ padding: '2rem 1rem' }}>
      <Stack direction="vertical" gap="6">
        {/* Top App Header */}
        <Stack
          direction="horizontal"
          align="center"
          justify="between"
          wrap="wrap"
          gap="4"
          style={{
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--atlas-color-border-subtle, #e5e7eb)',
          }}
        >
          <Stack direction="vertical" gap="1">
            <Stack direction="horizontal" align="center" gap="3">
              <Heading level={1} style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                Echo
              </Heading>
              <Badge variant="subtle" intent="info">MVP</Badge>
            </Stack>
            <Text color="secondary" size="sm">
              Prompt library for storing, organizing, finding, inspecting, and quickly copying reusable prompts.
            </Text>
          </Stack>

          <Stack direction="horizontal" align="center" gap="3">
            {loading ? (
              <Badge variant="subtle" intent="neutral">Connecting...</Badge>
            ) : health?.status === 'ok' ? (
              <Badge variant="subtle" intent="success">API & DB Online</Badge>
            ) : (
              <Badge variant="subtle" intent="danger">Offline</Badge>
            )}
            <Button variant="primary" onClick={handleOpenCreatePrompt}>
              + New Prompt
            </Button>
          </Stack>
        </Stack>

        {/* Main Product Layout with Sidebar & Product Catalog Grid */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Left Sidebar Navigation */}
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

          {/* Right Product Grid Area */}
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="vertical" gap="5">
              {/* Header: Title + Prompt Count */}
              <Stack direction="horizontal" align="center" justify="between" wrap="wrap" gap="2">
                <Stack direction="horizontal" align="center" gap="3">
                  <Heading level={2} style={{ fontSize: '1.25rem', fontWeight: 600 }}>
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
              />
            </Stack>
          </div>
        </div>
      </Stack>

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
