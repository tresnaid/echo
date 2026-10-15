export function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Capture with Context',
      desc: 'Input raw prompt text alongside optional title, description, usage tips, and multimedia attachments (photos or video clips).',
    },
    {
      num: '02',
      title: 'Organize Non-Destructively',
      desc: 'Create collections inline or group by custom multi-tags. Deleting a collection moves prompts to Uncollected—prompts are never lost.',
    },
    {
      num: '03',
      title: 'Instant Multi-Filter Discovery',
      desc: 'Search across titles, prompt text, and tags simultaneously with sub-millisecond local SQLite indexing and modality filters.',
    },
    {
      num: '04',
      title: 'Deploy with 100% Copy Fidelity',
      desc: 'Copy exact raw characters directly to your clipboard with a single click. Zero trimming, zero formatting corruption.',
    },
  ];

  return (
    <section id="how-it-works" className="echo-landing-section" aria-labelledby="hiw-heading">
      <div className="echo-section-header">
        <h2 id="hiw-heading" className="echo-section-title">
          How Echo Works
        </h2>
        <p className="echo-section-description">
          A friction-free lifecycle from initial idea to instant production clipboard deployment.
        </p>
      </div>

      <div className="echo-steps-grid">
        {steps.map((step) => (
          <div key={step.num} className="echo-step-card">
            <div className="echo-step-indicator" aria-hidden="true">
              {step.num}
            </div>
            <h3 className="echo-step-title">{step.title}</h3>
            <p className="echo-step-desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
