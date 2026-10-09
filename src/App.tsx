import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Code2,
  Copy,
  FileCode2,
  Grid2X2,
  Info,
  Layers,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  allowlistUrl,
  defaults,
  filterHooks,
  hooks,
  makeCsv,
  networks,
  PAGE_SIZE,
  parseSaved,
  readFilters,
  registryUrl,
  shortAddress,
  snapshot,
  writeFilters,
} from "./directory";
import type { Filters, Hook } from "./directory";
import {
  BrandMark,
  ChainBadge,
  ExternalLink,
  HookAvatar,
  Modal,
  SourceBadge,
} from "./components";

const STORAGE_KEY = "hookbook:saved:v1";
const verifiedCount = hooks.filter(
  (hook) => hook.verifiedSource === true,
).length;
const snapshotDate = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${snapshot.retrievedAt}T00:00:00Z`));

function App() {
  const [filters, setFilters] = useState<Filters>(() =>
    readFilters(window.location.hash),
  );
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      return parseSaved(localStorage.getItem(STORAGE_KEY));
    } catch {
      return [];
    }
  });
  const [notice, setNotice] = useState("");
  const [selectedHook, setSelectedHook] = useState<Hook | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const filtered = useMemo(() => filterHooks(filters, saved), [filters, saved]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const start = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const hasFilters = Boolean(
    filters.query || filters.chain !== "all" || filters.source !== "all",
  );

  useEffect(() => {
    const handleHash = () => setFilters(readFilters(window.location.hash));
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null)
        setSaved(parseSaved(event.newValue));
    };
    window.addEventListener("hashchange", handleHash);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("hashchange", handleHash);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function updateFilters(change: Partial<Filters>) {
    const next = { ...filters, page: 1, ...change };
    setFilters(next);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}${writeFilters(next)}`,
    );
  }

  function toggleSave(hook: Hook) {
    const removing = saved.includes(hook.id);
    const next = removing
      ? saved.filter((id) => id !== hook.id)
      : [...saved, hook.id];
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setNotice(
        `${hook.name} ${removing ? "removed from" : "added to"} saved hooks.`,
      );
    } catch {
      setNotice("Saved for this visit only. Browser storage is unavailable.");
    }
  }

  function exportCsv() {
    const url = URL.createObjectURL(
      new Blob([makeCsv(filtered)], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `hookbook-${filters.view}-${snapshot.retrievedAt}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(
      `Exported ${filtered.length} ${filtered.length === 1 ? "deployment" : "deployments"} as CSV.`,
    );
  }

  function clearFilters() {
    updateFilters({ query: "", chain: "all", source: "all" });
    searchRef.current?.focus();
  }

  function changePage(next: number) {
    updateFilters({ page: next });
    resultsRef.current?.focus({ preventScroll: true });
    resultsRef.current?.scrollIntoView({ block: "start" });
  }

  async function copyAddress(hook: Hook) {
    try {
      await navigator.clipboard.writeText(hook.address);
      setCopyMessage("Address copied.");
    } catch {
      setCopyMessage("Copy is unavailable. Select and copy the address below.");
    }
  }

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Skip to content
      </a>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            updateFilters({ ...defaults });
          }}
          aria-label="Hookbook home"
        >
          <BrandMark />
          <span>
            hookbook<span className="brand-dot">.</span>
          </span>
        </a>
        <span className="sidebar-eyebrow">Discover & explore</span>
        <nav className="primary-nav" aria-label="Main navigation">
          <button
            className={filters.view === "all" ? "nav-item active" : "nav-item"}
            aria-current={filters.view === "all" ? "page" : undefined}
            onClick={() =>
              updateFilters({
                view: "all",
                query: "",
                chain: "all",
                source: "all",
              })
            }
          >
            <Grid2X2 size={18} aria-hidden="true" />
            <span>Hook directory</span>
            <span className="nav-count">{hooks.length}</span>
          </button>
          <button
            className={
              filters.view === "saved" ? "nav-item active" : "nav-item"
            }
            aria-current={filters.view === "saved" ? "page" : undefined}
            onClick={() =>
              updateFilters({
                view: "saved",
                query: "",
                chain: "all",
                source: "all",
              })
            }
          >
            <Bookmark size={18} aria-hidden="true" />
            <span>Saved hooks</span>
            <span className="nav-count">{saved.length}</span>
          </button>
        </nav>
        <div className="sidebar-resources">
          <span className="sidebar-eyebrow">Resources</span>
          <button className="nav-item" onClick={() => setAboutOpen(true)}>
            <CircleHelp size={18} aria-hidden="true" />
            <span>About the data</span>
          </button>
          <ExternalLink
            className="nav-item"
            href="https://developers.uniswap.org/docs/protocols/v4/concepts/hooks"
          >
            <BookOpen size={18} aria-hidden="true" />
            <span>Uniswap v4 docs</span>
          </ExternalLink>
        </div>
        <div className="sidebar-bottom">
          <div className="builder-card">
            <div className="builder-art" aria-hidden="true">
              <Code2 />
              <span className="art-line" />
              <Layers />
              <span className="art-line" />
              <BrandMark />
            </div>
            <h2>
              Small hooks.
              <br />
              Big possibilities.
            </h2>
            <p>
              Build your own extension
              <br />
              to Uniswap v4.
            </p>
            <ExternalLink href="https://developers.uniswap.org/docs/protocols/v4/guides/hooks/getting-started">
              Start building
            </ExternalLink>
          </div>
          <div className="independent">
            <span className="status-dot" />
            An independent ecosystem directory
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Ecosystem</span>
            <ChevronRight size={14} aria-hidden="true" />
            <span>
              {filters.view === "saved" ? "Saved hooks" : "Hook directory"}
            </span>
          </div>
          <div className="topbar-links">
            <span className="version-badge">
              <BrandMark />
              Uniswap v4
            </span>
            <ExternalLink href={allowlistUrl}>View allowlist</ExternalLink>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <section className="page-heading" aria-labelledby="page-title">
            <div>
              <div className="eyebrow">
                <span className="mini-line" />A little code. A lot of
                possibility.
              </div>
              <h1 id="page-title">
                {filters.view === "saved"
                  ? "Your hook collection"
                  : "Discover the hook ecosystem"}
                <span className="heading-dot">.</span>
              </h1>
              <p>
                {filters.view === "saved"
                  ? "Keep the hooks you’re exploring close at hand."
                  : "Explore the hooks on Uniswap’s routing allowlist. Find your next building block."}
              </p>
            </div>
            <button
              className="button export-button"
              onClick={exportCsv}
              disabled={filtered.length === 0}
            >
              <ArrowDownToLine size={17} aria-hidden="true" />
              Export CSV
            </button>
          </section>

          <section className="stats" aria-label="Allowlist snapshot overview">
            <div className="stat-card">
              <div>
                <span className="stat-label">Allowlisted deployments</span>
                <div className="stat-value">
                  {hooks.length}
                  <span className="stat-tag">Uniswap v4</span>
                </div>
                <p>Every explicit entry, in one place</p>
              </div>
              <span className="stat-icon pink">
                <Layers size={21} aria-hidden="true" />
              </span>
            </div>
            <div className="stat-card">
              <div>
                <span className="stat-label">Networks represented</span>
                <div className="stat-value">
                  {networks.length}
                  <span className="mini-networks" aria-hidden="true">
                    <span className="mini-chain mini-eth">◆</span>
                    <span className="mini-chain mini-base">━</span>
                    <span className="mini-chain mini-uni">✳</span>
                    <span className="mini-more">+{networks.length - 3}</span>
                  </span>
                </div>
                <p>
                  {networks.filter((network) => !network.testnet).length} mainnets ·{" "}
                  {networks.filter((network) => network.testnet).length} testnet
                </p>
              </div>
              <span className="stat-icon neutral">
                <Grid2X2 size={21} aria-hidden="true" />
              </span>
            </div>
            <div className="stat-card">
              <div>
                <span className="stat-label">Verified sources</span>
                <div className="stat-value">
                  {verifiedCount}
                  <span className="stat-fraction">/ {hooks.length}</span>
                </div>
                <p>Reported by the Uniswap Hooklist</p>
              </div>
              <span className="stat-icon green">
                <ShieldCheck size={22} aria-hidden="true" />
              </span>
            </div>
          </section>

          <div className="scope-note">
            <Info size={16} aria-hidden="true" />
            <p>
              Routing compatibility, with context. Allowlisting is not a
              security audit.
            </p>
            <button onClick={() => setAboutOpen(true)}>
              How this list works
              <ArrowUpRight size={14} aria-hidden="true" />
            </button>
          </div>

          <section
            className="directory-panel"
            aria-labelledby="directory-title"
          >
            <div className="directory-heading">
              <div className="view-switch" aria-label="Directory view">
                <button
                  className={
                    filters.view === "all"
                      ? "view-button selected"
                      : "view-button"
                  }
                  aria-pressed={filters.view === "all"}
                  onClick={() => updateFilters({ view: "all" })}
                >
                  <Grid2X2 size={16} aria-hidden="true" />
                  All hooks<span>{hooks.length}</span>
                </button>
                <button
                  className={
                    filters.view === "saved"
                      ? "view-button selected"
                      : "view-button"
                  }
                  aria-pressed={filters.view === "saved"}
                  onClick={() => updateFilters({ view: "saved" })}
                >
                  <Bookmark size={16} aria-hidden="true" />
                  Saved<span>{saved.length}</span>
                </button>
              </div>
              <span className="snapshot-label">
                <span className="status-dot" />
                Snapshot · {snapshotDate}
              </span>
            </div>
            <div className="filter-bar">
              <div className="search-field">
                <label htmlFor="hook-search">Search hooks</label>
                <div className="input-wrap">
                  <Search size={18} aria-hidden="true" />
                  <input
                    ref={searchRef}
                    id="hook-search"
                    name="search"
                    type="search"
                    autoComplete="off"
                    maxLength={300}
                    placeholder="Name, description, or contract address…"
                    value={filters.query}
                    onChange={(event) =>
                      updateFilters({ query: event.target.value })
                    }
                  />
                  {filters.query && (
                    <button
                      className="clear-search"
                      aria-label="Clear search"
                      onClick={() => {
                        updateFilters({ query: "" });
                        searchRef.current?.focus();
                      }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
              <div className="select-field">
                <label htmlFor="chain-filter">Chain</label>
                <select
                  id="chain-filter"
                  value={filters.chain}
                  onChange={(event) =>
                    updateFilters({ chain: event.target.value })
                  }
                >
                  <option value="all">All chains</option>
                  {networks.map((network) => (
                    <option key={network.slug} value={network.slug}>
                      {network.name}
                      {network.testnet ? " (testnet)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="select-field">
                <label htmlFor="source-filter">Verified source</label>
                <select
                  id="source-filter"
                  value={filters.source}
                  onChange={(event) =>
                    updateFilters({
                      source: event.target.value as Filters["source"],
                    })
                  }
                >
                  <option value="all">All source statuses</option>
                  <option value="verified">Verified</option>
                  <option value="unknown">Not recorded</option>
                </select>
              </div>
            </div>
            <div className="results-bar">
              <h2 id="directory-title" ref={resultsRef} tabIndex={-1}>
                {filters.view === "saved" ? "Saved hooks" : "All hooks"}
                <span className="result-count">{filtered.length}</span>
              </h2>
              <div className="results-right">
                <span role="status" aria-live="polite" aria-atomic="true">
                  {hasFilters
                    ? `${filtered.length} matching ${filtered.length === 1 ? "deployment" : "deployments"}`
                    : "One row per deployment"}
                </span>
                {hasFilters && (
                  <button className="text-button" onClick={clearFilters}>
                    Clear filters
                    <X size={13} aria-hidden="true" />
                  </button>
                )}
                <button
                  className="mobile-sort icon-button"
                  aria-label={`Sort names ${filters.sort === "asc" ? "Z to A" : "A to Z"}`}
                  onClick={() =>
                    updateFilters({
                      sort: filters.sort === "asc" ? "desc" : "asc",
                    })
                  }
                >
                  {filters.sort === "asc" ? (
                    <ArrowDown size={16} />
                  ) : (
                    <ArrowUp size={16} />
                  )}
                </button>
              </div>
            </div>
            {visible.length ? (
              <>
                <table className="hooks-table" role="table">
                  <caption className="sr-only">
                    Uniswap explicitly allowlisted hook deployments. Source
                    status is reported by Hooklist.
                  </caption>
                  <thead>
                    <tr role="row">
                      <th
                        scope="col"
                        aria-sort={
                          filters.sort === "asc" ? "ascending" : "descending"
                        }
                      >
                        <button
                          className="sort-button"
                          onClick={() =>
                            updateFilters({
                              sort: filters.sort === "asc" ? "desc" : "asc",
                            })
                          }
                        >
                          Name
                          {filters.sort === "asc" ? (
                            <ArrowDown size={13} aria-hidden="true" />
                          ) : (
                            <ArrowUp size={13} aria-hidden="true" />
                          )}
                        </button>
                      </th>
                      <th scope="col">Chain</th>
                      <th scope="col">Description</th>
                      <th scope="col">
                        Verified source
                        <button
                          className="column-info"
                          aria-label="About verified source status"
                          onClick={() => setAboutOpen(true)}
                        >
                          <CircleHelp size={13} />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((hook) => (
                      <tr key={hook.id} role="row">
                        <td role="cell" className="name-cell">
                          <div className="hook-name-group">
                            <HookAvatar name={hook.name} />
                            <div className="hook-name-text">
                              <button
                                className="hook-name"
                                onClick={() => {
                                  setCopyMessage("");
                                  setSelectedHook(hook);
                                }}
                              >
                                {hook.name}
                              </button>
                              <span
                                className="address-preview"
                                title={hook.address}
                              >
                                {shortAddress(hook.address)}
                              </span>
                            </div>
                            <button
                              className={`save-button ${saved.includes(hook.id) ? "is-saved" : ""}`}
                              aria-label={`${saved.includes(hook.id) ? "Unsave" : "Save"} ${hook.name} on ${hook.chainName}`}
                              aria-pressed={saved.includes(hook.id)}
                              onClick={() => toggleSave(hook)}
                            >
                              <Bookmark
                                size={16}
                                fill={
                                  saved.includes(hook.id)
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          </div>
                        </td>
                        <td role="cell" className="chain-cell">
                          <span
                            className="mobile-cell-label"
                            aria-hidden="true"
                          >
                            Chain
                          </span>
                          <ChainBadge hook={hook} />
                        </td>
                        <td role="cell" className="description-cell">
                          <span className="description-text">
                            {hook.description}
                          </span>
                          <button
                            className="read-details"
                            onClick={() => {
                              setCopyMessage("");
                              setSelectedHook(hook);
                            }}
                            aria-label={`Read details for ${hook.name} on ${hook.chainName}`}
                          >
                            Read details
                            <ArrowUpRight size={12} aria-hidden="true" />
                          </button>
                        </td>
                        <td role="cell" className="source-cell">
                          <span
                            className="mobile-cell-label"
                            aria-hidden="true"
                          >
                            Verified source
                          </span>
                          <SourceBadge hook={hook} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination">
                  <span>
                    Showing{" "}
                    <strong>
                      {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)}
                    </strong>{" "}
                    of <strong>{filtered.length}</strong> deployments
                  </span>
                  <div className="pagination-controls">
                    <button
                      className="icon-button"
                      aria-label="Previous page"
                      disabled={page === 1}
                      onClick={() => changePage(page - 1)}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span>
                      Page <strong>{page}</strong> of {pageCount}
                    </span>
                    <button
                      className="icon-button"
                      aria-label="Next page"
                      disabled={page === pageCount}
                      onClick={() => changePage(page + 1)}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">
                  {filters.view === "saved" && !hasFilters ? (
                    <Bookmark size={26} />
                  ) : (
                    <Search size={26} />
                  )}
                </span>
                <h3>
                  {filters.view === "saved" && !saved.length && !hasFilters
                    ? "A home for your discoveries"
                    : "No hooks match these filters"}
                </h3>
                <p>
                  {filters.view === "saved" && !saved.length && !hasFilters
                    ? "Save a hook using its bookmark button. It will be waiting here when you return on this browser."
                    : filters.query
                      ? `No results for “${filters.query}”. Try a different name or clear the filters to explore more hooks.`
                      : "Try another chain or source status, or clear your filters to see more hooks."}
                </p>
                <button
                  className="button primary-button"
                  onClick={() => {
                    if (hasFilters) clearFilters();
                    else updateFilters({ ...defaults });
                  }}
                >
                  {hasFilters ? "Clear filters" : "Explore hooks"}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            )}
          </section>
          <footer className="page-footer">
            <p>
              <FileCode2 size={14} aria-hidden="true" />
              Open data. More possibilities.
            </p>
            <div>
              <button
                className="text-button"
                onClick={() => setAboutOpen(true)}
              >
                Data & methodology
              </button>
              <span aria-hidden="true">·</span>
              <ExternalLink href="https://developers.uniswap.org/hook-allowlist">
                Submit a hook
              </ExternalLink>
            </div>
          </footer>
          <div
            className="notice"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {notice && (
              <>
                <Check size={15} aria-hidden="true" />
                <span>{notice}</span>
                <button
                  className="icon-button"
                  aria-label="Dismiss notification"
                  onClick={() => setNotice("")}
                >
                  <X size={15} />
                </button>
              </>
            )}
          </div>
        </main>
      </div>

      {selectedHook && (
        <Modal title="Hook details" onClose={() => setSelectedHook(null)}>
          <div className="detail-identity">
            <HookAvatar name={selectedHook.name} />
            <div>
              <h3>{selectedHook.name}</h3>
              <ChainBadge hook={selectedHook} />
            </div>
          </div>
          <div className="detail-section">
            <span className="detail-label">Description</span>
            <p>{selectedHook.description}</p>
          </div>
          <div className="detail-section">
            <div className="detail-label-row">
              <span className="detail-label">Contract address</span>
              <button
                className="text-button"
                onClick={() => copyAddress(selectedHook)}
              >
                <Copy size={14} aria-hidden="true" />
                Copy address
              </button>
            </div>
            <code className="full-address" dir="ltr">
              {selectedHook.address}
            </code>
            <p className="copy-message" role="status">
              {copyMessage}
            </p>
            <span className="detail-meta">
              Chain ID {selectedHook.chainId}
              {selectedHook.testnet && " · Test network"}
            </span>
          </div>
          <div className="detail-section source-detail">
            <span className="detail-label">Verified source</span>
            <SourceBadge hook={selectedHook} />
            <p>
              {selectedHook.verifiedSource === true
                ? "Hooklist reports that this contract’s source is verified. Open the explorer to inspect it."
                : "Source verification is not recorded in the Hooklist snapshot. This does not mean the contract is unverified."}
            </p>
          </div>
          <div className="evidence-links">
            <ExternalLink href={selectedHook.allowlistUrl}>
              Allowlist record
            </ExternalLink>
            {selectedHook.metadataUrl && (
              <ExternalLink href={selectedHook.metadataUrl}>
                Hooklist metadata
              </ExternalLink>
            )}
          </div>
          <div className="modal-footer">
            <span>Snapshot · {snapshotDate}</span>
            <button
              className="button primary-button"
              onClick={() => toggleSave(selectedHook)}
            >
              <Bookmark
                size={16}
                fill={saved.includes(selectedHook.id) ? "currentColor" : "none"}
                aria-hidden="true"
              />
              {saved.includes(selectedHook.id)
                ? "Remove from saved"
                : "Save hook"}
            </button>
          </div>
        </Modal>
      )}
      {aboutOpen && (
        <Modal
          title="A closer look at the data"
          onClose={() => setAboutOpen(false)}
          className="about-modal"
        >
          <div className="about-intro">
            <span className="stat-icon pink">
              <SlidersHorizontal size={23} aria-hidden="true" />
            </span>
            <p>
              A clear view of Uniswap’s explicit hook allowlist, with the source
              behind every entry.
            </p>
          </div>
          <div className="about-section">
            <h3>What’s included?</h3>
            <p>
              All {hooks.length} unique, non-zero chain and address pairs in
              Uniswap’s public routing allowlist at the snapshot below. Multiple
              deployments of the same hook appear separately. This includes two
              Sepolia testnet entries.
            </p>
            <ExternalLink href={allowlistUrl}>
              Inspect the official allowlist
            </ExternalLink>
          </div>
          <div className="about-section">
            <h3>What does “verified” mean?</h3>
            <p>
              For {verifiedCount} deployments, Uniswap’s Hooklist reports a
              verified contract source. The other {hooks.length - verifiedCount}{" "}
              have no matching source record in this snapshot. Descriptions are
              from Hooklist, whose metadata may be generated automatically.
              Source verification and allowlisting are not security audits or
              endorsements.
            </p>
            <ExternalLink href={registryUrl}>
              Explore the Hooklist registry
            </ExternalLink>
          </div>
          <div className="about-section">
            <h3>Is this every hook eligible for routing?</h3>
            <p>
              No. Uniswap also automatically allows certain hooks based on their
              flags and address. This directory covers the explicit allowlist
              only; the Hooklist registry by itself is not an allowlist.
            </p>
            <ExternalLink href="https://developers.uniswap.org/hook-allowlist">
              Read Uniswap’s routing criteria
            </ExternalLink>
          </div>
          <div className="snapshot-box">
            <span className="detail-label">Data snapshot</span>
            <strong>{snapshotDate}</strong>
            <p>
              This site uses a bundled snapshot, so it works without a data
              service. Changes after this date require a new export.
            </p>
            <code>
              routing-api · {snapshot.allowlistCommit.slice(0, 7)}
              <br />
              hooklist · {snapshot.hooklistCommit.slice(0, 7)}
            </code>
          </div>
          <p className="about-footnote">
            Hookbook is an independent directory and is not affiliated with
            Uniswap Labs. Saved hooks stay in this browser; no account is
            needed.
          </p>
        </Modal>
      )}
    </div>
  );
}

export default App;
