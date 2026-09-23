import { useEffect, useState } from 'react';
import {
  Container,
  Stack,
  Heading,
  Text,
  Badge,
  Card,
  Button,
} from '@atlas/ds';

interface HealthStatus {
  status: string;
  database: string;
  timestamp: string;
}

export function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: HealthStatus) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to connect to backend:', err);
        setLoading(false);
      });
  }, []);

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

        {/* Foundation Status Banner */}
        <Card variant="outline">
          <Stack direction="vertical" gap="3">
            <Heading level={3}>Foundation & Persistence Initialized</Heading>
            <Text>
              Atlas Design System (<code>@atlas/ds</code>) and persistent SQLite storage are integrated and active.
            </Text>
            {health && (
              <Text size="sm" color="muted">
                Database: <strong>{health.database}</strong> • Connected at: {new Date(health.timestamp).toLocaleTimeString()}
              </Text>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

export default App;
