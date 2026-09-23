import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Stack,
  Heading,
  Text,
  Badge,
  Card,
  Button,
  Tag,
} from '@atlas/ds';
import { Collection, CollectionCounts, SelectedCollectionView, Prompt } from './types';
import { fetchCollections } from './api/collections';
import { fetchPrompts } from './api/prompts';
import { SidebarNavigation } from './components/collections/SidebarNavigation';
import { PromptFormModal } from './components/prompts/PromptFormModal';
import { DeletePromptDialog } from './components/prompts/DeletePromptDialog';

interface HealthStatus {
  status: string;
  database: string;
  timestamp: string;
}

export function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [counts, setCounts] = useState<CollectionCounts>({ all: 0, uncollected: 0 });
  const [selectedView, setSelectedView] = useState<SelectedCollectionView>('all');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  // Prompt Form & Delete Dialog states
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<Prompt | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [healthRes, colData] = await Promise.all([
        fetch('/api/health').then((r) => r.json()).catch(() => null),
        fetchCollections().catch(() => ({ collections: [], counts: { all: 0, uncollected: 0 } })),
      ]);
      setHealth(healthRes);
      setCollections(colData.collections);
      setCounts(colData.counts);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPrompts = useCallback(async () => {
    try {
      const params: Parameters<typeof fetchPrompts>[0] = {};
      if (selectedView === 'uncollected') {
        params.collection_id = 'uncollected';
      } else if (typeof selectedView === 'number') {
        params.collection_id = selectedView;
      }
      const data = await fetchPrompts(params);
      setPrompts(data);
    } catch (err) {
      console.error('Failed to load prompts:', err);
    }
  }, [selectedView]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const handlePromptSaved = () => {
    loadData();
    loadPrompts();
    setEditingPrompt(null);
  };

  const handlePromptDeleted = () => {
    loadData();
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

  // Determine active view label
  const activeViewLabel = (() => {
    if (selectedView === 'all') return 'All Prompts';
    if (selectedView === 'uncollected') return 'Uncollected Prompts';
    const found = collections.find((c) => c.id === selectedView);
    return found ? found.name : 'Collection';
  })();

  const defaultCollectionForModal = typeof selectedView === 'number' ? selectedView : null;

  return (
    <Container maxWidth="xl" center style={{ padding: '2rem 1rem' }}>
      <Stack direction="vertical" gap="6">
        {/* App Header */}
        <Stack
          direction="horizontal"
          align="center"
          justify="between"
          wrap="wrap"
          gap="4"
        >
          <Stack direction="vertical" gap="1">
            <Stack direction="horizontal" align="center" gap="3">
              <Heading level={1}>Echo</Heading>
              <Badge variant="subtle" intent="info">MVP</Badge>
            </Stack>
            <Text color="secondary">
              Multi-medium prompt library for storing, organizing, finding, and copying prompts.
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

        {/* Main Content Layout with Sidebar */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Left Sidebar Navigation */}
          <SidebarNavigation
            collections={collections}
            counts={counts}
            selectedView={selectedView}
            onSelectView={setSelectedView}
            onCollectionsChanged={() => {
              loadData();
              loadPrompts();
            }}
          />

          {/* Right Main Area */}
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="vertical" gap="4">
              {/* Active Collection View Header */}
              <Stack direction="horizontal" align="center" justify="between">
                <Stack direction="horizontal" align="center" gap="3">
                  <Heading level={2}>{activeViewLabel}</Heading>
                  <Badge variant="subtle" intent="neutral">
                    {prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'}
                  </Badge>
                </Stack>
              </Stack>

              {/* Prompts List / Empty State */}
              {prompts.length === 0 ? (
                <Card variant="outline" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                  <Stack direction="vertical" align="center" gap="3">
                    <Heading level={4}>No prompts found in this view</Heading>
                    <Text color="muted" style={{ maxWidth: '400px' }}>
                      {selectedView === 'all'
                        ? 'Get started by creating your first prompt using the "+ New Prompt" button.'
                        : `No prompts currently in "${activeViewLabel}".`}
                    </Text>
                    <Button variant="primary" onClick={handleOpenCreatePrompt}>
                      + Create Prompt
                    </Button>
                  </Stack>
                </Card>
              ) : (
                <Stack direction="vertical" gap="3">
                  {prompts.map((p) => (
                    <Card key={p.id} variant="outline" style={{ padding: '1.25rem' }}>
                      <Stack direction="vertical" gap="3">
                        <Stack direction="horizontal" align="center" justify="between" wrap="wrap" gap="2">
                          <Stack direction="horizontal" align="center" gap="2">
                            <Heading level={3} style={{ fontSize: '1.125rem' }}>{p.title}</Heading>
                            {p.category_id && (
                              <Badge variant="subtle" intent="info" size="sm">
                                {p.category_id.toUpperCase()}
                              </Badge>
                            )}
                          </Stack>
                          <Stack direction="horizontal" gap="2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditPrompt(p)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              isDanger
                              onClick={() => setDeletingPrompt(p)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </Stack>

                        {p.description && (
                          <Text color="secondary" size="sm">
                            {p.description}
                          </Text>
                        )}

                        {p.tags && p.tags.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                            {p.tags.map((tag, idx) => (
                              <Tag key={idx} size="sm" variant="subtle" intent="neutral">
                                {tag}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}
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
          loadData();
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
