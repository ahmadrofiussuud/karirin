"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  Check,
  CheckCircle2,
  Circle,
  Compass,
  Download,
  Flag,
  Home,
  Leaf,
  Map,
  Plus,
  Search,
  SlidersHorizontal,
  Target,
  Timer,
  UserRound,
  X,
  Wallet,
  Info,
  ChevronRight,
  ChevronDown,
  Menu,
  Mountain,
  Sparkles,
  ShieldCheck,
  Clock,
  Briefcase,
  Zap,
  HelpCircle,
  Rocket,
  CheckSquare,
  Award,
  Layers,
} from "lucide-react";
import {
  barriers,
  emptyProfile,
  initialState,
  interests,
  Journey,
  makeTasks,
  money,
  opportunities,
  Opportunity,
  parseState,
  Profile,
  rankOpportunities,
  reality,
  State,
  STORAGE_KEY,
} from "@/lib/domain";

type View = "landing" | "home" | "profile" | "explore" | "check" | "plan" | "progress";

const navigation = [
  { id: "landing" as View, label: "Beranda" },
  { id: "home" as View, label: "Ruang Tumbuh" },
  { id: "profile" as View, label: "Profil Diri" },
  { id: "explore" as View, label: "Jelajahi Peluang" },
  { id: "plan" as View, label: "Rencana Langkah" },
  { id: "progress" as View, label: "Progres & Refleksi" },
];

const labels: Record<View, string> = {
  landing: "Beranda",
  home: "Ruang Tumbuh",
  profile: "Growth DNA",
  explore: "Opportunity Radar",
  check: "Reality Check",
  plan: "Confidence Bridge",
  progress: "Growth Journey",
};

/* Reusable Rough Yellow Highlighter Swipe component */
function BrushSwipe({
  text,
  className = "",
  fontSize,
}: {
  text: string;
  className?: string;
  fontSize?: string;
}) {
  return (
    <span className={`brush-swipe-wrap ${className}`}>
      <svg className="brush-svg" viewBox="0 0 160 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M4,12 C32,5 82,9 122,6 C144,4 154,8 157,15 C159,23 157,32 153,37 C134,41 90,37 56,40 C26,42 12,38 4,39 C1,34 1,20 4,12 Z" />
      </svg>
      <span className="brush-text" style={fontSize ? { fontSize } : undefined}>
        {text}
      </span>
    </span>
  );
}

