import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-rose text-blush border-b border-blush/20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-sans text-lg tracking-widest uppercase font-bold flex items-center gap-2"
        >
          <span className="bg-rose-soft text-blush px-2 py-0.5 rounded italic">In</span>
          stadium QR
        </Link>
        <span className="font-sans text-[10px] tracking-[0.22em] uppercase text-blush/80">
          Stadium QR Library
        </span>
      </div>
    </nav>
  );
}
