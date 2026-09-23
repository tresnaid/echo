import { getDatabase } from './connection.js';

interface SeedPrompt {
  title: string;
  description: string;
  usageDescription?: string;
  promptText: string;
  category: 'text' | 'code' | 'image' | 'video';
  collection?: string;
  tags: string[];
  media?: {
    media_type: 'image' | 'video';
    url: string;
    thumbnail_url?: string;
    medium_url?: string;
    width?: number;
    height?: number;
    aspect_ratio?: number;
    caption?: string;
  }[];
}

export function seedDatabase() {
  const db = getDatabase();

  const collectionsData = [
    'Frontend Engineering',
    'AI Image & Visual Arts',
    'Technical Writing & Docs',
    'Product Strategy & Planning',
    'Video Generation & Motion',
  ];

  const collectionIds: Record<string, number> = {};
  const insertCollection = db.prepare(`
    INSERT INTO collections (name, created_at, updated_at)
    VALUES (?, ?, ?)
  `);

  const now = new Date();

  for (let i = 0; i < collectionsData.length; i++) {
    const name = collectionsData[i];
    const existing = db.prepare('SELECT id FROM collections WHERE name = ?').get(name) as { id: number } | undefined;
    if (existing) {
      collectionIds[name] = existing.id;
    } else {
      const createdAt = new Date(now.getTime() - (collectionsData.length - i) * 3600000).toISOString();
      const res = insertCollection.run(name, createdAt, createdAt);
      collectionIds[name] = Number(res.lastInsertRowid);
    }
  }

  const samplePrompts: SeedPrompt[] = [
    {
      title: 'React 19 Custom Hook Architect',
      description: 'Generates type-safe, production-ready React 19 custom hooks with clean cleanup lifecycle and idiomatic TypeScript generics.',
      usageDescription: 'Provide the intended state, reactive dependencies, and external subscription behavior.',
      promptText: `Act as a Principal Frontend Engineer specializing in React 19 and modern TypeScript.
Design a robust custom hook for the following requirements:
[Describe requirements here]

Rules:
1. Use strict TypeScript types and generics without 'any'.
2. Return a readonly tuple or object with precise return types.
3. Handle race conditions with cleanup flags or AbortController where appropriate.
4. Keep the API surface minimal and idiomatic.`,
      category: 'code',
      collection: 'Frontend Engineering',
      tags: ['react', 'typescript', 'hooks'],
    },
    {
      title: 'Isometric 3D App Icon Render',
      description: 'Midjourney / Stable Diffusion prompt for clean, minimalist 3D clay isometric application icons with soft studio lighting.',
      usageDescription: 'Replace [OBJECT/CONCEPT] with your target icon concept (e.g. database disk, rocket, compass).',
      promptText: `Minimalist isometric 3D render of a [OBJECT/CONCEPT], smooth matte clay material, pastel gradient palette, subtle subsurface scattering, soft ambient occlusion, studio softbox lighting, clean solid neutral background, 8k resolution, octane render style --ar 1:1 --stylize 250`,
      category: 'image',
      collection: 'AI Image & Visual Arts',
      tags: ['midjourney', '3d', 'iconography', 'isometric'],
      media: [
        {
          media_type: 'image',
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          medium_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=640&q=80',
          thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=320&q=80',
          width: 1200,
          height: 1200,
          aspect_ratio: 1,
          caption: '3D Isometric Abstract Render Example',
        },
      ],
    },
    {
      title: 'Executive Summary Synthesizer',
      description: 'Condenses dense technical proposals or product reports into a structured 3-part briefing for leadership.',
      usageDescription: 'Paste raw technical doc or meeting transcript below the prompt.',
      promptText: `Analyze the provided document and produce an executive briefing with the following structure:
1. Core Problem & Business Context (max 2 sentences)
2. Strategic Recommendation & Key Value Proposition (3 concise bullets)
3. Risks, Trade-offs & Immediate Next Steps (table with Risk, Impact, Mitigation)

Keep tone objective, direct, and free of fluff.
[Paste Document Here]`,
      category: 'text',
      collection: 'Product Strategy & Planning',
      tags: ['summary', 'executive', 'business'],
    },
    {
      title: 'Cinematic Drone Hyperlapse Establishing Shot',
      description: 'Detailed prompt for video generation models (Sora, Runway Gen-3) creating sweeping architectural hyperlapses.',
      usageDescription: 'Replace [LOCATION/SETTING] with desired environment.',
      promptText: `Fpv drone cinematic hyperlapse smoothly ascending above [LOCATION/SETTING] during golden hour, long exposure motion blur on moving traffic below, sun rays breaking through modern glass facades, smooth gimbal roll, ultra realistic 4k 60fps cinematic film grain, color graded in warm teal and amber.`,
      category: 'video',
      collection: 'Video Generation & Motion',
      tags: ['cinematic', 'drone', 'hyperlapse', 'sora'],
      media: [
        {
          media_type: 'video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          thumbnail_url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=640&q=80',
          medium_url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=640&q=80',
          width: 1920,
          height: 1080,
          aspect_ratio: 1.7778,
          caption: 'Drone Sunset Hyperlapse Preview',
        },
      ],
    },
    {
      title: 'SQL Query Optimizer & Index Advisor',
      description: 'Analyzes slow SQL queries, explains the execution bottleneck, and recommends compound index strategies.',
      usageDescription: 'Paste your slow query, database dialect, and table schema.',
      promptText: `Act as a senior Database Administrator. Analyze the following SQL query and schema:
Dialect: [PostgreSQL / SQLite / MySQL]
Schema:
[Paste Schema]

Query:
[Paste Query]

Provide:
1. Potential execution plan bottlenecks (e.g. table scans, sort spills).
2. Rewritten, optimized query syntax.
3. Recommended indexes (covering, composite, or partial) with explicit column ordering rationales.`,
      category: 'code',
      collection: 'Frontend Engineering',
      tags: ['sql', 'database', 'performance'],
    },
    {
      title: 'Editorial Studio Portrait Photography',
      description: 'High-fashion editorial portrait photography prompt with dramatic Rembrandt lighting and rich textures.',
      usageDescription: 'Adjust [SUBJECT] and [OUTFIT] for custom photo directions.',
      promptText: `Editorial high fashion portrait photograph of [SUBJECT] wearing [OUTFIT], dramatic directional Rembrandt lighting, deep shadows, authentic skin texture with natural pores, shot on Hasselblad H6D-100c with 80mm lens at f/2.8, Vogue editorial aesthetic, muted earthy tones --ar 4:5 --v 6.1`,
      category: 'image',
      collection: 'AI Image & Visual Arts',
      tags: ['photography', 'portrait', 'lighting'],
      media: [
        {
          media_type: 'image',
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
          medium_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=640&q=80',
          thumbnail_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&q=80',
          width: 960,
          height: 1200,
          aspect_ratio: 0.8,
          caption: 'Editorial Studio Portrait Lighting Example',
        },
      ],
    },
    {
      title: 'Architecture Decision Record (ADR) Spec',
      description: 'Standardized ADR generator capturing Context, Decision, Consequences, and Considered Alternatives.',
      usageDescription: 'Fill in Title and brief background of the technical choice.',
      promptText: `Generate an Architecture Decision Record (ADR) in Markdown using the following structure:
# ADR-[NUMBER]: [Title]
## Status: Proposed / Accepted
## Context: What is the context and problem we are solving?
## Decision: What change or approach are we committing to?
## Consequences:
- Positive consequences & gains
- Negative consequences & debt
- Neutral observations
## Alternatives Considered: Options evaluated and why they were rejected.

Topic to cover:
[Enter topic details]`,
      category: 'text',
      collection: 'Technical Writing & Docs',
      tags: ['adr', 'architecture', 'docs'],
    },
    {
      title: 'Dark Neumorphic Glassmorphism UI Scene',
      description: 'Futuristic dashboard UI mockup with glowing neon accents, frosted acrylic layers, and depth blur.',
      usageDescription: 'Great for hero assets, landing page graphics, and presentation mockups.',
      promptText: `Dark mode fintech dashboard interface concept, multi-layered frosted glass cards with translucent backdrop blur, subtle inner borders with glowing cyan and violet gradients, crisp typography, clean data charts, isometric presentation angle on dark graphite surface, photorealistic rendering --ar 16:9`,
      category: 'image',
      collection: 'AI Image & Visual Arts',
      tags: ['ui', 'glassmorphism', 'dark-mode'],
      media: [
        {
          media_type: 'image',
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
          medium_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=640&q=80',
          thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=320&q=80',
          width: 1920,
          height: 1080,
          aspect_ratio: 1.7778,
          caption: 'Dark UI Dashboard Scene Example',
        },
      ],
    },
    {
      title: 'Character Turnaround Animation Cue',
      description: 'Multi-angle rotational video prompt for character consistency and 3D reconstruction.',
      usageDescription: 'Specify character appearance and art style.',
      promptText: `Continuous 360-degree turntable shot of [CHARACTER DESCRIPTION] standing in a neutral pose, neutral grey studio background, consistent lighting from all angles, smooth rotation speed, no morphing or flickering, 60fps high fidelity 3D animation.`,
      category: 'video',
      collection: 'Video Generation & Motion',
      tags: ['character', 'animation', 'turnaround', 'runway'],
      media: [
        {
          media_type: 'video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
          thumbnail_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=640&q=80',
          medium_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=640&q=80',
          width: 1920,
          height: 1080,
          aspect_ratio: 1.7778,
          caption: '3D Character Model Turnaround Preview',
        },
      ],
    },
    {
      title: 'Tailwind to CSS Design Token Refactorer',
      description: 'Converts arbitrary Tailwind utility classes into structured semantic CSS variables and design system tokens.',
      usageDescription: 'Paste components with cluttered inline Tailwind classes.',
      promptText: `Extract and refactor the arbitrary Tailwind classes in the provided JSX/TSX snippet into clean semantic tokens:
1. Identify repeated utility clusters (spacings, colors, borders, shadows).
2. Map them to semantic CSS variables conforming to design tokens (e.g., var(--color-surface-elevated)).
3. Output the cleaned component markup and the corresponding token stylesheet.

[Paste Component Code]`,
      category: 'code',
      collection: 'Frontend Engineering',
      tags: ['css', 'design-system', 'tokens'],
    },
    {
      title: 'Cold Outreach Value Hook Generator',
      description: 'Generates high-converting, personalized 3-sentence cold emails focusing on specific pain points and social proof.',
      usageDescription: 'Provide recipient role, industry, and value proposition.',
      promptText: `Write 3 variations of a 3-sentence B2B cold email targeting [PROSPECT ROLE] in the [INDUSTRY] space.

Structure:
Sentence 1: Hyper-relevant observation demonstrating you researched their workflow.
Sentence 2: Concrete quantification of how similar companies solved [PAIN POINT].
Sentence 3: Low-friction call to interest (no calendar link, simple open question).`,
      category: 'text',
      tags: ['sales', 'copywriting', 'marketing'],
    },
    {
      title: 'Seamless Macro Fluid Dynamics Motion',
      description: 'Mesmerizing slow-motion video prompt of swirling iridescent liquids and high-speed pigment dispersion.',
      usageDescription: 'Ideal for background video loops, ambient screensavers, and brand reveals.',
      promptText: `Macro high-speed slow motion footage of swirling iridescent metallic fluids colliding underwater, droplets forming suspension beads, vibrant gold, sapphire and emerald inks dispersing, dramatic backlit glow, 1000fps phantom camera feel, perfectly seamless looping motion --ar 16:9`,
      category: 'video',
      tags: ['macro', 'fluid', 'slowmo', 'motion'],
    },
  ];

  const insertPrompt = db.prepare(`
    INSERT INTO prompts (
      title, prompt_text, description, usage_description,
      collection_id, category_id, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMedia = db.prepare(`
    INSERT INTO prompt_media (
      prompt_id, media_type, url, thumbnail_url, medium_url,
      file_path, file_name, file_size, mime_type, width, height,
      aspect_ratio, caption, created_at
    )
    VALUES (
      @prompt_id, @media_type, @url, @thumbnail_url, @medium_url,
      @file_path, @file_name, @file_size, @mime_type, @width, @height,
      @aspect_ratio, @caption, @created_at
    )
  `);

  const getTag = db.prepare('SELECT id FROM tags WHERE name = ?');
  const insertTag = db.prepare('INSERT INTO tags (name, created_at) VALUES (?, ?)');
  const linkPromptTag = db.prepare('INSERT OR IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)');

  const seedTransaction = db.transaction(() => {
    // Insert prompts with staggered created_at so newest-first is demonstrable
    for (let i = 0; i < samplePrompts.length; i++) {
      const p = samplePrompts[i];
      const collectionId = p.collection ? collectionIds[p.collection] || null : null;
      const createdAt = new Date(now.getTime() - (samplePrompts.length - i) * 1800000).toISOString();

      const res = insertPrompt.run(
        p.title,
        p.promptText,
        p.description,
        p.usageDescription || null,
        collectionId,
        p.category,
        createdAt,
        createdAt
      );
      const promptId = Number(res.lastInsertRowid);

      for (const tagName of p.tags) {
        const cleanTag = tagName.toLowerCase().trim();
        let tagRow = getTag.get(cleanTag) as { id: number } | undefined;
        if (!tagRow) {
          const tagRes = insertTag.run(cleanTag, createdAt);
          tagRow = { id: Number(tagRes.lastInsertRowid) };
        }
        linkPromptTag.run(promptId, tagRow.id);
      }

      if (p.media) {
        for (const m of p.media) {
          insertMedia.run({
            prompt_id: promptId,
            media_type: m.media_type,
            url: m.url,
            thumbnail_url: m.thumbnail_url || m.url,
            medium_url: m.medium_url || m.url,
            file_path: null,
            file_name: null,
            file_size: null,
            mime_type: m.media_type === 'video' ? 'video/mp4' : 'image/jpeg',
            width: m.width || null,
            height: m.height || null,
            aspect_ratio: m.aspect_ratio || null,
            caption: m.caption || null,
            created_at: createdAt,
          });
        }
      }
    }
  });

  seedTransaction();
  console.log(`Successfully populated database with ${collectionsData.length} collections and ${samplePrompts.length} realistic sample prompts!`);
}

// Run standalone if executed directly
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
