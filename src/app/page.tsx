"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";

type Stadium = {
  id: string;
  name: string;
  city: string;
  state?: string;
};

function getQrUrl(apiBase: string, stadiumId: string, cacheBuster: number) {
  return `${apiBase}/api/qr/download/stadium/${encodeURIComponent(stadiumId)}.png?v=${cacheBuster}`;
}

export default function HomePage() {
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [token, setToken] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminMsg, setAdminMsg] = useState<string | null>(null);
  const [cacheBuster, setCacheBuster] = useState(Date.now());

  const loadStadiums = useCallback(async () => {
    if (!apiBase) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/api/stadiums`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load stadiums");
      }

      const data = (await response.json()) as Stadium[];
      setStadiums(Array.isArray(data) ? data : []);
    } catch {
      setError("Unable to load stadium list from backend.");
      setStadiums([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void loadStadiums();
  }, [loadStadiums]);

  const cityOptions = useMemo(() => {
    const options = new Set<string>();
    stadiums.forEach((item) => options.add(item.city));
    return ["All", ...Array.from(options).sort((a, b) => a.localeCompare(b))];
  }, [stadiums]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stadiums.filter((item) => {
      const queryOk =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        (item.state || "").toLowerCase().includes(q);
      const cityOk = cityFilter === "All" || item.city === cityFilter;
      return queryOk && cityOk;
    });
  }, [cityFilter, query, stadiums]);

  const handleRegenerate = useCallback(async () => {
    if (!apiBase) {
      setAdminMsg("Missing NEXT_PUBLIC_API_BASE_URL.");
      return;
    }

    // Token requirement temporarily disabled for minor project
    // if (!token.trim()) {
    //   setAdminMsg("Paste an admin Bearer token first.");
    //   return;
    // }

    setAdminBusy(true);
    setAdminMsg(null);
    try {
      const response = await fetch(`${apiBase}/api/qr/generate-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
      });

      if (!response.ok) {
        setAdminMsg("Regenerate failed. Check token/admin permissions.");
        return;
      }

      const payload = (await response.json()) as { generatedCount?: number };
      setAdminMsg(`Regenerated ${payload.generatedCount ?? 0} QR mappings.`);
      setCacheBuster(Date.now());
    } catch {
      setAdminMsg("Regenerate failed due to network/server error.");
    } finally {
      setAdminBusy(false);
    }
  }, [apiBase, token]);

  const printOne = useCallback((stadium: Stadium) => {
    if (!apiBase || typeof window === "undefined") {
      return;
    }

    const qrUrl = getQrUrl(apiBase, stadium.id, Date.now());
    const popup = window.open("", "_blank", "width=700,height=900");
    if (!popup) {
      return;
    }

    popup.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${stadium.name} QR</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; text-align: center; }
      h1 { margin: 0 0 8px; }
      p { margin: 0 0 18px; color: #555; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; }
      img { width: 320px; height: 320px; object-fit: contain; border: 1px solid #ddd; border-radius: 8px; padding: 10px; }
    </style>
  </head>
  <body>
    <h1>${stadium.name}</h1>
    <p>${stadium.city}${stadium.state ? `, ${stadium.state}` : ""}</p>
    <img src="${qrUrl}" alt="${stadium.name} QR" />
    <script>
      window.onload = function () { window.print(); };
    </script>
  </body>
</html>`);
    popup.document.close();
  }, [apiBase]);

  if (!apiBase) {
    return (
      <main className="min-h-screen bg-blush text-plum">
        <Navbar />
        <section className="max-w-4xl mx-auto px-6 md:px-12 py-16">
          <h1 className="text-5xl md:text-6xl leading-[0.95]">InStadiumQR</h1>
          <p className="mt-4 font-sans text-plum/70">
            Set NEXT_PUBLIC_API_BASE_URL in .env.local to display stadium QR codes.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blush text-plum">
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="mb-8 print:hidden">
          <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-rose font-bold">
            Instadium QR
          </p>
          <h1 className="text-5xl md:text-7xl leading-[0.95] mt-2">
            Stadium <span className="italic">QR Library</span>
          </h1>
          <p className="mt-3 text-plum/60 font-sans">
            Search by stadium or city, print one QR, or print the full A4 sheet.
          </p>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-3 print:hidden">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by stadium/city"
            className="h-11 rounded-xl border border-rose/20 px-3 bg-white font-sans text-sm"
          />
          <select
            value={cityFilter}
            onChange={(event) => setCityFilter(event.target.value)}
            className="h-11 rounded-xl border border-rose/20 px-3 bg-white font-sans text-sm"
          >
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city === "All" ? "All Cities" : city}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => window.print()}
            className="h-11 rounded-xl bg-rose text-blush font-sans text-xs tracking-[0.2em] uppercase"
          >
            Print A4 Sheet
          </button>
        </div>

        <div className="mb-8 print:hidden border border-rose/20 rounded-2xl bg-white p-4">
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-rose mb-2">
            Admin Tools
          </p>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Paste Clerk admin bearer token"
              className="h-11 rounded-xl border border-rose/20 px-3 bg-blush font-sans text-sm"
            />
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={adminBusy}
              className="h-11 rounded-xl border border-rose/30 px-4 font-sans text-xs tracking-[0.18em] uppercase text-rose disabled:opacity-50"
            >
              {adminBusy ? "Regenerating..." : "Regenerate all QRs"}
            </button>
          </div>
          {adminMsg ? <p className="mt-2 font-sans text-sm text-plum/70">{adminMsg}</p> : null}
        </div>

        {loading ? <p className="font-sans text-sm print:hidden">Loading stadiums...</p> : null}
        {error ? <p className="font-sans text-sm text-rose print:hidden">{error}</p> : null}

        <div className="qr-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((stadium) => {
            const qrUrl = getQrUrl(apiBase, stadium.id, cacheBuster);
            return (
              <article
                key={stadium.id}
                className="qr-card bg-white border border-rose/15 rounded-3xl p-5 shadow-sm break-inside-avoid"
              >
                <h2 className="text-2xl leading-tight">{stadium.name}</h2>
                <p className="font-sans text-xs tracking-widest uppercase text-plum/50 mt-1">
                  {stadium.city}
                  {stadium.state ? `, ${stadium.state}` : ""}
                </p>

                <div className="mt-4 rounded-2xl border border-rose/15 bg-blush p-4 flex items-center justify-center">
                  <img
                    src={qrUrl}
                    alt={`${stadium.name} QR`}
                    className="w-full h-auto max-w-70"
                    loading="lazy"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2 print:hidden">
                  <a
                    href={qrUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block font-sans text-[11px] tracking-[0.2em] uppercase text-rose border border-rose/30 rounded-full px-4 py-2"
                  >
                    Open PNG
                  </a>
                  <button
                    type="button"
                    onClick={() => printOne(stadium)}
                    className="inline-block font-sans text-[11px] tracking-[0.2em] uppercase text-rose border border-rose/30 rounded-full px-4 py-2"
                  >
                    Print QR
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
