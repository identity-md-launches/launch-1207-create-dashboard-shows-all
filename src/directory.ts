import rawHooks from "./data/hooks.json";
import provenance from "../data/provenance.json";

export type Hook = (typeof rawHooks)[number];
export type Filters = {
  query: string;
  chain: string;
  source: "all" | "verified" | "unknown";
  view: "all" | "saved";
  sort: "asc" | "desc";
  page: number;
};
export const hooks: Hook[] = rawHooks;
export const snapshot = provenance;
export const PAGE_SIZE = 10;
export const defaults: Filters = {
  query: "",
  chain: "all",
  source: "all",
  view: "all",
  sort: "asc",
  page: 1,
};
export const networks = [
  ...new Map(
    hooks.map((hook) => [
      hook.chain,
      { slug: hook.chain, name: hook.chainName, testnet: hook.testnet },
    ]),
  ).values(),
].sort((a, b) => a.name.localeCompare(b.name));
export const allowlistUrl = `https://github.com/Uniswap/routing-api/blob/${snapshot.allowlistCommit}/${snapshot.allowlistPath}`;
export const registryUrl = `https://github.com/Uniswap/hooklist/tree/${snapshot.hooklistCommit}`;

export function readFilters(hash: string): Filters {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const chain = params.get("chain") || "all";
  const source = params.get("source");
  const page = Number(params.get("page"));
  return {
    query: (params.get("q") || "").slice(0, 300),
    chain: networks.some((network) => network.slug === chain) ? chain : "all",
    source: source === "verified" || source === "unknown" ? source : "all",
    view: params.get("view") === "saved" ? "saved" : "all",
    sort: params.get("sort") === "desc" ? "desc" : "asc",
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

export function writeFilters(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.chain !== "all") params.set("chain", filters.chain);
  if (filters.source !== "all") params.set("source", filters.source);
  if (filters.view !== "all") params.set("view", filters.view);
  if (filters.sort !== "asc") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString() ? `#${params}` : "";
}

export function filterHooks(filters: Filters, saved: string[]): Hook[] {
  const terms = filters.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return hooks
    .filter((hook) => {
      const text =
        `${hook.name} ${hook.chainName} ${hook.chainId} ${hook.description} ${hook.address} ${hook.upstreamName}`.toLowerCase();
      return (
        terms.every((term) => text.includes(term)) &&
        (filters.chain === "all" || hook.chain === filters.chain) &&
        (filters.source === "all" ||
          (filters.source === "verified"
            ? hook.verifiedSource === true
            : hook.verifiedSource !== true)) &&
        (filters.view !== "saved" || saved.includes(hook.id))
      );
    })
    .sort((a, b) => {
      const comparison =
        a.name.localeCompare(b.name) ||
        a.chainName.localeCompare(b.chainName) ||
        a.address.localeCompare(b.address);
      return filters.sort === "asc" ? comparison : -comparison;
    });
}

export function parseSaved(value: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? [
          ...new Set(
            parsed.filter(
              (id): id is string =>
                typeof id === "string" && hooks.some((hook) => hook.id === id),
            ),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}

export function makeCsv(rows: Hook[]): string {
  const cell = (value: unknown) => {
    const text = String(value ?? "");
    // Prevent spreadsheet formula interpretation if upstream metadata changes.
    const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return (
    "\uFEFF" +
    [
      [
        "Name",
        "Chain",
        "Chain ID",
        "Description",
        "Verified source (Hooklist)",
        "Contract address",
        "Source URL",
        "Allowlist evidence",
        "Metadata evidence",
        "Snapshot date",
      ],
      ...rows.map((hook) => [
        hook.name,
        hook.chainName,
        hook.chainId,
        hook.description,
        hook.verifiedSource === true ? "Verified" : "Not recorded",
        hook.address,
        hook.explorerUrl,
        hook.allowlistUrl,
        hook.metadataUrl,
        snapshot.retrievedAt,
      ]),
    ]
      .map((row) => row.map(cell).join(","))
      .join("\r\n")
  );
}

export const shortAddress = (address: string) =>
  `${address.slice(0, 6)}…${address.slice(-4)}`;