export default function Workspace() {
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("landing");
  const [selected, setSelected] = useState("design");
  const [notice, setNotice] = useState("");
  const [storageError, setStorageError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [free, setFree] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [weeks, setWeeks] = useState(3);
  const [barrier, setBarrier] = useState<string>(barriers[0]);
  const [ifThen, setIfThen] = useState("");
  const [draft, setDraft] = useState<Profile>(emptyProfile);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // Mini simulator on landing page state
  const [simHours, setSimHours] = useState(8);
  const [simWeeks, setSimWeeks] = useState(3);

  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const loaded = parseState(raw);
      if (loaded) {
        setState(loaded);
        setDraft(loaded.profile);
      } else if (raw) {
        setStorageError(
          "Data tersimpan tidak dapat dibaca. Perubahan baru belum akan menimpa data lama. Ekspor catatan baru sebelum menutup halaman."
        );
      }
    } catch {
      setStorageError("Penyimpanan browser tidak tersedia. Perubahan hanya tersimpan selama halaman terbuka.");
    }

    const readHash = () => {
      const hash = window.location.hash.replace("#", "");
      const [next, id] = hash.split("/");
      if (["landing", "home", "profile", "explore", "check", "plan", "progress"].includes(next)) {
        setView(next as View);
      } else if (!hash) {
        setView("landing");
      }
      if (id && opportunities.some((o) => o.id === id)) {
        setSelected(id);
        setWeeks(opportunities.find((o) => o.id === id)!.weeks);
      }
    };

    readHash();
    window.addEventListener("hashchange", readHash);
    setReady(true);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  useEffect(() => {
    if (!ready || storageError) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      setStorageError("Penyimpanan penuh atau diblokir. Ekspor catatan agar perubahanmu tidak hilang.");
    }
  }, [state, ready, storageError]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timeout);
  }, [notice]);

  function go(next: View, id?: string) {
    setView(next);
    setMobileMenuOpen(false);
    if (id) {
      setSelected(id);
      const o = opportunities.find((o) => o.id === id);
      if (o) setWeeks(o.weeks);
    }
    window.location.hash = next + (id ? `/${id}` : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
    requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }));
  }

  function toggleSave(id: string) {
    const exists = state.saved.includes(id);
    setState((s) => ({ ...s, saved: exists ? s.saved.filter((x) => x !== id) : [...s.saved, id] }));
    setNotice(exists ? "Peluang dihapus dari simpanan." : "Peluang disimpan ke daftar incaranmu.");
  }

  const current = opportunities.find((o) => o.id === selected) || opportunities[0];
  const simulation = reality(state.profile, current, weeks);
  const ranked = rankOpportunities(state.profile);
  const filtered = ranked.filter(
    (o) =>
      (category === "Semua" || o.category === category) &&
      (!free || o.cost === 0) &&
      (!savedOnly || state.saved.includes(o.id)) &&
      `${o.title} ${o.organizer} ${o.category} ${o.type}`.toLowerCase().includes(query.toLowerCase())
  );
  const journey = state.journeys.find((j) => j.opportunityId === selected);
  const doneCount = state.journeys.reduce((sum, j) => sum + j.tasks.filter((t) => t.done).length, 0);
  const started = state.journeys.length;
  const nextJourney = state.journeys.find((j) => j.status !== "Direfleksikan") || state.journeys[0];
  const nextTask = nextJourney?.tasks.find((t) => !t.done);

  function updateJourney(id: string, patch: Partial<Journey>) {
    setState((s) => ({
      ...s,
      journeys: s.journeys.map((j) => (j.opportunityId === id ? { ...j, ...patch } : j)),
    }));
  }

  function createPlan() {
    if (!state.profileSaved) {
      go("profile");
      setNotice("Kenali dirimu dulu agar rencana sesuai kapasitasmu.");
      return;
    }
    if (!simulation.eligible) {
      setNotice("Peluang ini khusus mahasiswa aktif. Pilih peluang lain yang persyaratannya sesuai.");
      return;
    }
    if (!journey) {
      const entry: Journey = {
        opportunityId: selected,
        barrier,
        tasks: makeTasks(current, barrier),
        status: "Direncanakan",
        reflection: "",
        actualHours: "",
        ifThen,
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        saved: Array.from(new Set([...s.saved, selected])),
        journeys: [...s.journeys, entry],
      }));
      setNotice("Rencana pertamamu siap! Mulai dari satu langkah kecil.");
    }
    go("plan", selected);
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "karirin-catatan.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Catatan perjalanan berhasil diekspor.");
  }

  const oppImages: Record<string, string> = {
    design: "/images/card-desain.jpg",
    essay: "/images/card-esai.jpg",
    code: "/images/card-teknologi.jpg",
    social: "/images/card-sosial.jpg",
    business: "/images/card-bisnis.jpg",
  };

  function OpportunityCard({ o, compact = false }: { o: Opportunity; compact?: boolean }) {
    const matched = state.profile.interests.includes(o.category);
    const isSaved = state.saved.includes(o.id);
    const imgSrc = oppImages[o.id] || "/images/card-desain.jpg";

    return (
      <article className={`opp-card ${compact ? "compact" : ""} opp-color-${o.color}`}>
        {/* 3D Isometric Card Image Banner */}
        <div className="opp-card-media-banner" onClick={() => go("check", o.id)}>
          <img src={imgSrc} alt={o.title} className="opp-card-img" />
          <div className="opp-card-media-overlay" />
          <span className={`opp-category-badge-chip ${o.color}`}>
            {o.category}
          </span>
          {matched && (
            <span className="opp-match-pill-floating">
              <Check size={11} strokeWidth={2.5} /> Sesuai Minat
            </span>
          )}
          <button
            className={`opp-save-btn-floating ${isSaved ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(o.id);
            }}
            aria-label={isSaved ? "Hapus simpanan" : "Simpan peluang"}
            title={isSaved ? "Tersimpan" : "Simpan"}
          >
            <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="opp-card-body-content">
          <div className="opp-header-sub">
            <span className="opp-type-pill">{o.type}</span>
            <span className="opp-level-pill">{o.level}</span>
          </div>

          <button className="opp-title" onClick={() => go("check", o.id)}>
            {o.title}
          </button>

          <p className="opp-organizer">{o.organizer}</p>

          <div className="opp-footer">
            <div className="opp-specs">
              <span className="opp-spec-item" title="Estimasi waktu persiapan">
                <Timer size={13} />
                {o.hours} jam
              </span>
              <span className="opp-spec-item" title="Biaya pendaftaran">
                <Wallet size={13} />
                {money(o.cost)}
              </span>
            </div>
            <button className="opp-detail-btn" onClick={() => go("check", o.id)}>
              <span>Cek Waktu</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </article>
    );
  }

  // Mini calculator calculation on landing page
  const simLoad = Math.round((18 / Math.max(1, simWeeks)) * 10) / 10;
  const simRemaining = Math.round((simHours - simLoad) * 10) / 10;
  const isSimOverload = simLoad > simHours;

  return (
    <div className={`app-shell theme-sky-growth ${view === "landing" ? "is-landing-active" : ""}`}>
      <a className="skip-link" href="#main-content">
        Lewati ke isi utama
      </a>

      {/* ========================================================================= */}
      {/* UNIFIED TOP NAVBAR (Sticky glassmorphic across all views) */}
      {/* ========================================================================= */}
      <header className="navbar-top">
        <div className="navbar-container">
          {/* Brand with Six-petal Flower Icon */}
          <div className="navbar-brand-group">
            <button className="brand-button" onClick={() => go("landing")} aria-label="Karirin, Ruang Navigasi Karier">
              <span className="brand-flower-icon">
                <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="22" cy="11" r="8.5" fill="#ffffff" />
                  <circle cx="31.5" cy="16.5" r="8.5" fill="#ffffff" />
                  <circle cx="31.5" cy="27.5" r="8.5" fill="#ffffff" />
                  <circle cx="22" cy="33" r="8.5" fill="#ffffff" />
                  <circle cx="12.5" cy="27.5" r="8.5" fill="#ffffff" />
                  <circle cx="12.5" cy="16.5" r="8.5" fill="#ffffff" />
                  <circle cx="22" cy="22" r="7.5" fill="#ffffff" />
                </svg>
              </span>
              <div className="brand-text-block">
                <span className="brand-title">
                  karirin<span className="brand-dot">.</span>
                </span>
                <span className="brand-tag">RUANG MULAI</span>
              </div>
            </button>
          </div>

          {/* Center Navigation Links */}
          <nav className="navbar-menu" aria-label="Navigasi Utama">
            {navigation.map(({ id, label }) => {
              const isActive = view === id || (view === "check" && id === "explore");
              return (
                <button
                  key={id}
                  onClick={() => go(id)}
                  className={`nav-button ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{label}</span>
                  {id === "plan" && started > 0 && <span className="nav-counter">{started}</span>}
                  {id === "explore" && state.saved.length > 0 && (
                    <span className="nav-counter saved">{state.saved.length}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="navbar-end">
            <button className="action-pill-btn" onClick={exportData} title="Ekspor catatan ke file JSON">
              <span className="desktop-only">Ekspor</span>
            </button>

            {state.profileSaved ? (
              <button
                className="user-profile-capsule"
                onClick={() => {
                  setDraft(state.profile);
                  go("profile");
                }}
                title="Buka profil diri"
              >
                <div className="user-avatar-badge">
                  {state.profile.name ? state.profile.name.slice(0, 2).toUpperCase() : "U"}
                </div>
                <div className="user-info-text desktop-only">
                  <strong>{state.profile.name}</strong>
                  <small>{state.profile.student ? "Mahasiswa" : "Umum"}</small>
                </div>
                <ChevronRight size={14} className="desktop-only chevron" />
              </button>
            ) : (
              <button className="nav-cta-pill" onClick={() => go("profile")}>
                <span>Mulai Profil</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Tutup navigasi" : "Buka navigasi"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-dropdown-menu">
            <div className="mobile-nav-items">
              {navigation.map(({ id, label }) => {
                const isActive = view === id || (view === "check" && id === "explore");
                return (
                  <button
                    key={id}
                    onClick={() => go(id)}
                    className={`mobile-nav-btn ${isActive ? "active" : ""}`}
                  >
                    <div className="mobile-nav-btn-content">
                      <span>{label}</span>
                    </div>
                    {id === "plan" && started > 0 && <span className="nav-counter">{started}</span>}
                    {id === "explore" && state.saved.length > 0 && (
                      <span className="nav-counter saved">{state.saved.length}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mobile-nav-footer">
              <button className="button outline full" onClick={exportData}>
                <span>Ekspor Catatan JSON</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT */}
      {/* ========================================================================= */}
      <main id="main-content" ref={mainRef} tabIndex={-1} className="main-viewport">
        {storageError && (
          <div className="warning-banner" role="alert">
            <Info size={18} />
            <span>{storageError}</span>
          </div>
        )}

        {!ready ? (
          <div className="loading-state">
            <Sparkles className="spin-slow" size={24} />
            <span>Menyiapkan ruang bertumbuhmu…</span>
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* 1. LANDING PAGE VIEW (Floating Island Hero + Karirin Content) */}
            {/* ========================================================================= */}
            {view === "landing" && (
              <div className="landing-sky-wrapper">
                {/* -------------------------------------------------------------
                     SKYPROMPT-STYLE FLOATING ISLAND HERO (1440x900 Scale)
                     ------------------------------------------------------------- */}
                <section className="sky-hero-stage">
                  <div className="sky-hero-frame">
                    {/* Background Plate Image */}
                    <div className="sky-plate-bg" />

                    {/* Animated Looping Video (Waterfall & Butterflies) */}
                    <video
                      className="sky-video-bg"
                      src="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/81764d30-8120-4ab5-8491-4dd852b82496.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />

                    {/* HEADLINE BLOCK */}
                    <div className="sky-headline-block">
                      {/* Highlighter swipe: "Mulai Sekarang" */}
                      <div className="sky-hl-tag hl-top">
                        <BrushSwipe text="Mulai Sekarang" fontSize="calc(36 * var(--u))" />
                      </div>

                      {/* Main Headline in DM Serif Display */}
                      <h1 className="sky-main-title">Arah Karier & Peluang</h1>

                      {/* Highlighter swipe: "Bebas Bingung!" */}
                      <div className="sky-hl-tag hl-bottom">
                        <BrushSwipe text="Bebas Bingung!" fontSize="calc(36 * var(--u))" />
                      </div>

                      {/* Subline */}
                      <p className="sky-subline">
                        Kenali kapasitas waktumu, temukan peluang yang realistis, dan ubah rasa ragu<br />
                        menjadi 4 langkah mikro nyata — dari ide awal hingga karya jadi.
                      </p>
                    </div>

                    {/* FAN OF 4 OPPORTUNITY CARDS RESTING ON THE FLOATING ISLAND */}
                    <div className="sky-island-cards-fan">
                      {/* Card 1: Desain UI/UX (-12°) */}
                      <div
                        className="sky-island-card card-desain"
                        onClick={() => go("check", "design")}
                        title="Klik untuk lihat Reality Check: Desain Challenge"
                      >
                        <img
                          src="/images/card-desain.jpg"
                          alt="Desain UI/UX & Produk"
                        />
                        <span className="card-badge-pill">Desain UI/UX</span>
                      </div>

                      {/* Card 2: Kompetisi Esai (-4°) */}
                      <div
                        className="sky-island-card card-esai"
                        onClick={() => go("check", "essay")}
                        title="Klik untuk lihat Reality Check: Kompetisi Esai"
                      >
                        <img
                          src="/images/card-esai.jpg"
                          alt="Kompetisi Esai & Riset"
                        />
                        <span className="card-badge-pill">Esai & Riset</span>
                      </div>

                      {/* Card 3: Mini Hackathon (4°) */}
                      <div
                        className="sky-island-card card-hackathon"
                        onClick={() => go("check", "code")}
                        title="Klik untuk lihat Reality Check: Mini Hackathon"
                      >
                        <img
                          src="/images/card-teknologi.jpg"
                          alt="Teknologi & Web"
                        />
                        <span className="card-badge-pill">Teknologi & Web</span>
                      </div>

                      {/* Card 4: Proyek Sosial (12°) */}
                      <div
                        className="sky-island-card card-sosial"
                        onClick={() => go("check", "social")}
                        title="Klik untuk lihat Reality Check: Proyek Komunitas"
                      >
                        <img
                          src="/images/card-sosial.jpg"
                          alt="Proyek Sosial & Komunitas"
                        />
                        <span className="card-badge-pill">Proyek Sosial</span>
                      </div>
                    </div>

                    {/* STICKERS & HAND-DRAWN ARROWS */}
                    {/* "Mulai dari Nol!" with curved arrow pointing to card 1 */}
                    <div className="sky-sticker sticker-left">
                      <BrushSwipe text="Mulai dari Nol!" fontSize="calc(15.5 * var(--u))" />
                      <svg className="sky-arrow-curved arrow-left" viewBox="0 0 60 45" fill="none">
                        <path d="M10,8 C25,12 40,24 48,38" stroke="#f6f03b" strokeWidth="4.5" strokeLinecap="round" />
                        <path d="M38,36 L48,39 L47,28" stroke="#f6f03b" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    {/* "Portofolio Nyata" with curved arrow pointing to cards */}
                    <div className="sky-sticker sticker-right">
                      <BrushSwipe text="Portofolio Nyata" fontSize="calc(15.5 * var(--u))" />
                      <svg className="sky-arrow-curved arrow-right" viewBox="0 0 65 110" fill="none">
                        <path d="M45,45 C35,30 25,18 10,12" stroke="#f6f03b" strokeWidth="4" strokeLinecap="round" />
                        <path d="M12,23 L9,11 L21,12" stroke="#f6f03b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M45,65 C40,80 32,95 20,102" stroke="#f6f03b" strokeWidth="4" strokeLinecap="round" />
                        <path d="M32,95 L19,103 L24,88" stroke="#f6f03b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    {/* CALL TO ACTION ON THE ISLAND */}
                    <div className="sky-island-cta-group">
                      {/* "100% Gratis" tag */}
                      <div className="cta-free-badge">
                        <BrushSwipe text="100% Gratis" fontSize="calc(13 * var(--u))" />
                      </div>

                      {/* White pill "Mulai Perjalanan" */}
                      <button
                        className="sky-cta-pill-button"
                        onClick={() => go("explore")}
                      >
                        <span>Mulai Perjalanan</span>
                        <ArrowUpRight size={17} />
                      </button>

                      {/* Note */}
                      <p className="sky-cta-note">
                        Bebas overthinking, tanpa perlu siap segalanya.
                      </p>
                    </div>
                  </div>
                </section>

                {/* -------------------------------------------------------------
                     LANDING FEATURES (Consistent with airy sky & brush theme)
                     ------------------------------------------------------------- */}
                <div className="landing-body-container">
                  {/* 4 Pillars Section */}
                  <section className="pillars-section">
                    <div className="section-center-head">
                      <BrushSwipe text="METODE KAMI" className="center-brush" fontSize="12px" />
                      <h2 className="section-title">4 Tahap Menemukan Arah Tanpa Rasa Cemas</h2>
                      <p className="section-desc">
                        Kebanyakan mahasiswa berhenti mencoba bukan karena tidak mampu, tapi karena bingung mulai dari
                        mana dan salah memperhitungkan waktu. Begini cara Karirin membantumu:
                      </p>
                    </div>

                    <div className="pillars-grid">
                      <div className="pillar-card pillar-dna">
                        <div className="pillar-artwork-box">
                          <img
                            src="/images/pillar-dna.jpg"
                            alt="Growth DNA 3D Asset"
                            className="pillar-artwork-img"
                          />
                          <span className="pillar-num-badge">01</span>
                        </div>
                        <div className="pillar-copy-body">
                          <div className="pillar-icon-box p-indigo">
                            <UserRound size={20} />
                          </div>
                          <h3>Growth DNA</h3>
                          <p>
                            Catat minat, tujuan terdekat, dan jam luang mingguanmu dengan jujur. Tanpa tes kepribadian kaku
                            atau penghakiman.
                          </p>
                          <button className="pillar-link" onClick={() => go("profile")}>
                            <span>Atur profil diri</span> <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="pillar-card pillar-radar">
                        <div className="pillar-artwork-box">
                          <img
                            src="/images/pillar-radar.jpg"
                            alt="Opportunity Radar 3D Asset"
                            className="pillar-artwork-img"
                          />
                          <span className="pillar-num-badge">02</span>
                        </div>
                        <div className="pillar-copy-body">
                          <div className="pillar-icon-box p-emerald">
                            <Compass size={20} />
                          </div>
                          <h3>Opportunity Radar</h3>
                          <p>
                            Temukan kompetisi, hackathon, esai, dan proyek sosial yang disortir otomatis berdasarkan minat
                            dan kapasitasmu.
                          </p>
                          <button className="pillar-link" onClick={() => go("explore")}>
                            <span>Jelajahi radar</span> <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="pillar-card pillar-check">
                        <div className="pillar-artwork-box">
                          <img
                            src="/images/pillar-check.jpg"
                            alt="Reality Check 3D Asset"
                            className="pillar-artwork-img"
                          />
                          <span className="pillar-num-badge">03</span>
                        </div>
                        <div className="pillar-copy-body">
                          <div className="pillar-icon-box p-amber">
                            <Timer size={20} />
                          </div>
                          <h3>Reality Check</h3>
                          <p>
                            Kalkulator cerdas yang membandingkan jam kuliah vs jam persiapan. Pastikan kamu punya waktu
                            istirahat sebelum daftar.
                          </p>
                          <button className="pillar-link" onClick={() => go("check", "design")}>
                            <span>Cek kalkulator</span> <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="pillar-card pillar-bridge">
                        <div className="pillar-artwork-box">
                          <img
                            src="/images/pillar-bridge.jpg"
                            alt="Confidence Bridge 3D Asset"
                            className="pillar-artwork-img"
                          />
                          <span className="pillar-num-badge">04</span>
                        </div>
                        <div className="pillar-copy-body">
                          <div className="pillar-icon-box p-rose">
                            <Map size={20} />
                          </div>
                          <h3>Confidence Bridge</h3>
                          <p>
                            Ubah keraguan (belum punya portofolio, takut jelek) jadi komitmen jika-maka dan 4 langkah mikro
                            30 menit.
                          </p>
                          <button className="pillar-link" onClick={() => go("plan", "design")}>
                            <span>Lihat contoh langkah</span> <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Interactive Simulator Section on Landing */}
                  <section className="sim-interactive-section">
                    <div className="sim-card-wrapper">
                      <div className="sim-info-col">
                        <BrushSwipe text="KALKULATOR BEBAN CEPAT" fontSize="11px" />
                        <h2>Uji Realitas Waktumu Sebelum Berkomitmen</h2>
                        <p>
                          Geser slider di samping untuk melihat apakah sebuah tantangan lomba atau proyek (estimasi 18 jam
                          persiapan) masuk akal dengan jadwal kuliahmu.
                        </p>

                        <div className="sim-artwork-mini-banner">
                          <img
                            src="/images/pillar-check.jpg"
                            alt="Kalkulator Waktu & Beban"
                            className="sim-artwork-mini-img"
                          />
                          <div className="sim-artwork-badge">
                            <Sparkles size={13} className="island-spark-icon" />
                            <span>Real-Time Balance Tracker</span>
                          </div>
                        </div>

                        <div className="sim-rules-pill">
                          <Info size={16} />
                          <span>Aturan utama: Jangan korbankan waktu tidur dan kesehatan mentalmu.</span>
                        </div>
                      </div>

                      <div className="sim-calculator-box">
                        <div className="sim-field">
                          <div className="sim-field-head">
                            <label htmlFor="sim-hours-slider">Jam Luang Tambahanmu:</label>
                            <span className="sim-val-badge">{simHours} Jam / Minggu</span>
                          </div>
                          <input
                            id="sim-hours-slider"
                            type="range"
                            min={2}
                            max={25}
                            value={simHours}
                            onChange={(e) => setSimHours(Number(e.target.value))}
                            className="range-slider"
                          />
                          <div className="slider-hints">
                            <span>2 jam (Sangat padat)</span>
                            <span>25 jam (Senggang)</span>
                          </div>
                        </div>

                        <div className="sim-field">
                          <div className="sim-field-head">
                            <label htmlFor="sim-weeks-slider">Target Durasi Persiapan:</label>
                            <span className="sim-val-badge">{simWeeks} Minggu</span>
                          </div>
                          <input
                            id="sim-weeks-slider"
                            type="range"
                            min={1}
                            max={6}
                            value={simWeeks}
                            onChange={(e) => setSimWeeks(Number(e.target.value))}
                            className="range-slider"
                          />
                          <div className="slider-hints">
                            <span>1 minggu (Kilat)</span>
                            <span>6 minggu (Santai)</span>
                          </div>
                        </div>

                        <div className={`sim-result-card ${isSimOverload ? "overload" : "safe"}`}>
                          <div className="sim-result-header">
                            <div className="sim-metric">
                              <small>Beban Mingguan</small>
                              <strong>{simLoad} jam/mgg</strong>
                            </div>
                            <div className="sim-metric">
                              <small>{isSimOverload ? "Kelebihan Beban" : "Sisa Jam Cadangan"}</small>
                              <strong className={isSimOverload ? "text-danger" : "text-success"}>
                                {Math.abs(simRemaining)} jam/mgg
                              </strong>
                            </div>
                          </div>

                          <div className="sim-verdict-text">
                            {isSimOverload ? (
                              <>
                                <strong>⚠️ Jadwalmu berisiko bentrok & burnout!</strong>
                                <p>
                                  Beban persiapan ({simLoad} jam/mgg) melebihi jam luangmu ({simHours} jam/mgg). Saran:
                                  tambah durasi persiapan menjadi {Math.ceil(18 / Math.max(1, simHours))} minggu agar
                                  tetap seimbang.
                                </p>
                              </>
                            ) : (
                              <>
                                <strong>✅ Aman! Sangat realistis untuk dijalani.</strong>
                                <p>
                                  Kamu masih punya sisa {simRemaining} jam/minggu untuk mengulang materi kuliah, revisi,
                                  dan istirahat tanpa rasa bersalah.
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        <button className="button primary full" onClick={() => go("explore")}>
                          <span>Cari Peluang yang Pas dengan Waktuku</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Curated Opportunities Preview */}
                  <section className="featured-opportunities-section">
                    <div className="section-head-between">
                      <div>
                        <BrushSwipe text="OPPORTUNITY RADAR" fontSize="11px" />
                        <h2>Contoh Peluang untuk Memulai</h2>
                        <p>Semua tantangan ini dirancang ramah bagi pemula yang belum pernah ikut lomba sebelumnya.</p>
                      </div>
                      <button className="button outline" onClick={() => go("explore")}>
                        Lihat Semua ({opportunities.length}) Peluang <ArrowRight size={15} />
                      </button>
                    </div>

                    <div className="featured-cards-grid">
                      {opportunities.slice(0, 3).map((o) => (
                        <OpportunityCard key={o.id} o={o} />
                      ))}
                    </div>
                  </section>

                  {/* Comparison Section (Before vs After) */}
                  <section className="comparison-section">
                    <div className="section-center-head">
                      <BrushSwipe text="TRANSFORMASI MINDSET" className="center-brush" fontSize="11px" />
                      <h2 className="section-title">Berhenti Menunggu Waktu yang "Sempurna"</h2>
                      <p className="section-desc">
                        Lihat bagaimana cara pandang mahasiswa berubah setelah menggunakan metode Karirin:
                      </p>
                    </div>

                    <div className="comparison-grid">
                      <div className="comp-card before">
                        <div className="comp-badge before-badge">Tanpa Karirin</div>
                        <h3>Sering Merasa Tertinggal & Buntu</h3>
                        <ul className="comp-list">
                          <li>
                            <span className="icon-cross">✕</span>
                            <span>Simpan puluhan poster lomba di bookmark Instagram, tapi tidak pernah didaftar.</span>
                          </li>
                          <li>
                            <span className="icon-cross">✕</span>
                            <span>Minder duluan karena merasa belum punya sertifikat atau portofolio keren.</span>
                          </li>
                          <li>
                            <span className="icon-cross">✕</span>
                            <span>
                              Daftar tanpa menghitung waktu, akhirnya mangkir di tengah jalan karena bentrok kuliah.
                            </span>
                          </li>
                          <li>
                            <span className="icon-cross">✕</span>
                            <span>Takut karya pertama jelek dan dikritik teman kampus.</span>
                          </li>
                        </ul>
                      </div>

                      <div className="comp-card after">
                        <div className="comp-badge after-badge">Dengan Karirin</div>
                        <h3>Melangkah Ringan & Terukur</h3>
                        <ul className="comp-list">
                          <li>
                            <span className="icon-check">✓</span>
                            <span>Fokus pada 1 peluang terbaik yang sudah dihitung kapasitas mingguan nyatanya.</span>
                          </li>
                          <li>
                            <span className="icon-check">✓</span>
                            <span>Tugas kuliah dan eksperimen kecil diakui sebagai modal awal yang sah.</span>
                          </li>
                          <li>
                            <span className="icon-check">✓</span>
                            <span>Reality Check memastikan waktu istirahat dan IPK tetap aman terjaga.</span>
                          </li>
                          <li>
                            <span className="icon-check">✓</span>
                            <span>Confidence Bridge memecah tugas jadi komitmen 30 menit tanpa overthinking.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Testimonials / Relatable Stories */}
                  <section className="testimonials-section">
                    <div className="section-center-head">
                      <BrushSwipe text="TEMAN BERTUMBUH" className="center-brush" fontSize="11px" />
                      <h2 className="section-title">Cerita Mereka yang Pernah Ragu</h2>
                    </div>

                    <div className="testimonials-grid">
                      <div className="testi-card">
                        <p className="testi-quote">
                          "Dulu aku overthinking berbulan-bulan cuma mau coba kompetisi esai pertama. Di Karirin langkah
                          pertamanya cuma bikin draf 30 menit tanpa edit. Ternyata gak seseram yang aku bayangin!"
                        </p>
                        <div className="testi-author">
                          <div className="testi-avatar">DP</div>
                          <div>
                            <strong>Dian Prameswari</strong>
                            <small>Mahasiswa Semester 4 · Menulis & Esai</small>
                          </div>
                        </div>
                      </div>

                      <div className="testi-card">
                        <p className="testi-quote">
                          "Fitur Reality Check-nya eye-opening banget. Dulu sering daftar barengan pas awal semester, pas
                          tengah semester burnout. Sekarang aku cuma ambil yang sesuai sisa kapasitas mingguan."
                        </p>
                        <div className="testi-author">
                          <div className="testi-avatar">KR</div>
                          <div>
                            <strong>Kevin Raditya</strong>
                            <small>Teknik Informatika · Mini Hackathon</small>
                          </div>
                        </div>
                      </div>

                      <div className="testi-card">
                        <p className="testi-quote">
                          "Tampilan barunya asik banget, serasa di pulau terbang langit yang seger dan bikin semangat.
                          Gak ada lagi sidebar yang bikin pusing!"
                        </p>
                        <div className="testi-author">
                          <div className="testi-avatar">NS</div>
                          <div>
                            <strong>Nabila Safitri</strong>
                            <small>Desain Komunikasi Visual · Design Challenge</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* FAQ Section */}
                  <section className="faq-section">
                    <div className="section-center-head">
                      <BrushSwipe text="TANYA JAWAB" className="center-brush" fontSize="11px" />
                      <h2 className="section-title">Pertanyaan yang Sering Diajukan</h2>
                    </div>

                    <div className="faq-list">
                      {[
                        {
                          q: "Apakah Karirin berbayar?",
                          a: "Sama sekali tidak. Karirin adalah platform gratis yang dibuat untuk membantu mahasiswa dan pemula memulai perjalanan bertumbuh tanpa biaya langganan.",
                        },
                        {
                          q: "Apakah saya harus membuat akun atau memasukkan email?",
                          a: "Tidak perlu. Semua data profil, simulasi, dan rencana langkahmu tersimpan langsung di browser lokal perangkatmu (localStorage). Kamu juga bisa mengekspor data ke file JSON kapan saja.",
                        },
                        {
                          q: "Bagaimana jika saya belum punya pengalaman sama sekali?",
                          a: "Justru platform ini dirancang khusus untukmu! Karirin membantu mengidentifikasi modal awal yang sering kamu remehkan (seperti tugas kuliah, observasi sederhana, atau rasa ingin tahu) untuk dijadikan bekal pertama.",
                        },
                        {
                          q: "Apakah Karirin mengirimkan pendaftaran langsung ke panitia lomba?",
                          a: "Tidak. Karirin berfungsi sebagai workspace persiapan pribadi untuk menyusun rencana dan memeriksa kesiapanmu. Pendaftaran resmi tetap dilakukan melalui kanal resmi masing-masing penyelenggara.",
                        },
                      ].map((item, idx) => (
                        <div key={idx} className={`faq-card ${faqOpen === idx ? "open" : ""}`}>
                          <button
                            className="faq-question-btn"
                            onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                          >
                            <span>{item.q}</span>
                            <ChevronDown size={18} className="faq-chevron" />
                          </button>
                          {faqOpen === idx && <div className="faq-answer-body">{item.a}</div>}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Final CTA Banner */}
                  <section className="landing-cta-banner">
                    <div className="cta-banner-content">
                      <BrushSwipe text="RUANG UNTUK MULAI" fontSize="11px" />
                      <h2>Kamu tidak harus siap untuk mulai bertumbuh.</h2>
                      <p>
                        Satu langkah kecil hari ini jauh lebih bernilai daripada niat besar yang terus ditunda. Masuk ke
                        ruang tumbuh dan temukan arahmu.
                      </p>
                      <div className="cta-btn-wrapper">
                        <button className="button primary large-cta-btn" onClick={() => go("home")}>
                          <Rocket size={18} />
                          <span>Masuk ke Ruang Tumbuh Sekarang</span>
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. RUANG TUMBUH (HOME DASHBOARD) */}
            {/* ========================================================================= */}
            {view === "home" && (
              <div className="workspace-view">
                <div className="page-header-banner">
                  <div className="header-copy">
                    <BrushSwipe text="PERJALANANMU DIMULAI DARI SINI" fontSize="11px" />
                    <h1>Langkah kecil. Arah yang berarti.</h1>
                    <p>
                      {state.profile.name ? `Hai, ${state.profile.name}. ` : ""}
                      Ada ruang untuk mencoba, belajar, dan menemukan jalanmu sendiri tanpa tekanan.
                    </p>
                  </div>
                  <div className="edition-badge">KARIRIN · V1.2</div>
                </div>

                {/* Welcome Hero Card with Unified Sky-Meadow Glow */}
                <section className="workspace-welcome-panel">
                  <div className="welcome-inner-copy">
                    <span className="panel-kicker">
                      <BrushSwipe text={state.profileSaved ? "DARI NIAT MENJADI TINDAKAN" : "KENALI TITIK MULAMU"} fontSize="10.5px" />
                    </span>
                    <h2>
                      {state.profileSaved ? (
                        <>
                          Peluang yang tepat, dimulai dari <em>kapasitasmu.</em>
                        </>
                      ) : (
                        <>
                          Tidak perlu tahu semuanya. Cukup tahu <em>langkah pertama.</em>
                        </>
                      )}
                    </h2>
                    <p>
                      {state.profileSaved
                        ? `Minat, waktu, dan tujuanmu jadi bekal untuk peluang yang realistis. Kamu punya ${Math.max(
                            0,
                            state.profile.hours - state.profile.committed
                          )} jam luang per minggu.`
                        : "Kenali minat dan kapasitasmu. Kita cari peluang yang sesuai, lalu ubah rasa ragu menjadi rencana nyata yang bisa kamu jalani."}
                    </p>
                    <div className="welcome-btn-group">
                      <button
                        className="button primary"
                        onClick={() => go(state.profileSaved ? "explore" : "profile")}
                      >
                        {state.profileSaved ? "Temukan peluangmu" : "Mulai dari profil diri"}
                        <ArrowUpRight size={16} />
                      </button>
                      <span className="caption-note">
                        {state.profileSaved
                          ? "Kamu yang menentukan langkahnya."
                          : "Sekitar 2 menit. Tidak ada jawaban yang salah."}
                      </span>
                    </div>
                  </div>

                  <div className="welcome-side-illustration">
                    <div className="growth-island-widget">
                      <div className="island-badge-pill">
                        <Sparkles size={12} className="island-spark-icon" />
                        <span>
                          {doneCount >= 8
                            ? "Penjelajah Tangguh"
                            : doneCount >= 4
                            ? "Perintis Langkah"
                            : "Tunas Penjelajah"}
                        </span>
                      </div>
                      <div className="island-artwork-wrapper">
                        <img
                          src="/images/growth-island.jpg"
                          alt="Pulau Pertumbuhan Karirin"
                          className="island-artwork-img"
                        />
                      </div>
                      <div className="island-micro-metrics">
                        <div className="micro-metric-item">
                          <strong>{doneCount}</strong>
                          <small>Langkah Tuntas</small>
                        </div>
                        <div className="micro-metric-divider" />
                        <div className="micro-metric-item">
                          <strong>{started}</strong>
                          <small>Peluang Aktif</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Stepper Progress Strip */}
                <section className="stepper-track-strip" aria-label="Tahapan perjalanan">
                  {[
                    {
                      label: "Kenali Diri",
                      sub: "Minat & kapasitas",
                      target: "profile" as View,
                      done: state.profileSaved,
                    },
                    {
                      label: "Temukan Peluang",
                      sub: "Pilihan yang relevan",
                      target: "explore" as View,
                      done: state.saved.length > 0,
                    },
                    {
                      label: "Susun Langkah",
                      sub: "Rencana yang realistis",
                      target: "plan" as View,
                      done: started > 0,
                    },
                    {
                      label: "Tumbuh dari Proses",
                      sub: "Progres & refleksi",
                      target: "progress" as View,
                      done: state.journeys.some((j) => j.status === "Direfleksikan"),
                    },
                  ].map((item, index) => (
                    <button
                      onClick={() => go(item.target)}
                      key={item.label}
                      className={`step-btn ${item.done ? "completed" : ""}`}
                    >
                      <div className="step-circle">
                        {item.done ? <Check size={14} /> : String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="step-text">
                        <strong>{item.label}</strong>
                        <small>{item.sub}</small>
                      </div>
                      {index < 3 && <ChevronRight className="step-arrow" size={14} />}
                    </button>
                  ))}
                </section>

                {/* Dashboard Grid */}
                <div className="dashboard-main-grid">
                  <section className="dashboard-opps-col">
                    <div className="dash-section-header">
                      <div>
                        <BrushSwipe text="BUKA KEMUNGKINAN BARU" fontSize="10.5px" />
                        <h2>{state.profileSaved ? "Dipilih dari Minatmu" : "Ada Banyak Cara untuk Mulai"}</h2>
                      </div>
                      <button className="text-link-btn" onClick={() => go("explore")}>
                        Lihat semua radar <ArrowRight size={15} />
                      </button>
                    </div>

                    <div className="opp-cards-grid">
                      {ranked.slice(0, 2).map((o) => (
                        <OpportunityCard key={o.id} o={o} compact />
                      ))}
                    </div>
                  </section>

                  <aside className="dashboard-action-col">
                    <div className="next-action-card">
                      <div className="card-top-title">
                        <h2>Langkah Berikutnya</h2>
                        <span className="spark-badge">
                          <ArrowUpRight size={16} />
                        </span>
                      </div>

                      <div className="card-action-content">
                        <span className="mini-kicker">
                          {nextJourney ? "RENCANA AKTIFMU" : "MULAI DARI HAL SEDERHANA"}
                        </span>
                        <h3>
                          {nextTask?.title ||
                            (nextJourney
                              ? "Catat pengalamanmu"
                              : state.profileSaved
                              ? "Pilih satu peluang menarik."
                              : "Luangkan waktu untuk mengenal dirimu.")}
                        </h3>
                        <p>
                          {nextTask?.detail ||
                            (nextJourney
                              ? "Apa yang kamu pelajari dari proses mencoba sejauh ini?"
                              : state.profileSaved
                              ? "Tidak harus langsung daftar. Simpan dulu, cek komitmennya, lalu tentukan langkahmu."
                              : "Apa yang membuatmu penasaran? Apa yang ingin kamu coba? Mulai dari sana.")}
                        </p>
                        <button
                          className="button outline full"
                          onClick={() =>
                            go(
                              nextJourney ? "plan" : state.profileSaved ? "explore" : "profile",
                              nextJourney?.opportunityId
                            )
                          }
                        >
                          {nextJourney ? "Buka rencana" : state.profileSaved ? "Jelajahi peluang" : "Kenali diriku"}
                          <ArrowRight size={15} />
                        </button>
                      </div>

                      <div className="card-progress-footer">
                        <span>
                          <strong>{doneCount}</strong> langkah kecil selesai
                        </span>
                        <span className="sparkle-symbol">✨</span>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. PROFIL DIRI (GROWTH DNA) */}
            {/* ========================================================================= */}
            {view === "profile" && (
              <div className="workspace-view">
                <PageHeading
                  kicker="01 / GROWTH DNA"
                  title="Mulai dari Mengenal Dirimu."
                  text="Bukan tes kepribadian yang kaku. Hanya bekal agar peluang dan rencana langkahmu benar-benar realistis."
                />

                <div className="profile-form-grid">
                  <form
                    className="profile-main-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setState((s) => ({
                        ...s,
                        profile: { ...draft, name: draft.name.trim() },
                        profileSaved: true,
                      }));
                      setNotice("Profil tersimpan! Peluang kini disesuaikan dengan minat dan kapasitasmu.");
                      go("explore");
                    }}
                  >
                    <section className="form-group-section">
                      <div className="form-head">
                        <span className="form-num">01</span>
                        <div>
                          <h2>Kenalan dulu, yuk.</h2>
                          <p>Bagaimana kami menyapamu?</p>
                        </div>
                      </div>
                      <div className="input-two-cols">
                        <label>
                          Nama Panggilan
                          <input
                            required
                            minLength={2}
                            maxLength={40}
                            value={draft.name}
                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                            placeholder="Misalnya, Rofi"
                            autoComplete="given-name"
                          />
                        </label>
                        <label>
                          Kampus / Komunitas <span className="opt-label">(opsional)</span>
                          <input
                            value={draft.university}
                            maxLength={100}
                            onChange={(e) => setDraft({ ...draft, university: e.target.value })}
                            placeholder="Tempatmu belajar saat ini"
                          />
                        </label>
                      </div>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={draft.student}
                          onChange={(e) => setDraft({ ...draft, student: e.target.checked })}
                        />
                        <span>Saya adalah mahasiswa aktif</span>
                      </label>
                    </section>

                    <section className="form-group-section">
                      <div className="form-head">
                        <span className="form-num">02</span>
                        <div>
                          <h2>Apa yang membuatmu penasaran?</h2>
                          <p>Pilih satu atau lebih bidang minat. Kamu selalu bisa mengubahnya nanti.</p>
                        </div>
                      </div>

                      <div className="interest-pills-selector" role="group" aria-label="Minat">
                        {interests.map((item) => (
                          <button
                            key={item}
                            type="button"
                            aria-pressed={draft.interests.includes(item)}
                            className={`interest-chip ${draft.interests.includes(item) ? "selected" : ""}`}
                            onClick={() =>
                              setDraft({
                                ...draft,
                                interests: draft.interests.includes(item)
                                  ? draft.interests.filter((x) => x !== item)
                                  : [...draft.interests, item],
                              })
                            }
                          >
                            {draft.interests.includes(item) ? <Check size={14} /> : <Plus size={14} />}
                            <span>{item}</span>
                          </button>
                        ))}
                      </div>

                      <label>
                        Tujuan Terdekatmu
                        <select
                          value={draft.goal}
                          onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
                        >
                          <option>Menemukan pengalaman pertama</option>
                          <option>Membangun portofolio</option>
                          <option>Mengasah keterampilan</option>
                          <option>Mencoba tantangan baru</option>
                        </select>
                      </label>

                      <label>
                        Bekal yang Sudah Kamu Punya <span className="opt-label">(opsional)</span>
                        <textarea
                          rows={3}
                          maxLength={1000}
                          value={draft.experience}
                          onChange={(e) => setDraft({ ...draft, experience: e.target.value })}
                          placeholder="Tugas kuliah, proyek kelas kecil, kepanitiaan, atau hobi… semuanya bisa jadi bekal awal yang sah."
                        />
                      </label>
                    </section>

                    <section className="form-group-section">
                      <div className="form-head">
                        <span className="form-num">03</span>
                        <div>
                          <h2>Beri ruang yang realistis.</h2>
                          <p>Alokasi ini khusus untuk kegiatan pengembangan di luar kuliah rutinmu.</p>
                        </div>
                      </div>

                      <div className="input-two-cols">
                        <label>
                          Alokasi Waktu Luang (jam/minggu)
                          <input
                            type="number"
                            min={1}
                            max={40}
                            required
                            value={draft.hours}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                hours: Number(e.target.value),
                                committed: Math.min(draft.committed, Number(e.target.value)),
                              })
                            }
                          />
                        </label>
                        <label>
                          Sudah Terpakai Komitmen Lain (jam/minggu)
                          <input
                            type="number"
                            min={0}
                            max={draft.hours}
                            required
                            value={draft.committed}
                            onChange={(e) => setDraft({ ...draft, committed: Number(e.target.value) })}
                          />
                        </label>
                      </div>

                      {(() => {
                        const freeHours = Math.max(0, draft.hours - draft.committed);
                        const freeRatio = draft.hours > 0 ? (freeHours / draft.hours) * 100 : 0;
                        const moodStatus =
                          freeHours >= 12
                            ? { label: "🌟 Sangat Luang & Siap Tantangan", fillClass: "safe", note: "Bagus sekali! Kamu punya ruang luas untuk berani eksplorasi tanpa risiko mengorbankan istirahat." }
                            : freeHours >= 6
                            ? { label: "🍃 Seimbang & Realistis", fillClass: "safe", note: "Kapasitas ideal untuk 1–2 aktivitas pengembangan diri mingguan yang fokus." }
                            : freeHours >= 1
                            ? { label: "⚡ Padat & Fokus Mikro", fillClass: "warning", note: "Waktu terbatas. Pilihlah kegiatan dengan luaran ringan dan langkah mikro 15–30 menit." }
                            : { label: "⚠️ Kapasitas Penuh", fillClass: "danger", note: "Seluruh waktu luangmu sudah terpakai. Jaga energimu dan seimbangkan komitmen sebelum menambah hal baru." };

                        return (
                          <div className="capacity-mood-widget">
                            <div className="capacity-mood-header">
                              <span className="capacity-mood-title">
                                <Timer size={16} />
                                <span>{moodStatus.label}</span>
                              </span>
                              <strong className="capacity-mood-val">{freeHours} jam / minggu</strong>
                            </div>
                            <div className="capacity-mood-bar-track">
                              <div
                                className={`capacity-mood-bar-fill ${moodStatus.fillClass}`}
                                style={{ width: `${Math.min(100, Math.max(8, freeRatio))}%` }}
                              />
                            </div>
                            <p className="capacity-mood-desc">{moodStatus.note}</p>
                          </div>
                        );
                      })()}

                      <label>
                        Anggaran Biaya per Peluang (Rp)
                        <input
                          type="number"
                          required
                          min={0}
                          max={100000000}
                          step={1000}
                          value={draft.budget}
                          onChange={(e) => setDraft({ ...draft, budget: Number(e.target.value) })}
                        />
                      </label>
                    </section>

                    <div className="form-submit-row">
                      <span className="form-note">Profil bisa diperbarui kapan saja.</span>
                      <button
                        type="submit"
                        className="button primary"
                        disabled={draft.interests.length === 0 || draft.name.trim().length < 2}
                      >
                        <span>Simpan & Temukan Peluang</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>

                    {draft.interests.length === 0 && (
                      <p className="validation-hint">Pilih setidaknya satu bidang minat untuk melanjutkan.</p>
                    )}
                  </form>

                  <aside className="profile-side-preview">
                    <div className="side-card">
                      <div className="passport-header-badge">
                        <Sparkles size={11} className="island-spark-icon" />
                        <span>PASPOR PERTUMBUHAN KARIER</span>
                      </div>

                      <div className="passport-artwork-box">
                        <img
                          src="/images/passport-badge.jpg"
                          alt="Paspor Petualang Karier"
                          className="passport-artwork-img"
                        />
                      </div>

                      <div className="passport-user-hero">
                        <div className="passport-avatar-circle">
                          {draft.name.trim() ? draft.name.trim().charAt(0).toUpperCase() : "🌟"}
                        </div>
                        <div className="passport-user-info">
                          <strong>{draft.name.trim() || "Calon Penjelajah"}</strong>
                          <small>{draft.university.trim() || "Mahasiswa Siap Tumbuh"}</small>
                        </div>
                      </div>

                      <h3>Pengalaman kecil tetap punya arti.</h3>
                      <p>
                        Belum pernah ikut lomba bergengsi? Tidak apa-apa. Tugas kuliah, membuat konten sendiri, atau
                        sekadar rasa ingin tahu juga merupakan titik awal yang sah dan berharga.
                      </p>
                      <hr className="divider" />
                      <div className="side-info-alert">
                        <ShieldCheck size={16} />
                        <small>Data profilmu tersimpan aman secara privat di browsermu.</small>
                      </div>

                      <div className="side-preview-capsule">
                        <span className="capsule-label">TARGET TERDEKAT</span>
                        <strong>{draft.goal}</strong>
                        <div className="tags-wrap">
                          {draft.interests.length > 0 ? (
                            draft.interests.map((i) => (
                              <span className="tag-chip" key={i}>
                                {i}
                              </span>
                            ))
                          ) : (
                            <span className="caption-note">Pilih minat di formulir...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. JELAJAHI PELUANG (OPPORTUNITY RADAR) */}
            {/* ========================================================================= */}
            {view === "explore" && (
              <div className="workspace-view">
                <PageHeading
                  kicker="02 / OPPORTUNITY RADAR"
                  title="Temukan Alasan untuk Mencoba."
                  text="Cari yang membuatmu penasaran. Kita periksa kesiapan kapasitas dan komitmennya bersama."
                />

                <div className="info-prototype-alert">
                  <Info size={18} />
                  <span>
                    Semua peluang di prototipe ini adalah <strong>data contoh</strong> untuk simulasi alur belajar Karirin,
                    bukan pendaftaran resmi dari penyelenggara.
                  </span>
                </div>

                {!state.profileSaved && (
                  <div className="profile-invite-banner">
                    <span>Lengkapi profil diri untuk mendapatkan rekomendasi urutan sesuai minat & kapasitasmu.</span>
                    <button className="button primary compact-btn" onClick={() => go("profile")}>
                      Isi Profil Dulu <ArrowRight size={14} />
                    </button>
                  </div>
                )}

                {/* Toolbar */}
                <div className="explore-search-toolbar">
                  <div className="search-input-box">
                    <Search size={18} className="search-icon" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Cari peluang, bidang minat, atau penyelenggara…"
                      aria-label="Cari peluang"
                    />
                    {query && (
                      <button className="clear-btn" onClick={() => setQuery("")} aria-label="Hapus pencarian">
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  <button
                    className={`button outline ${savedOnly ? "active-filter" : ""}`}
                    aria-pressed={savedOnly}
                    onClick={() => setSavedOnly(!savedOnly)}
                  >
                    <Bookmark size={15} />
                    <span>Tersimpan</span>
                    <span className="pill-counter">{state.saved.length}</span>
                  </button>
                </div>

                {/* Filter tabs */}
                <div className="category-filter-strip">
                  <div className="filter-pill-group" role="group" aria-label="Kategori peluang">
                    {["Semua", ...interests].map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        aria-pressed={category === c}
                        className={`filter-pill ${category === c ? "active" : ""}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  <label className="checkbox-item small-check">
                    <input type="checkbox" checked={free} onChange={(e) => setFree(e.target.checked)} />
                    <span>Hanya yang gratis</span>
                  </label>
                </div>

                {/* Results Count & Sort info */}
                <div className="results-status-row">
                  <span>
                    Menampilkan <strong>{filtered.length} peluang</strong> {savedOnly ? "tersimpan" : "di radar"}
                  </span>
                  <span className="sort-indicator">
                    <SlidersHorizontal size={13} />
                    {state.profileSaved ? "Diurutkan berdasarkan minat & kelayakan" : "Pilihan siap jelajah"}
                  </span>
                </div>

                {/* Opportunities Grid */}
                {filtered.length > 0 ? (
                  <div className="full-opps-grid">
                    {filtered.map((o) => (
                      <OpportunityCard key={o.id} o={o} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-results-box">
                    <div className="empty-icon-circle">
                      <Compass size={32} />
                    </div>
                    <h3>Belum ada peluang yang cocok dengan filtermu</h3>
                    <p>Coba gunakan kata kunci lain atau buka kembali semua kategori minat.</p>
                    <button
                      className="button outline"
                      onClick={() => {
                        setQuery("");
                        setCategory("Semua");
                        setFree(false);
                        setSavedOnly(false);
                      }}
                    >
                      Reset Semua Filter
                    </button>
                  </div>
                )}

                <div className="bottom-guidance-card">
                  <Compass size={22} />
                  <div>
                    <strong>Cocok itu lebih dari sekadar tertarik judulnya.</strong>
                    <p>
                      Di langkah berikutnya, kita periksa persyaratan, beban jam per minggu, dan biayanya. Kamu tetap
                      memegang kendali penuh.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. REALITY CHECK & DETAIL VIEW */}
            {/* ========================================================================= */}
            {view === "check" && (
              <div className="workspace-view">
                <button className="back-nav-btn" onClick={() => go("explore")}>
                  <ArrowLeft size={16} />
                  <span>Kembali ke Jelajahi Peluang</span>
                </button>

                <div className="detail-media-hero-banner">
                  <img
                    src={oppImages[current.id] || "/images/card-desain.jpg"}
                    alt={current.title}
                    className="detail-media-hero-img"
                  />
                  <div className="detail-media-hero-overlay" />
                  <div className="detail-media-hero-badge-row">
                    <span className={`opp-category-badge-chip ${current.color}`}>
                      {current.category}
                    </span>
                    <span className="opp-demo-pill">DATA CONTOH</span>
                  </div>
                </div>

                <div className="detail-hero-header">
                  <div className={`detail-mark-box ${current.color}`}>{current.mark}</div>
                  <div className="detail-title-block">
                    <div className="detail-tags-row">
                      <span className="opp-category">{current.category}</span>
                      <span className="opp-dot">·</span>
                      <span className="opp-type">{current.type}</span>
                      <span className="opp-dot">·</span>
                      <span className="opp-demo-pill">DATA CONTOH</span>
                    </div>
                    <h1>{current.title}</h1>
                    <p>
                      Diselenggarakan oleh <strong>{current.organizer}</strong> · Tingkat {current.level}
                    </p>
                  </div>
                  <button
                    className={`button outline save-detail-btn ${
                      state.saved.includes(selected) ? "is-saved" : ""
                    }`}
                    onClick={() => toggleSave(selected)}
                  >
                    <Bookmark size={16} fill={state.saved.includes(selected) ? "currentColor" : "none"} />
                    <span>{state.saved.includes(selected) ? "Tersimpan" : "Simpan Peluang"}</span>
                  </button>
                </div>

                <div className="detail-two-cols-layout">
                  <div className="detail-primary-col">
                    {/* Description card */}
                    <section className="detail-card">
                      <h2>Tentang Tantangan Ini</h2>
                      <p className="detail-desc-text">{current.description}</p>

                      <div className="deliverable-highlight-box">
                        <Flag size={20} />
                        <div>
                          <strong>Yang Akan Kamu Buat (Luaran):</strong>
                          <p>{current.deliverable}</p>
                        </div>
                      </div>

                      <div className="detail-metrics-row">
                        <div className="metric-box">
                          <small>Target Peserta</small>
                          <strong>{current.studentOnly ? "Mahasiswa Aktif" : "Terbuka Umum"}</strong>
                        </div>
                        <div className="metric-box">
                          <small>Tenggat Contoh</small>
                          <strong>
                            {new Date(current.date + "T00:00:00").toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </strong>
                        </div>
                        <div className="metric-box">
                          <small>Biaya Pendaftaran</small>
                          <strong>{money(current.cost)}</strong>
                        </div>
                      </div>
                    </section>

                    {/* Reality Check Simulator */}
                    <section className="detail-card reality-check-card">
                      <div className="reality-head">
                        <div>
                          <BrushSwipe text="SIMULASI BEBAN WAKTU" fontSize="10.5px" />
                          <h2>Reality Check: Apakah Ada Ruang untuk Mencoba?</h2>
                        </div>
                        <Timer size={24} className="timer-icon" />
                      </div>

                      <p className="reality-intro">
                        Simulasi ini membandingkan sisa waktu luang mingguanmu dengan estimasi beban persiapan. Geser
                        waktu persiapan untuk melihat skenario beban per minggu:
                      </p>

                      {!state.profileSaved && (
                        <div className="warning-banner">
                          <Info size={16} />
                          <span>
                            Simulasi memakai nilai contoh. Isi profil untuk mendapatkan perhitungan akurat sesuai
                            jadwalmu.
                          </span>
                          <button className="button primary compact-btn" onClick={() => go("profile")}>
                            Isi Profil
                          </button>
                        </div>
                      )}

                      <div className="slider-box">
                        <div className="slider-header-label">
                          <span>Target Waktu Persiapan:</span>
                          <strong className="slider-val-strong">{weeks} Minggu</strong>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={8}
                          value={weeks}
                          onChange={(e) => setWeeks(Number(e.target.value))}
                          className="range-slider"
                          aria-label="Target waktu persiapan dalam minggu"
                        />
                        <div className="slider-quick-presets" style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                          {[2, 3, 4, 6, 8].map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => setWeeks(w)}
                              className={`filter-pill ${weeks === w ? "active" : ""}`}
                              style={{ padding: "4px 12px", fontSize: "11.5px" }}
                            >
                              {w} Minggu
                            </button>
                          ))}
                        </div>
                        <small className="slider-hint-small">
                          Skenario 1–8 minggu · Tetap periksa tenggat resmi bila mengikuti peluang nyata.
                        </small>
                      </div>

                      <div className="simulation-kpi-grid">
                        <div className="kpi-card">
                          <span>Kapasitas Mingguanmu</span>
                          <strong>
                            {simulation.available} <small>jam/mgg</small>
                          </strong>
                        </div>
                        <div className="kpi-card">
                          <span>Kebutuhan Peluang</span>
                          <strong>
                            {simulation.required} <small>jam/mgg</small>
                          </strong>
                        </div>
                        <div className={`kpi-card ${simulation.overload ? "danger" : "safe"}`}>
                          <span>{simulation.overload ? "Kelebihan Beban" : "Ruang Tersisa"}</span>
                          <strong>
                            {simulation.overload || simulation.remaining} <small>jam/mgg</small>
                          </strong>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="capacity-bar-track">
                        <div
                          className={`capacity-bar-fill ${simulation.overload ? "overload" : ""}`}
                          style={{
                            width: `${Math.min(
                              100,
                              (simulation.required / Math.max(simulation.available, 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>

                      <div className={`simulation-verdict-box ${simulation.overload ? "caution" : "success"}`}>
                        <CheckCircle2 size={20} />
                        <div>
                          <strong>
                            {simulation.overload
                              ? "Rencana beban perlu disesuaikan."
                              : "Ada ruang yang aman dalam alokasi waktumu."}
                          </strong>
                          <p>
                            {simulation.overload
                              ? `Kebutuhan melebihi kapasitas sebesar ${simulation.overload} jam per minggu. Coba tambah durasi persiapan atau kurangi komitmen kegiatan lain.`
                              : "Masih tersisa waktu untuk revisi, belajar santai, dan tugas dadakan. Rencana ini masuk akal!"}
                          </p>
                        </div>
                      </div>

                      <div className="check-status-row">
                        <div className="check-status-badge">
                          <Wallet size={15} />
                          <span>
                            {simulation.affordable
                              ? "Biaya sesuai anggaranmu"
                              : `Melebihi anggaran ${money(current.cost - state.profile.budget)}`}
                          </span>
                        </div>
                        <div className="check-status-badge">
                          {simulation.eligible ? <CheckCircle2 size={15} /> : <Info size={15} />}
                          <span>
                            {simulation.eligible ? "Syarat status peserta terpenuhi" : "Khusus mahasiswa aktif"}
                          </span>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Confidence bridge sidebar */}
                  <aside className="detail-sidebar-col">
                    <div className="bridge-action-card">
                      <BrushSwipe text="CONFIDENCE BRIDGE" fontSize="10.5px" />
                      <h2>Apa yang Masih Membuatmu Ragu?</h2>
                      <p className="bridge-desc">
                        Pilih hambatan terbesar yang kamu rasakan saat ini. Rencana langkah awalmu akan otomatis
                        menyesuaikan.
                      </p>

                      <fieldset className="barrier-radio-list">
                        <legend className="sr-only">Pilih hambatan utama</legend>
                        {barriers.map((b) => (
                          <label key={b} className={`barrier-radio-label ${barrier === b ? "selected" : ""}`}>
                            <input
                              type="radio"
                              name="barrier"
                              value={b}
                              checked={barrier === b}
                              onChange={() => setBarrier(b)}
                            />
                            <span>{b}</span>
                          </label>
                        ))}
                      </fieldset>

                      <label className="if-then-label">
                        Satu Janji Kecil Jika–Maka <span className="opt-label">(opsional)</span>
                        <textarea
                          rows={3}
                          value={ifThen}
                          maxLength={300}
                          onChange={(e) => setIfThen(e.target.value)}
                          placeholder="Jika selesai kuliah jam 4 sore, maka aku akan membuka brief ini selama 30 menit."
                        />
                      </label>

                      <button
                        className="button primary full large-btn"
                        onClick={createPlan}
                        disabled={state.profileSaved && !simulation.eligible}
                      >
                        <span>
                          {journey
                            ? "Buka Rencana Langkahku"
                            : state.profileSaved
                            ? "Buat Rencana Langkah"
                            : "Lengkapi Profil Dulu"}
                        </span>
                        <ArrowRight size={16} />
                      </button>

                      <p className="footnote-text">
                        Kamu boleh mencoba meski masih ragu. Rencana ini adalah bantuan persiapan pribadi, bukan syarat
                        resmi pendaftaran.
                      </p>
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. RENCANA LANGKAH (CONFIDENCE BRIDGE) */}
            {/* ========================================================================= */}
            {view === "plan" && (
              <div className="workspace-view">
                <PageHeading
                  kicker="03 / CONFIDENCE BRIDGE"
                  title="Ubah Niat Jadi Langkah Nyata."
                  text="Tak perlu menyelesaikan semuanya hari ini. Pilih satu langkah kecil yang bisa kamu mulai sekarang."
                />

                {!started ? (
                  <div className="empty-results-box plan-empty-showcase">
                    <div className="empty-artwork-wrap">
                      <img
                        src="/images/journey-steps.jpg"
                        alt="Jembatan Rencana Karier"
                        className="empty-artwork-img"
                      />
                    </div>
                    <div className="empty-copy-block">
                      <span className="trophy-kicker-tag">
                        <Sparkles size={12} className="island-spark-icon" />
                        <span>LANGKAH MIKRO 30 MENIT</span>
                      </span>
                      <h2>Perjalananmu masih terbuka lebar.</h2>
                      <p>
                        Tak perlu siap segalanya untuk mulai melangkah. Pilih salah satu simulasi rencana di bawah ini untuk
                        melihat bagaimana 4 langkah mikro dapat memecah tugas besar menjadi tindakan ringan:
                      </p>
                      <div className="empty-quick-buttons">
                        <button className="button primary" onClick={() => go("plan", "design")}>
                          <span>Coba Rencana Desain Challenge</span>
                          <ArrowRight size={14} />
                        </button>
                        <button className="button outline" onClick={() => go("plan", "essay")}>
                          <span>Coba Rencana Esai & Riset</span>
                          <ArrowRight size={14} />
                        </button>
                        <button className="button outline" onClick={() => go("explore")}>
                          <span>Jelajahi Radar Peluang</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Journey tabs selector */}
                    <div className="journey-tabs-bar" role="group" aria-label="Pilih rencana perjalanan">
                      {state.journeys.map((j) => {
                        const o = opportunities.find((item) => item.id === j.opportunityId);
                        const done = j.tasks.filter((t) => t.done).length;
                        return (
                          <button
                            key={j.opportunityId}
                            aria-pressed={selected === j.opportunityId}
                            className={`journey-tab-btn ${selected === j.opportunityId ? "active" : ""}`}
                            onClick={() => go("plan", j.opportunityId)}
                          >
                            <span>{o?.type || "Peluang"}</span>
                            <span className="tab-task-count">
                              {done}/{j.tasks.length}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {(() => {
                      const j = journey || state.journeys[0];
                      const o = opportunities.find((item) => item.id === j.opportunityId)!;
                      const completed = j.tasks.filter((t) => t.done).length;

                      return (
                        <div className="plan-two-cols-layout">
                          <section className="plan-main-card">
                            <div className="plan-card-header">
                              <span className="opp-category">{o.type} · Rencana Pribadi</span>
                              <h2>{o.title}</h2>
                              <p className="plan-barrier-note">
                                Fokus penyesuaian hambatan: <strong>{j.barrier.toLowerCase()}</strong>
                              </p>

                              <div className="plan-progress-row">
                                <div className="plan-track">
                                  <div
                                    className="plan-fill"
                                    style={{ width: `${(completed / j.tasks.length) * 100}%` }}
                                  />
                                </div>
                                <span className="plan-progress-text">
                                  <strong>{completed}</strong> dari {j.tasks.length} langkah tuntas
                                </span>
                              </div>
                            </div>

                            <div className="tasks-checklist">
                              {j.tasks.map((task, i) => (
                                <label
                                  key={task.id}
                                  className={`task-checklist-item ${task.done ? "is-done" : ""}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={task.done}
                                    onChange={() =>
                                      updateJourney(j.opportunityId, {
                                        tasks: j.tasks.map((t) =>
                                          t.id === task.id ? { ...t, done: !t.done } : t
                                        ),
                                      })
                                    }
                                  />
                                  <div className="task-custom-check">
                                    {task.done ? <Check size={16} /> : null}
                                  </div>
                                  <div className="task-content-block">
                                    <span className="task-step-kicker">LANGKAH {String(i + 1).padStart(2, "0")}</span>
                                    <strong>{task.title}</strong>
                                    <p>{task.detail}</p>
                                  </div>
                                </label>
                              ))}
                            </div>

                            {completed === j.tasks.length && (
                              <div className="celebrate-banner">
                                <CheckCircle2 size={24} />
                                <div style={{ flex: 1 }}>
                                  <strong>Hebat! Semua langkah persiapan tuntas.</strong>
                                  <p>Kamu sudah bergerak sangat jauh dari titik mula. Siap untuk mencatat pendaftaran?</p>
                                </div>
                                <button
                                  className="button primary compact-btn"
                                  onClick={() => go("progress", j.opportunityId)}
                                  style={{ whiteSpace: "nowrap" }}
                                >
                                  <span>Catat di Refleksi</span>
                                  <ArrowRight size={14} />
                                </button>
                              </div>
                            )}
                          </section>

                          <aside className="plan-sidebar-card">
                            <BrushSwipe text="KOMITMEN KECILMU" fontSize="10.5px" />
                            <h3>Waktu yang Jelas, Langkah yang Ringan.</h3>

                            <label className="sidebar-field-label">
                              Rencana Jika–Maka:
                              <textarea
                                rows={4}
                                value={j.ifThen}
                                maxLength={300}
                                onChange={(e) => updateJourney(j.opportunityId, { ifThen: e.target.value })}
                                placeholder="Jika selesai kelas, maka aku akan membaca panduan ini selama 30 menit."
                              />
                            </label>

                            <span className="autosave-pill">
                              <span className="pulse-dot" /> Tersimpan otomatis di browser
                            </span>

                            <hr className="divider" />

                            <p className="plan-side-note">
                              Kamu bisa mencatat status pendaftaran kapan saja tanpa harus menuntaskan seluruh checklist.
                            </p>

                            <button
                              className="button primary full"
                              onClick={() => go("progress", j.opportunityId)}
                            >
                              <span>Catat Progres Perjalanan</span>
                              <ArrowRight size={16} />
                            </button>

                            <button
                              className="button outline full center-btn"
                              onClick={() => go("check", j.opportunityId)}
                            >
                              Tinjau Ulang Komitmen Waktu
                            </button>
                          </aside>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 7. PROGRES & REFLEKSI (GROWTH JOURNEY) */}
            {/* ========================================================================= */}
            {view === "progress" && (
              <div className="workspace-view">
                <PageHeading
                  kicker="04 / GROWTH JOURNEY"
                  title="Setiap Langkah Layak Dirayakan."
                  text="Bertumbuh bukan cuma soal menang atau kalah. Catat apa yang sudah kamu coba, waktu yang dihabiskan, dan pelajaran berharganya."
                />

                {/* 3D Milestone Trophy Spotlight Panel */}
                <div className="progress-trophy-spotlight-panel">
                  <div className="trophy-artwork-wrap">
                    <img
                      src="/images/milestone-trophy.jpg"
                      alt="Piala Milestone Pertumbuhan"
                      className="trophy-artwork-img"
                    />
                  </div>
                  <div className="trophy-copy-col">
                    <span className="trophy-kicker-tag">
                      <Sparkles size={12} className="island-spark-icon" />
                      <span>RAYAKAN SETIAP LANGKAH KECIL</span>
                    </span>
                    <h2>Hasil akhir itu bonus. Pengalaman mencoba adalah modal nyata.</h2>
                    <p>
                      Di Karirin, kamu tidak dinilai dari kemenangan atau kegagalan. Setiap jam yang kamu luangkan untuk
                      bereksperimen dan merefleksikan proses adalah bekal otentik yang tidak akan pernah hilang.
                    </p>
                  </div>
                </div>

                {/* Overall Stats Cards */}
                <div className="journey-stats-strip">
                  <div className="stat-card">
                    <span className="stat-label">Perjalanan Dimulai</span>
                    <strong className="stat-value">{started.toString().padStart(2, "0")}</strong>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Langkah Selesai</span>
                    <strong className="stat-value">{doneCount.toString().padStart(2, "0")}</strong>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Refleksi Ditulis</span>
                    <strong className="stat-value">
                      {state.journeys
                        .filter((j) => j.status === "Direfleksikan")
                        .length.toString()
                        .padStart(2, "0")}
                    </strong>
                  </div>
                  <div className="stat-card quote-card">
                    <Mountain size={28} />
                    <p>Bandingkan dirimu hari ini dengan dirimu yang kemarin.</p>
                  </div>
                </div>

                {!started ? (
                  <div className="empty-results-box progress-empty-showcase">
                    <div className="empty-artwork-wrap">
                      <img
                        src="/images/growth-island.jpg"
                        alt="Taman Pertumbuhan"
                        className="empty-artwork-img"
                      />
                    </div>
                    <div className="empty-copy-block">
                      <span className="trophy-kicker-tag">
                        <Sparkles size={12} className="island-spark-icon" />
                        <span>GROWTH JOURNAL</span>
                      </span>
                      <h2>Langkah Pertamamu Akan Tercatat di Sini</h2>
                      <p>
                        Setiap kali kamu menyelesaikan langkah mikro atau menulis refleksi, progresmu akan terangkum di
                        etalase piala ini. Mulai dari satu peluang kecil sekarang.
                      </p>
                      <button className="button primary" onClick={() => go("explore")}>
                        <span>Mulai Eksplorasi Sekarang</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="progress-cards-stack">
                    {state.journeys.map((j) => (
                      <ProgressCardItem
                        key={j.opportunityId}
                        journey={j}
                        onChange={(patch) => updateJourney(j.opportunityId, patch)}
                        onPlan={() => go("plan", j.opportunityId)}
                        notify={setNotice}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Toast Notification */}
      {notice && (
        <div className="toast-notification" role="status">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{notice}</span>
          <button className="toast-close-btn" aria-label="Tutup pemberitahuan" onClick={() => setNotice("")}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function PageHeading({
  kicker,
  title,
  text,
  badge = "KARIRIN · V1.2",
}: {
  kicker: string;
  title: string;
  text: string;
  badge?: string;
}) {
  return (
    <div className="page-header-banner">
      <div className="header-copy">
        <BrushSwipe text={kicker} fontSize="11px" />
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      <div className="edition-badge">
        <Sparkles size={11} className="island-spark-icon" />
        <span>{badge}</span>
      </div>
    </div>
  );
}

function ProgressCardItem({
  journey: j,
  onChange,
  onPlan,
  notify,
}: {
  journey: Journey;
  onChange: (patch: Partial<Journey>) => void;
  onPlan: () => void;
  notify: (text: string) => void;
}) {
  const o = opportunities.find((item) => item.id === j.opportunityId)!;
  const [reflection, setReflection] = useState(j.reflection);
  const [hours, setHours] = useState(j.actualHours);
  const statuses: Journey["status"][] = ["Direncanakan", "Didaftar", "Diikuti", "Direfleksikan"];
  const index = statuses.indexOf(j.status);

  return (
    <article className="progress-history-card">
      <div className="progress-card-top">
        <div className={`opp-badge ${o.color}`}>{o.mark}</div>
        <div className="card-top-info">
          <span className="opp-category">{o.type} · Peluang Terencana</span>
          <h2>{o.title}</h2>
        </div>
        <button className="button outline compact-btn" onClick={onPlan}>
          <span>Lihat Checklist</span>
          <ArrowUpRight size={15} />
        </button>
      </div>

      {/* Timeline Stepper */}
      <ol className="journey-timeline-track">
        {statuses.map((status, i) => (
          <li key={status} className={`timeline-node ${i <= index ? "reached" : ""}`}>
            <div className="timeline-node-circle">{i < index ? <Check size={13} /> : i + 1}</div>
            <span className="timeline-node-label">{status}</span>
          </li>
        ))}
      </ol>

      <div className="progress-action-row">
        <div className="current-status-display">
          <span className="status-kicker">STATUS TERKINI:</span>
          <strong>{j.status}</strong>
        </div>

        {index < 2 && (
          <button
            className="button primary compact-btn"
            onClick={() => {
              onChange({ status: statuses[index + 1] });
              notify("Status perjalanan diperbarui. Ini catatan pribadi untuk melacak progresmu.");
            }}
          >
            <span>{index === 0 ? "Tandai Sudah Mendaftar" : "Tandai Sudah Mengikuti"}</span>
            <Check size={15} />
          </button>
        )}

        <small className="status-disclaimer">
          Perubahan status ini adalah catatan pribadi di browsermu.
        </small>
      </div>

      <form
        className="reflection-journal-form"
        onSubmit={(e) => {
          e.preventDefault();
          onChange({
            reflection: reflection.trim(),
            actualHours: hours,
            status: index >= 2 ? "Direfleksikan" : j.status,
          });
          notify(
            index >= 2
              ? "Refleksi tersimpan! Pengalaman ini jadi bekal berharga untuk langkah berikutnya."
              : "Catatan tersimpan. Kamu bisa melengkapinya setelah kegiatan selesai."
          );
        }}
      >
        <div className="reflection-text-col">
          <label>
            Apa yang kamu pelajari dari proses ini?
            <textarea
              rows={3}
              required
              minLength={10}
              maxLength={2000}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Ceritakan hal baru yang kamu coba, tantangan yang muncul, atau hal yang ingin kamu perbaiki di kesempatan berikutnya…"
            />
          </label>
          <small className="char-count-hint">Minimal 10 karakter. Bisa ditulis sejak tahap persiapan.</small>
        </div>

        <div className="reflection-inputs-col">
          <label>
            Waktu Aktual yang Dihabiskan:
            <input
              type="number"
              min={0}
              max={10000}
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder={`Estimasi awal ${o.hours} jam`}
            />
          </label>
          {hours !== "" && (
            <small className="hours-diff-note">
              Selisih dari estimasi: {Number(hours) - o.hours > 0 ? "+" : ""}
              {Number(hours) - o.hours} jam.
            </small>
          )}
          <button type="submit" className="button primary full" disabled={reflection.trim().length < 10}>
            <span>Simpan Refleksi</span>
            <Check size={15} />
          </button>
        </div>
      </form>
    </article>
  );
}
