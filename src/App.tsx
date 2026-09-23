import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Stack,
  Heading,
  Text,
  Badge,
  Card,
  Button,
} from '@atlas/ds';
import { Collection, CollectionCounts, SelectedCollectionView } from './types';
import { fetchCollections } from './api/collections';
import { SidebarNavigation } from './components/collections/SidebarNavigation';

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
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Determine active view label
  const activeViewLabel = (() => {
    if (selectedView === 'all') return 'All Prompts';
    if (selectedView === 'uncollected') return 'Uncollected Prompts';
    const found = collections.find((c) => c.id === selectedView);
    return found ? found.name : 'Collection';
  })();

  const activeViewCount = (() => {
    if (selectedView === 'all') return counts.all;
    if (selectedView === 'uncollected') return counts.uncollected;
    const found = collections.find((c) => c.id === selectedView);
    return found ? found.prompt_count : 0;
  })();

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
            <Button variant="primary">
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
            onCollectionsChanged={loadData}
          />

          {/* Right Main Area */}
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="vertical" gap="4">
              {/* Active Collection View Header */}
              <Stack direction="horizontal" align="center" justify="between">
                <Stack direction="horizontal" align="center" gap="3">
                  <Heading level={2}>{activeViewLabel}</Heading>
                  <Badge variant="subtle" intent="neutral">
                    {activeViewCount} {activeViewCount === 1 ? 'prompt' : 'prompts'}
                  </Badge>
                </Stack>
              </Stack>

              {/* Prompts Area Placeholder */}
              <Card variant="outline" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <Stack direction="vertical" align="center" gap="3">
                  <Heading level={4}>No prompts found in this view</Heading>
                  <Text color="muted" style={{ maxWidth: '400px' }}>
                    {selectedView === 'all'
                      ? 'Get started by creating your first prompt using the "+ New Prompt" button.'
                      : `No prompts currently in "${activeViewLabel}". Prompts added to this collection will appear here.`}
                  </Text>
                </Stack>
              </Card>
            </Stack>
          </div>
        </div>
      </Stack>
    </Container>
  );
}

export default App;
