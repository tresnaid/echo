export function WorkflowsSection() {
  const workflows = [
    {
      role: 'Prompt Engineers & Agent Builders',
      iconBg: 'rgba(59, 130, 246, 0.1)',
      iconColor: '#2563eb',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
          <path d="M12 12 2.1 7.1" />
          <path d="M12 12l9.9-4.9" />
        </svg>
      ),
      problem:
        'System prompts and evaluation suites degrade when pasted through chat tools that strip whitespace, corrupt JSON brackets, or lose version history.',
      solution:
        'Echo guarantees 100% exact character fidelity with zero whitespace trimming. Organize prompts by collections, version your agent instructions, and filter by tags in under a millisecond.',
    },
    {
      role: 'Creative Directors & AI Artists',
      iconBg: 'rgba(16, 185, 129, 0.1)',
      iconColor: '#059669',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
      problem:
        'Midjourney, Flux, and Stable Diffusion prompt recipes depend on exact flag sequences (--ar 16:9, --style raw, --c 5) and reference images scattered across messaging channels.',
      solution:
        'Store prompt strings alongside uploaded reference images or external URLs. Automatic thumbnail generation with Sharp and instant lightbox inspection keeps visual context intact.',
    },
    {
      role: 'Software Engineers & Architects',
      iconBg: 'rgba(139, 92, 246, 0.1)',
      iconColor: '#7c3aed',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      problem:
        'Technical tasks (AST transforms, regex generators, database migrations) need strict language syntax, variable parameters, and fast clipboard extraction.',
      solution:
        'Code-modality cards with syntax formatting, parameterized placeholders, and keyboard-first navigation. Copy exact commands without opening heavy IDE extensions.',
    },
    {
      role: 'Video Creators & Motion Designers',
      iconBg: 'rgba(245, 158, 11, 0.1)',
      iconColor: '#d97706',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
      problem:
        'Generative video tools (Runway Gen-3, Kling, Sora, Luma) require complex 3D camera trajectory descriptions and seed clip comparisons.',
      solution:
        'Dedicated Video modality supporting MP4 and WebM video uploads. Inspect video prompts, play video references, and store camera vector tips in structured usage fields.',
    },
  ];

  return (
    <section id="workflows" className="echo-landing-section" aria-labelledby="workflows-heading">
      <div className="echo-section-header">
        <h2 id="workflows-heading" className="echo-section-title">
          Engineered for Purpose-Driven Creators
        </h2>
        <p className="echo-section-description">
          Whether you are building enterprise LLM pipelines or directing generative films, Echo provides the structure and speed modern workflows demand.
        </p>
      </div>

      <div className="echo-workflows-grid">
        {workflows.map((wf) => (
          <article key={wf.role} className="echo-workflow-card">
            <div
              className="echo-workflow-icon-wrap"
              style={{ backgroundColor: wf.iconBg, color: wf.iconColor }}
            >
              {wf.icon}
            </div>
            <h3 className="echo-workflow-title">{wf.role}</h3>
            <p className="echo-workflow-problem">
              <strong style={{ color: '#0f172a' }}>The Challenge:</strong> {wf.problem}
            </p>
            <div className="echo-workflow-solution">
              <strong style={{ color: '#0f172a' }}>The Echo Solution:</strong> {wf.solution}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
