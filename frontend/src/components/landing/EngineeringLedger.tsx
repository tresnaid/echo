export function EngineeringLedger() {
  const specifications = [
    {
      index: '01',
      title: 'Spatial Grid Architecture',
      description:
        'High-density responsive masonry card grid for rapid visual browsing paired with non-destructive detail modals that strictly preserve active search queries, filters, and collection contexts.',
    },
    {
      index: '02',
      title: '100% Copy Fidelity',
      description:
        'Zero trimming, zero indentation mutation, and zero synthetic formatting. Exact whitespace and token structure are preserved for strict LLM system prompts and diffusion model parameters.',
    },
    {
      index: '03',
      title: 'Multimodal First-Class Modeling',
      description:
        'Unified schema support for Text, Code, Image, and Generative Video. Each modality pairs prompts with parameter documentation, preview assets, and model compatibility tags.',
    },
    {
      index: '04',
      title: 'Sub-Millisecond Search',
      description:
        'Client-side indexing across titles, full prompt bodies, and tags delivers zero-latency filtering with instantaneous results and no disruptive layout shifts.',
    },
    {
      index: '05',
      title: 'Zero-Loss Persistence',
      description:
        'Powered by a lightweight Express and SQLite backend with full offline resilience. Deleting a collection safely detaches prompts to an Uncollected pool, preserving your work.',
    },
    {
      index: '06',
      title: 'Atlas Design System',
      description:
        'Architected strictly with @tresnaid/atlas design tokens, WCAG AA accessibility, keyboard navigation, and disciplined editorial typography without decorative filler.',
    },
  ];

  return (
    <section id="specifications" className="echo-ledger-section" aria-labelledby="ledger-title">
      <div className="echo-ledger-header">
        <h2 id="ledger-title" className="echo-ledger-title">
          Engineering Specifications
        </h2>
        <p className="echo-ledger-subtitle">
          Echo is built as a precision instrument rather than a generic prompt notepad. Every interaction is grounded in six deliberate architectural invariants.
        </p>
      </div>

      <div className="echo-ledger-grid" role="list">
        {specifications.map((spec) => (
          <article key={spec.index} className="echo-ledger-item" role="listitem">
            <span className="echo-ledger-index" aria-hidden="true">
              SYS // {spec.index}
            </span>
            <h3 className="echo-ledger-item-title">{spec.title}</h3>
            <p className="echo-ledger-item-desc">{spec.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default EngineeringLedger;
