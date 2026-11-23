export default function WelcomeScreen() {
  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-4">
        Stop hunting for clients one Google search at a time.
      </h1>
      <p className="text-on-surface-variant max-w-xl mb-8">
        SiteLeads finds local businesses without a website and turns them into
        a tracked, assignable sales pipeline for your agency.
      </p>
      <div className="flex gap-4">
        <a
          href="/log-in"
          className="px-6 py-3 rounded-full bg-primary text-white font-semibold"
        >
          Log in
        </a>
        <a
          href="/sign-up"
          className="px-6 py-3 rounded-full border border-primary text-primary font-semibold"
        >
          Sign up
        </a>
      </div>
    </main>
  );
}
