import { useCallback, useEffect, useState } from 'react';
import { Category, Collection, CollectionCounts, Prompt, SelectedCollectionView } from './types';
import { fetchCollections } from './api/collections';
import { fetchCategories, fetchPrompts, fetchTags } from './api/prompts';
import { getApiUrl } from './api/config';
import { EchoHeader } from './components/layout/EchoHeader';
import { EchoFooter } from './components/layout/EchoFooter';
import { LandingPage } from './components/landing/LandingPage';
import { WorkbenchPage } from './components/workbench/WorkbenchPage';
import { SidebarNavigation } from './components/collections/SidebarNavigation';
import { FilterBar } from './components/prompts/FilterBar';
import { PromptGrid } from './components/prompts/PromptGrid';
import { PromptDetailModal } from './components/prompts/PromptDetailModal';
import { PromptFormModal } from './components/prompts/PromptFormModal';
import { DeletePromptDialog } from './components/prompts/DeletePromptDialog';

interface HealthStatus { status: string; database: string; timestamp: string; }
type View = 'overview' | 'library' | 'workbench';

function viewFromPath(): View {
  if (typeof window === 'undefined') return 'overview';
  if (window.location.pathname.startsWith('/workbench')) return 'workbench';
  if (window.location.pathname.startsWith('/library') || window.location.pathname.startsWith('/app')) return 'library';
  return 'overview';
}

export function App() {
  const [view, setView] = useState<View>(viewFromPath);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [counts, setCounts] = useState<CollectionCounts>({ all: 0, uncollected: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<SelectedCollectionView>('all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [detail, setDetail] = useState<Prompt | null>(null);
  const [deleting, setDeleting] = useState<Prompt | null>(null);

  const navigate = useCallback((next: View) => {
    const path = next === 'overview' ? '/' : `/${next}`;
    setView(next); window.history.pushState(null, '', path); window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  useEffect(() => {
    const pop = () => setView(viewFromPath());
    window.addEventListener('popstate', pop); return () => window.removeEventListener('popstate', pop);
  }, []);

  const loadMetadata = useCallback(async () => {
    try {
      const [healthData, collectionData, categoryData, tagData] = await Promise.all([
        fetch(getApiUrl('/api/health')).then((response) => response.json()).catch(() => null),
        fetchCollections().catch(() => ({ collections: [], counts: { all: 0, uncollected: 0 } })),
        fetchCategories().catch(() => []), fetchTags().catch(() => []),
      ]);
      setHealth(healthData); setCollections(collectionData.collections); setCounts(collectionData.counts); setCategories(categoryData); setTags(tagData);
    } finally { setMetadataLoading(false); }
  }, []);
  const loadPrompts = useCallback(async () => {
    setPromptsLoading(true);
    try {
      const params: Parameters<typeof fetchPrompts>[0] = {};
      if (selectedView === 'uncollected') params.collection_id = 'uncollected'; else if (typeof selectedView === 'number') params.collection_id = selectedView;
      if (category) params.category_id = category; if (tag) params.tag = tag; if (search.trim()) params.search = search.trim();
      setPrompts(await fetchPrompts(params));
    } catch { setPrompts([]); }
    finally { setPromptsLoading(false); }
  }, [selectedView, category, tag, search]);
  useEffect(() => { loadMetadata(); }, [loadMetadata]);
  useEffect(() => { loadPrompts(); }, [loadPrompts]);

  const refresh = () => { loadMetadata(); loadPrompts(); setEditing(null); };
  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (prompt: Prompt) => { setDetail(null); setEditing(prompt); setFormOpen(true); };
  const activeLabel = selectedView === 'all' ? 'All prompts' : selectedView === 'uncollected' ? 'Uncollected' : collections.find((item) => item.id === selectedView)?.name || 'Collection';

  if (view === 'overview') return <LandingPage onOpenApp={() => navigate('library')} onOpenWorkbench={() => navigate('workbench')} />;
  if (view === 'workbench') return (
    <>
      <WorkbenchPage prompts={prompts} categories={categories} collections={collections} availableTags={tags} health={health} loading={metadataLoading || promptsLoading} onOpenCreatePrompt={openCreate} onOpenEditPrompt={openEdit} onOpenLibrary={() => navigate('library')} onOpenLanding={() => navigate('overview')} />
      <PromptFormModal prompt={editing} collections={collections} open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditing(null); }} onSaved={refresh} onCollectionCreated={loadMetadata} />
    </>
  );

  return (
    <div className="echo-page echo-library-page">
      <EchoHeader active="library" onNavigate={navigate} />
      <main>
        <section className="echo-page-title">
          <div><h1>Prompt Library</h1><p>{counts.all} prompts in all collections</p></div>
          <button type="button" className="echo-button echo-button-primary" onClick={openCreate}>New prompt</button>
        </section>
        {health?.status !== 'ok' && <div className="echo-offline-notice" role="status">Offline. Saved content remains visible when available.</div>}
        <div className="echo-library-layout">
          <SidebarNavigation collections={collections} counts={counts} selectedView={selectedView} onSelectView={setSelectedView} onCollectionsChanged={() => { loadMetadata(); loadPrompts(); }} />
          <section className="echo-library-content">
            <FilterBar search={search} onSearchChange={setSearch} selectedCategory={category} onCategoryChange={setCategory} selectedTag={tag} onTagChange={setTag} categories={categories} availableTags={tags} totalResults={prompts.length} />
            <div className="echo-result-heading"><h2>{activeLabel}</h2><span>{prompts.length} results</span></div>
            <PromptGrid prompts={prompts} loading={promptsLoading} hasActiveFilters={Boolean(search || category || tag)} onClearFilters={() => { setSearch(''); setCategory(''); setTag(''); }} onCreatePrompt={openCreate} onTagClick={setTag} onOpenDetails={setDetail} />
          </section>
        </div>
      </main>
      <EchoFooter onNavigate={navigate} status={health?.status === 'ok' ? 'online' : 'offline'} />

      <PromptDetailModal prompt={detail} isOpen={Boolean(detail)} onClose={() => setDetail(null)} onEdit={openEdit} onDelete={(prompt) => { setDetail(null); setDeleting(prompt); }} onTagClick={(value) => { setTag(value); setDetail(null); }} />
      <PromptFormModal prompt={editing} collections={collections} defaultCollectionId={typeof selectedView === 'number' ? selectedView : null} open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditing(null); }} onSaved={refresh} onCollectionCreated={loadMetadata} />
      <DeletePromptDialog prompt={deleting} open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} onDeleted={() => { setDeleting(null); refresh(); }} />
    </div>
  );
}

export default App;
