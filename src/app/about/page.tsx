export default function AboutPage() {
  return (
    <section aria-labelledby="about-title" className="mx-auto max-w-2xl space-y-5 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">About BookVault</p>
      <h1 id="about-title" className="text-4xl tracking-tight text-primary sm:text-5xl">A quieter way to find your next book.</h1>
      <p className="text-lg leading-8 text-muted">BookVault is a digital library concept built to make discovery feel personal, considered, and easy to return to.</p>
    </section>
  );
}
