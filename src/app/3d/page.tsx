import BookVault3DLoader from "@/components/BookVault3DLoader";

export default function ThreeDPage() {
  return (
    <section aria-labelledby="three-d-title" className="space-y-8 py-4">
      <div className="max-w-2xl space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">The BookVault shelf</p>
        <h1 id="three-d-title" className="text-4xl tracking-tight text-primary sm:text-5xl">Meet a book from every angle.</h1>
        <p className="text-lg leading-8 text-muted">Rotate and zoom the cover, pages, and spine of this small 3D study.</p>
      </div>
      <BookVault3DLoader />
    </section>
  );
}