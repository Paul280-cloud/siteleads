const STEPS = [
  {
    n: "1",
    title: "Find",
    body: "Add local businesses that don't have a website yet — manually, or import a curated list.",
  },
  {
    n: "2",
    title: "Assign",
    body: "Hand each lead to a caller on your team in one click. Everyone sees only what's theirs.",
  },
  {
    n: "3",
    title: "Track",
    body: "Every call updates the status and leaves a note — right through to a signed deal.",
  },
];

export default function WelcomeScreen() {
  return (
    <main className="min-h-screen bg-surface">
      <header className="max-w-3xl mx-auto px-6 pt-8 flex items-center gap-2 border-b border-line pb-4">
        <span className="w-7 h-7 bg-primary flex items-center justify-center text-surface font-display font-bold text-sm">
          S
        </span>
        <span className="font-display font-bold text-lg tracking-wide text-on-surface">
          SITELEADS
        </span>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        <h1 className="font-display font-black text-6xl md:text-7xl text-on-surface leading-[0.95] mb-6 max-w-2xl">
          Stop hunting for clients one Google search at a time.
        </h1>

        <p className="text-on-surface-variant max-w-md mb-10 text-lg leading-relaxed">
          SiteLeads finds local businesses without a website and turns them
          into a tracked, assignable sales pipeline for your agency.
        </p>

        <div className="flex gap-4 mb-20">
          <a
            href="/sign-up"
            className="px-6 py-3 bg-primary text-surface font-semibold hover:bg-primary-dark transition-colors"
          >
            Get started free
          </a>
          <a
            href="/log-in"
            className="px-6 py-3 border border-line text-on-surface font-semibold hover:border-on-surface transition-colors"
          >
            Log in
          </a>
        </div>

        <div className="border-t border-line">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="flex gap-6 py-6 border-b border-line items-start"
            >
              <span className="font-display font-black text-3xl text-accent w-8 shrink-0">
                {step.n}
              </span>
              <div>
                <h3 className="font-display font-bold text-xl text-on-surface mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
