import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Stack,
  Heading,
  Text,
  Badge,
  Button,
  Dialog,
} from '@tresnaid/atlas';
import { Collection, CollectionCounts, SelectedCollectionView, Prompt, Category } from './types';
import { fetchCollections } from './api/collections';
import { fetchPrompts, fetchCategories, fetchTags } from './api/prompts';
import { getApiUrl } from './api/config';
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

function PlusIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function LayersIcon({ size = 14 }: { size?: number }) {
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
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function useIsMobile(breakpoint = 840) {
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
  const isMobile = useIsMobile(840);
  const [isScrolled, setIsScrolled] = useState(false);
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

  // Scroll listener for sticky header elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 4);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load global metadata (health, collections, categories, tags)
  const loadMetadata = useCallback(async () => {
    try {
      const [healthRes, colData, catData, tagData] = await Promise.all([
        fetch(getApiUrl('/api/health')).then((r) => r.json()).catch(() => null),
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--atlas-color-bg-canvas, #f8fafc)',
      }}
    >
      {/* Sticky App Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderBottom: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
          boxShadow: isScrolled
            ? '0 4px 20px -2px rgba(15, 23, 42, 0.06)'
            : 'none',
          transition: 'box-shadow 0.2s ease, background-color 0.2s ease',
          width: '100%',
        }}
      >
        <Container maxWidth="xl" center style={{ padding: isMobile ? '0.625rem 0.875rem' : '0.875rem 1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            {/* Brand / Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => setSelectedView('all')}
              >
                <img
                  src="/echo-logo.svg"
                  alt="Echo"
                  style={{
                    width: isMobile ? '26px' : '28px',
                    height: isMobile ? '26px' : '28px',
                    borderRadius: '7px',
                    flexShrink: 0,
                  }}
                />
                <Heading
                  level={1}
                  style={{
                    fontSize: isMobile ? '1.25rem' : '1.375rem',
                    fontWeight: 700,
                    letterSpacing: '-0.025em',
                    margin: 0,
                    color: 'var(--atlas-color-text-primary, #0f172a)',
                  }}
                >
                  Echo
                </Heading>
              </div>

              {!isMobile && (
                <Text
                  color="secondary"
                  size="xs"
                  truncate
                  style={{
                    borderLeft: '1px solid var(--atlas-color-border-subtle, #cbd5e1)',
                    paddingLeft: '0.75rem',
                    color: 'var(--atlas-color-text-muted, #64748b)',
                    maxWidth: '420px',
                    lineHeight: 1.4,
                  }}
                >
                  Prompt library for storing, organizing, and 1-click copying.
                </Text>
              )}
            </div>

            {/* Actions: Health indicator & Create Prompt */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
              {loading ? (
                <Badge variant="subtle" intent="neutral" size="sm">
                  Connecting...
                </Badge>
              ) : health?.status === 'ok' ? (
                <Badge variant="subtle" intent="success" size="sm">
                  Online
                </Badge>
              ) : (
                <Badge variant="subtle" intent="danger" size="sm">
                  Offline
                </Badge>
              )}

              <Button
                variant="primary"
                size={isMobile ? 'sm' : 'md'}
                onClick={handleOpenCreatePrompt}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <PlusIcon size={14} />
                <span>New Prompt</span>
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, width: '100%' }}>
        <Container
          maxWidth="xl"
          center
          style={{
            padding: isMobile ? '1rem 0.875rem 2.5rem' : '1.5rem 1.25rem 3.5rem',
          }}
        >
          <Stack direction="vertical" gap={isMobile ? '4' : '5'}>
            {/* Mobile View Header & Collection Pill Bar */}
            {isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {/* Active View Context Title & Counter */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <Heading
                      level={2}
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        margin: 0,
                        color: 'var(--atlas-color-text-primary, #0f172a)',
                      }}
                    >
                      {activeViewLabel}
                    </Heading>
                    <Badge variant="subtle" intent="neutral" size="sm">
                      {prompts.length}
                    </Badge>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileManageOpen(true)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      color: 'var(--atlas-color-text-brand, #2563eb)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <LayersIcon size={13} />
                    <span>Collections</span>
                  </Button>
                </div>

                {/* Horizontal Quick Collection Picker */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    overflowX: 'auto',
                    paddingBottom: '0.25rem',
                    WebkitOverflowScrolling: 'touch',
                    maxWidth: '100%',
                  }}
                >
                  {/* All Prompts */}
                  <button
                    type="button"
                    onClick={() => setSelectedView('all')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.625rem',
                      fontSize: '0.8125rem',
                      fontWeight: selectedView === 'all' ? 600 : 500,
                      borderRadius: 'var(--atlas-radius-md, 6px)',
                      border: selectedView === 'all'
                        ? '1px solid var(--atlas-color-border-focus, #3b82f6)'
                        : '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                      backgroundColor: selectedView === 'all'
                        ? 'rgba(59, 130, 246, 0.08)'
                        : 'var(--atlas-color-bg-surface, #ffffff)',
                      color: selectedView === 'all'
                        ? 'var(--atlas-color-text-brand, #2563eb)'
                        : 'var(--atlas-color-text-secondary, #475569)',
                      cursor: 'pointer',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>All</span>
                    <Badge
                      variant="subtle"
                      intent={selectedView === 'all' ? 'info' : 'neutral'}
                      size="sm"
                    >
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
                          padding: '0.375rem 0.625rem',
                          fontSize: '0.8125rem',
                          fontWeight: isSelected ? 600 : 500,
                          borderRadius: 'var(--atlas-radius-md, 6px)',
                          border: isSelected
                            ? '1px solid var(--atlas-color-border-focus, #3b82f6)'
                            : '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                          backgroundColor: isSelected
                            ? 'rgba(59, 130, 246, 0.08)'
                            : 'var(--atlas-color-bg-surface, #ffffff)',
                          color: isSelected
                            ? 'var(--atlas-color-text-brand, #2563eb)'
                            : 'var(--atlas-color-text-secondary, #475569)',
                          cursor: 'pointer',
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span>{col.name}</span>
                        <Badge
                          variant="subtle"
                          intent={isSelected ? 'info' : 'neutral'}
                          size="sm"
                        >
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
                      padding: '0.375rem 0.625rem',
                      fontSize: '0.8125rem',
                      fontWeight: selectedView === 'uncollected' ? 600 : 500,
                      borderRadius: 'var(--atlas-radius-md, 6px)',
                      border: selectedView === 'uncollected'
                        ? '1px solid var(--atlas-color-border-focus, #3b82f6)'
                        : '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                      backgroundColor: selectedView === 'uncollected'
                        ? 'rgba(59, 130, 246, 0.08)'
                        : 'var(--atlas-color-bg-surface, #ffffff)',
                      color: selectedView === 'uncollected'
                        ? 'var(--atlas-color-text-brand, #2563eb)'
                        : 'var(--atlas-color-text-secondary, #475569)',
                      cursor: 'pointer',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>Uncollected</span>
                    <Badge
                      variant="subtle"
                      intent={selectedView === 'uncollected' ? 'info' : 'neutral'}
                      size="sm"
                    >
                      {counts.uncollected}
                    </Badge>
                  </button>
                </div>
              </div>
            )}

            {/* Desktop / Responsive Layout with Left Sidebar */}
            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'flex-start',
                flexDirection: isMobile ? 'column' : 'row',
              }}
            >
              {/* Desktop Left Sidebar */}
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

              {/* Main Content & Product Catalog Area */}
              <div style={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
                <Stack direction="vertical" gap="4">
                  {/* Desktop Section Header */}
                  {!isMobile && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <Heading
                          level={2}
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            margin: 0,
                            color: 'var(--atlas-color-text-primary, #0f172a)',
                          }}
                        >
                          {activeViewLabel}
                        </Heading>
                        <Badge variant="subtle" intent="neutral" size="md">
                          {prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Filter Bar */}
                  <FilterBar
                    search={search}
                    onSearchChange={setSearch}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    selectedTag={selectedTag}
                    onTagChange={setSelectedTag}
                    categories={categories}
                    availableTags={availableTags}
                    totalResults={prompts.length}
                  />

                  {/* Prompt Grid / Catalog */}
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
        </Container>
      </main>

      {/* App Footer */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
          backgroundColor: 'var(--atlas-color-bg-surface, #ffffff)',
          padding: isMobile ? '1.25rem 0.875rem' : '1.5rem 1.25rem',
        }}
      >
        <Container maxWidth="xl" center>
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              <img
                src="/echo-logo.svg"
                alt="Echo"
                style={{ width: '18px', height: '18px', borderRadius: '4px' }}
              />
              <Text size="sm" weight="semibold" style={{ color: 'var(--atlas-color-text-primary, #0f172a)' }}>
                Echo
              </Text>
              <Text size="xs" color="muted">
                • Structured Prompt Library
              </Text>
              <Badge variant="subtle" intent="neutral" size="sm">
                v0.1.0
              </Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Text size="xs" color="muted">
                Built with Atlas Design System
              </Text>
            </div>
          </div>
        </Container>
      </footer>

      {/* Mobile Manage Collections Modal */}
      {isMobile && (
        <Dialog
          open={mobileManageOpen}
          onOpenChange={setMobileManageOpen}
          title="Collections"
          description="Switch, create, rename, or delete collections in your library."
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
              style={{ width: '100%', border: 'none', boxShadow: 'none', padding: 0 }}
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
    </div>
  );
}

export default App;
