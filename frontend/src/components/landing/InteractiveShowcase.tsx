import { useState, useMemo } from 'react';
import { Prompt, Category } from '../../types';
import { FilterBar } from '../prompts/FilterBar';
import { PromptGrid } from '../prompts/PromptGrid';

interface ShowcasePrompt {
  id: string;
  title: string;
  category: 'text' | 'code' | 'image' | 'video';
  description: string;
  rawPrompt: string;
  tags: string[];
  usageTip: string;
  collectionName?: string;
  thumbnailUrl?: string;
}

const SAMPLE_PROMPTS: ShowcasePrompt[] = [
  {
    id: 'text-1',
    title: 'Self-Correcting Reasoning Agent',
    category: 'text',
    collectionName: 'AI Strategy & Prompts',
    description: 'System prompt enforcing multi-pass reflection, formal verification, and strict RFC8259 JSON output.',
    rawPrompt: `You are an expert autonomous software engineer. Follow this strict protocol:
1. Deconstruct the user's objective into formal constraints, invariants, and edge cases.
2. Outline candidate architectures and systematically evaluate memory and latency trade-offs.
3. Validate against failure modes: race conditions, unbounded allocations, and network partitions.
4. Output your final response as a valid RFC8259 JSON payload conforming to the requested schema.
Do not emit introductory chatter or markdown code fences outside the JSON object.`,
    tags: ['system-prompt', 'agent', 'json-schema', 'evals'],
    usageTip: 'Ideal for advanced reasoning models requiring zero parse failures and strict JSON conformity.',
  },
  {
    id: 'code-1',
    title: 'Concurrent Stream Worker Pool',
    category: 'code',
    collectionName: 'Frontend Engineering',
    description: 'Production worker pool pattern in Go with bounded channel buffering and graceful deadline drain.',
    rawPrompt: `Write a production-grade worker pool in Go that satisfies these exact invariants:
- Read input tasks from a buffered channel of size {buffer_size}.
- Spawn {worker_count} worker goroutines supervised by a sync.WaitGroup.
- Handle context.Context cancellation cleanly: allow in-flight tasks to complete within a 5-second deadline.
- Collect errors through an aggregate error channel and return a multierror.
- Include unit tests verifying zero goroutine leaks with goleak.VerifyNone.`,
    tags: ['golang', 'concurrency', 'worker-pool', 'production'],
    usageTip: 'Perfect for distributed ingest pipelines and high-throughput background message workers.',
  },
  {
    id: 'image-1',
    title: 'Editorial 35mm Anamorphic Portrait',
    category: 'image',
    collectionName: 'AI Image & Visual Arts',
    description: 'Cinematic portrait recipe featuring Kodak Portra 400 grain, volumetric golden lighting, and diffusion parameters.',
    rawPrompt: `Cinematic editorial portrait of an architect examining structural blueprints in a brutalist concrete pavilion, golden hour side lighting, warm volumetric sun rays cutting through haze, 35mm anamorphic lens, f/1.8 shallow depth of field, natural skin texture, Kodak Portra 400 grain, subtle dust motes --ar 16:9 --style raw --v 6.1 --c 5`,
    tags: ['diffusion', 'portrait', 'anamorphic', 'lighting'],
    usageTip: 'Using --style raw with physical film stock names (Portra 400) anchors diffusion models in authentic lens physics.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'video-1',
    title: 'Orbital Drone Dolly Zoom at Twilight',
    category: 'video',
    collectionName: 'Video Generation & Motion',
    description: 'Camera vector direction with continuous orbital rotation and vertigo zoom for generative video models.',
    rawPrompt: `FPV drone cinematic continuous shot, commencing with a fast forward flyover above a mist-covered sea cliff, transitioning smoothly into a clockwise 180-degree orbital rotation around a solitary lighthouse, twilight dusk ambiance, ocean waves crashing against rocks below, vertigo dolly zoom effect, 24fps motion blur, high dynamic range --motion 6 --camera orbit_right`,
    tags: ['camera-orbit', 'dolly-zoom', 'cinematic', 'video'],
    usageTip: 'Specifying the flight trajectory from forward to orbit prevents cuts and scene disintegration.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'image-2',
    title: 'Retro Polaroid Film Portrait with Prism Flare',
    category: 'image',
    collectionName: 'AI Image & Visual Arts',
    description: 'Authentic 80s instant film aesthetic with vintage chemical borders and organic light leaks.',
    rawPrompt: `Authentic 1980s Polaroid 600 film photograph of smiling candid portraits at an outdoor picnic, soft chromatic aberration, natural rainbow prism light flare across top corner, warm faded film stock color grading with authentic analog grain and vintage chemical border --ar 1:1 --v 6.1`,
    tags: ['vintage', 'polaroid', 'film', 'prism', 'analog'],
    usageTip: 'Specifying the exact camera model (Polaroid 600) guides the color temperature to warm organic shifts.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'video-2',
    title: '3D Kinetic Typography Particle Explosion',
    category: 'video',
    collectionName: 'Video Generation & Motion',
    description: 'Abstract motion graphics scene with fluid simulations and iridescent particle dispersion.',
    rawPrompt: `3D kinetic typography floating in a zero-gravity void, high-speed fluid particle explosion radiating outward, iridescent glass refraction, volumetric caustic lighting, Octane render style, ultra-high resolution --motion 8`,
    tags: ['3d', 'vfx', 'typography', 'kinetic'],
    usageTip: 'High motion parameters work best when paired with zero-gravity camera vectors.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
  },
];

const SAMPLE_LIBRARY_PROMPTS: Prompt[] = [
  {
    id: 101,
    title: 'Self-Correcting Reasoning Agent',
    category_id: 'text',
    collection_name: 'AI Strategy & Prompts',
    description: 'System prompt enforcing multi-pass reflection, formal verification, and strict RFC8259 JSON output.',
    prompt_text: `You are an expert autonomous software engineer. Follow this strict protocol:
1. Deconstruct the user's objective into formal constraints, invariants, and edge cases.
2. Outline candidate architectures and systematically evaluate memory and latency trade-offs.
3. Validate against failure modes: race conditions, unbounded allocations, and network partitions.
4. Output your final response as a valid RFC8259 JSON payload conforming to the requested schema.
Do not emit introductory chatter or markdown code fences outside the JSON object.`,
    tags: ['system-prompt', 'agent', 'json-schema', 'evals'],
    usage_description: 'Ideal for advanced reasoning models requiring zero parse failures and strict JSON conformity.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 102,
    title: 'Concurrent Stream Worker Pool',
    category_id: 'code',
    collection_name: 'Frontend Engineering',
    description: 'Production worker pool pattern in Go with bounded channel buffering and graceful deadline drain.',
    prompt_text: `Write a production-grade worker pool in Go that satisfies these exact invariants:
- Read input tasks from a buffered channel of size {buffer_size}.
- Spawn {worker_count} worker goroutines supervised by a sync.WaitGroup.
- Handle context.Context cancellation cleanly: allow in-flight tasks to complete within a 5-second deadline.
- Collect errors through an aggregate error channel and return a multierror.
- Include unit tests verifying zero goroutine leaks with goleak.VerifyNone.`,
    tags: ['golang', 'concurrency', 'worker-pool', 'production'],
    usage_description: 'Perfect for distributed ingest pipelines and high-throughput background message workers.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 103,
    title: 'Editorial 35mm Anamorphic Portrait',
    category_id: 'image',
    collection_name: 'AI Image & Visual Arts',
    description: 'Cinematic portrait recipe featuring Kodak Portra 400 grain, volumetric golden lighting, and diffusion parameters.',
    prompt_text: `Cinematic editorial portrait of an architect examining structural blueprints in a brutalist concrete pavilion, golden hour side lighting, warm volumetric sun rays cutting through haze, 35mm anamorphic lens, f/1.8 shallow depth of field, natural skin texture, Kodak Portra 400 grain, subtle dust motes --ar 16:9 --style raw --v 6.1 --c 5`,
    tags: ['diffusion', 'portrait', 'anamorphic', 'lighting'],
    media: [
      {
        id: 1031,
        prompt_id: 103,
        media_type: 'image',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
        medium_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        caption: 'Architect in brutalist concrete pavilion',
        created_at: new Date().toISOString(),
      },
    ],
    usage_description: 'Using --style raw with physical film stock names (Portra 400) anchors diffusion models in authentic lens physics.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 104,
    title: 'Orbital Drone Dolly Zoom at Twilight',
    category_id: 'video',
    collection_name: 'Video Generation & Motion',
    description: 'Camera vector direction with continuous orbital rotation and vertigo zoom for generative video models.',
    prompt_text: `FPV drone cinematic continuous shot, commencing with a fast forward flyover above a mist-covered sea cliff, transitioning smoothly into a clockwise 180-degree orbital rotation around a solitary lighthouse, twilight dusk ambiance, ocean waves crashing against rocks below, vertigo dolly zoom effect, 24fps motion blur, high dynamic range --motion 6 --camera orbit_right`,
    tags: ['camera-orbit', 'dolly-zoom', 'cinematic', 'video'],
    media: [
      {
        id: 1041,
        prompt_id: 104,
        media_type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        medium_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        caption: 'Continuous FPV drone rotation preview',
        created_at: new Date().toISOString(),
      },
    ],
    usage_description: 'Specifying the flight trajectory from forward to orbit prevents cuts and scene disintegration.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 105,
    title: 'Isometric 3D Clay Icon Render',
    category_id: 'image',
    collection_name: 'AI Image & Visual Arts',
    description: 'Minimalist 3D clay isometric icon with soft ambient studio lighting and pastel color palettes.',
    prompt_text: `Minimalist isometric 3D render of a modular server rack with floating data disks, smooth matte clay material, pastel gradient palette, subtle subsurface scattering, soft ambient occlusion, studio softbox lighting, clean solid neutral background, 8k resolution, octane render style --ar 1:1 --stylize 250`,
    tags: ['diffusion', '3d', 'iconography', 'isometric'],
    media: [
      {
        id: 1051,
        prompt_id: 105,
        media_type: 'image',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        medium_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
        caption: 'Isometric 3D abstract clay render',
        created_at: new Date().toISOString(),
      },
    ],
    usage_description: 'Octane render style and stylize 250 ensure clean geometry without noisy artifacts.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 106,
    title: 'React 19 Custom Hook Architect',
    category_id: 'code',
    collection_name: 'Frontend Engineering',
    description: 'Generates type-safe, production-ready React 19 custom hooks with clean cleanup lifecycle and TypeScript generics.',
    prompt_text: `Act as a Principal Frontend Engineer specializing in React 19 and modern TypeScript.
Design a robust custom hook for the following requirements:
[Describe requirements here]

Rules:
1. Use strict TypeScript types and generics without 'any'.
2. Return a readonly tuple or object with precise return types.
3. Handle race conditions with cleanup flags or AbortController where appropriate.
4. Keep the API surface minimal and idiomatic.`,
    tags: ['react', 'typescript', 'hooks'],
    usage_description: 'Provide the intended state, reactive dependencies, and external subscription behavior.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 107,
    title: 'Executive Briefing Synthesizer',
    category_id: 'text',
    collection_name: 'AI Strategy & Prompts',
    description: 'Condenses dense technical proposals or product reports into a structured 3-part briefing for leadership.',
    prompt_text: `Analyze the provided document and produce an executive briefing with the following structure:
1. Core Problem & Business Context (max 2 sentences)
2. Strategic Recommendation & Key Value Proposition (3 concise bullets)
3. Risks, Trade-offs & Immediate Next Steps (table with Risk, Impact, Mitigation)

Keep tone objective, direct, and free of fluff.
[Paste Document Here]`,
    tags: ['summary', 'executive', 'business'],
    usage_description: 'Paste raw technical doc or meeting transcript below the prompt.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 108,
    title: '3D Kinetic Typography Particle Burst',
    category_id: 'video',
    collection_name: 'Video Generation & Motion',
    description: 'Abstract motion graphics scene with fluid simulations and iridescent particle dispersion.',
    prompt_text: `3D kinetic typography floating in a zero-gravity void, high-speed fluid particle explosion radiating outward, iridescent glass refraction, volumetric caustic lighting, Octane render style, ultra-high resolution --motion 8`,
    tags: ['3d', 'vfx', 'typography', 'kinetic'],
    media: [
      {
        id: 1081,
        prompt_id: 108,
        media_type: 'image',
        url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
        medium_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80',
        caption: 'Kinetic particle dispersion preview',
        created_at: new Date().toISOString(),
      },
    ],
    usage_description: 'High motion parameters work best when paired with zero-gravity camera vectors.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'text', name: 'Text & LLM' },
  { id: 'code', name: 'Code Synthesis' },
  { id: 'image', name: 'Image Synthesis' },
  { id: 'video', name: 'Video Generation' },
];

interface InteractiveShowcaseProps {
  onOpenApp?: () => void;
  onOpenWorkbench?: () => void;
  onOpenDetails?: (prompt: Prompt) => void;
}

export function InteractiveShowcase({
  onOpenApp,
  onOpenWorkbench: _onOpenWorkbench,
  onOpenDetails,
}: InteractiveShowcaseProps) {
  // 2 Ways of viewing prompt collection on landing page
  const [activeTab, setActiveTab] = useState<'workbench' | 'library'>('workbench');

  // Workbench Inspector state (uses SAMPLE_PROMPTS)
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePromptId, setActivePromptId] = useState(SAMPLE_PROMPTS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Library Grid View state (uses SAMPLE_LIBRARY_PROMPTS)
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryCategory, setLibraryCategory] = useState('');
  const [libraryTag, setLibraryTag] = useState('');

  const sampleTags = useMemo(() => {
    const tagSet = new Set<string>();
    SAMPLE_LIBRARY_PROMPTS.forEach((p) => {
      if (p.tags) p.tags.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, []);

  const filteredLibraryPrompts = useMemo(() => {
    return SAMPLE_LIBRARY_PROMPTS.filter((p) => {
      if (librarySearch.trim()) {
        const q = librarySearch.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description ? p.description.toLowerCase().includes(q) : false;
        const matchesText = p.prompt_text.toLowerCase().includes(q);
        const matchesTag = p.tags ? p.tags.some((t) => t.toLowerCase().includes(q)) : false;
        if (!matchesTitle && !matchesDesc && !matchesText && !matchesTag) {
          return false;
        }
      }
      if (libraryCategory && p.category_id !== libraryCategory) {
        return false;
      }
      if (libraryTag && (!p.tags || !p.tags.includes(libraryTag))) {
        return false;
      }
      return true;
    });
  }, [librarySearch, libraryCategory, libraryTag]);

  const filteredWorkbenchPrompts = useMemo(() => {
    return SAMPLE_PROMPTS.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activePrompt = useMemo(() => {
    return (
      SAMPLE_PROMPTS.find((p) => p.id === activePromptId) ||
      filteredWorkbenchPrompts[0] ||
      SAMPLE_PROMPTS[0]
    );
  }, [activePromptId, filteredWorkbenchPrompts]);

  const handleCopy = async (promptText: string, id: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(promptText);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        return;
      }
      throw new Error('Clipboard API unavailable');
    } catch {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = promptText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        textArea.remove();
        if (successful) {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
        }
      } catch (fallbackErr) {
        console.error('Failed to copy prompt to clipboard:', fallbackErr);
      }
    }
  };

  return (
    <section id="showcase" className="echo-showcase-section" aria-labelledby="showcase-heading">
      <div className="echo-section-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 id="showcase-heading" className="echo-section-title">
              Interactive Prompt Showcase & Library
            </h2>
            <p className="echo-section-description">
              Experience Echo's prompt engineering fidelity, verbatim byte preservation, and 1-click clipboard dispatch across multimodal domains.
            </p>
          </div>

          {/* 2-Way View Switcher: Workbench Inspector vs Library Grid View */}
          <div className="echo-showcase-view-switcher" role="tablist" aria-label="Showcase View Switcher">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'workbench'}
              className={`echo-view-switch-btn ${activeTab === 'workbench' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('workbench')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              <span>Workbench Inspector</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'library'}
              className={`echo-view-switch-btn ${activeTab === 'library' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('library')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Library Grid View</span>
            </button>
          </div>
        </div>
      </div>

      <div className="echo-showcase-container">
        {activeTab === 'workbench' ? (
          <>
            {/* Top Control Bar for Workbench mode */}
            <div className="echo-showcase-toolbar">
              <div className="echo-modality-tabs" role="tablist" aria-label="Filter by Modality">
                {(['all', 'text', 'code', 'image', 'video'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={selectedCategory === cat}
                    className={`echo-modality-tab ${selectedCategory === cat ? 'is-active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === 'all' && 'All Modalities'}
                    {cat === 'text' && 'Text & LLM'}
                    {cat === 'code' && 'Code Synthesis'}
                    {cat === 'image' && 'Image Synthesis'}
                    {cat === 'video' && 'Video Generation'}
                  </button>
                ))}
              </div>

              <div className="echo-showcase-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search sample prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search sample prompts"
                />
              </div>
            </div>

            {/* View 1: Workbench Master-Detail Inspector (Sample Data) */}
            <div className="echo-showcase-body">
              {/* Prompt Selection Sidebar */}
              <aside className="echo-showcase-sidebar" aria-label="Sample Prompts">
                <div className="echo-prompt-preview-list">
                  {filteredWorkbenchPrompts.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
                      No sample prompts match criteria
                    </div>
                  ) : (
                    filteredWorkbenchPrompts.map((p) => {
                      const isSelected = activePrompt.id === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          className={`echo-prompt-preview-item ${isSelected ? 'is-active' : ''}`}
                          onClick={() => setActivePromptId(p.id)}
                        >
                          <div className="echo-preview-title">{p.title}</div>
                          <div className="echo-preview-desc">{p.description}</div>
                        </button>
                      );
                    })
                  )}
                </div>
              </aside>

              {/* Prompt Terminal & Inspector Pane */}
              <main className="echo-showcase-main" aria-label="Prompt Inspector Details">
                <div className="echo-showcase-main-header">
                  <div>
                    <h3 className="echo-showcase-prompt-title">{activePrompt.title}</h3>
                    <p className="echo-showcase-prompt-desc">{activePrompt.description}</p>
                  </div>

                  <button
                    type="button"
                    className={`echo-copy-button ${copiedId === activePrompt.id ? 'is-copied' : ''}`}
                    onClick={() => handleCopy(activePrompt.rawPrompt, activePrompt.id)}
                    aria-label="Copy raw prompt text to clipboard"
                  >
                    {copiedId === activePrompt.id ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Copied Exact!</span>
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>Copy Raw Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Raw Prompt Terminal Box */}
                <pre className="echo-raw-prompt-box">
                  <code>{activePrompt.rawPrompt}</code>
                </pre>

                {/* Tags Metadata */}
                <div className="echo-prompt-metadata-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: 'var(--atlas-color-text-secondary, #475569)' }}>Tags:</span>
                    {activePrompt.tags.map((t) => (
                      <span key={t} className="echo-meta-tag">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--atlas-color-bg-subtle, #f8fafc)',
                    border: '1px solid var(--atlas-color-border-subtle, #e2e8f0)',
                    borderRadius: 'var(--atlas-radius-md, 8px)',
                    padding: '0.75rem 1rem',
                    fontSize: '0.8125rem',
                    color: 'var(--atlas-color-text-secondary, #475569)',
                  }}
                >
                  <strong style={{ color: 'var(--atlas-color-text-primary, #0f172a)' }}>Engineering Note:</strong> {activePrompt.usageTip}
                </div>
              </main>
            </div>
          </>
        ) : (
          /* View 2: Library Grid View (Showcase Sample Data) */
          <div style={{ padding: '2rem 2.25rem 2.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <h3
                  style={{
                    margin: '0 0 0.25rem',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--atlas-color-text-primary, #0f172a)',
                  }}
                >
                  Showcase Library Catalog ({filteredLibraryPrompts.length} Sample {filteredLibraryPrompts.length === 1 ? 'Prompt' : 'Prompts'})
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8125rem',
                    color: 'var(--atlas-color-text-secondary, #64748b)',
                  }}
                >
                  Explore sample multimodal prompts in a responsive masonry layout with category pills and tag filtering.
                </p>
              </div>
            </div>

            {/* FilterBar with same modality tabs */}
            <FilterBar
              search={librarySearch}
              onSearchChange={setLibrarySearch}
              selectedCategory={libraryCategory}
              onCategoryChange={setLibraryCategory}
              selectedTag={libraryTag}
              onTagChange={setLibraryTag}
              categories={DEFAULT_CATEGORIES}
              availableTags={sampleTags}
              totalResults={filteredLibraryPrompts.length}
            />

            {/* PromptGrid with Masonry Layout for Sample Prompts */}
            <div style={{ marginTop: '1.5rem' }}>
              <PromptGrid
                prompts={filteredLibraryPrompts}
                loading={false}
                hasActiveFilters={Boolean(librarySearch.trim() || libraryCategory || libraryTag)}
                onClearFilters={() => {
                  setLibrarySearch('');
                  setLibraryCategory('');
                  setLibraryTag('');
                }}
                onCreatePrompt={onOpenApp || (() => {})}
                onTagClick={(tag) => setLibraryTag(tag)}
                onOpenDetails={onOpenDetails}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default InteractiveShowcase;
