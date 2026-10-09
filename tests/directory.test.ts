import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  defaults,
  filterHooks,
  hooks,
  makeCsv,
  networks,
  parseSaved,
  readFilters,
  writeFilters,
} from "../src/directory";

describe("Official snapshot integrity", () => {
  it("includes every unique non-zero allowlist pair and no unlisted constants", () => {
    const raw = readFileSync(
      "data/upstream/hooksAddressesAllowlist.ts.txt",
      "utf8",
    );
    const constants = new Map(
      [...raw.matchAll(/export const (\w+) = '(0x[0-9a-fA-F]{40})'/g)].map(
        (match) => [match[1], match[2].toLowerCase()],
      ),
    );
    const chainSlugs: Record<string, string> = {
      MAINNET: "ethereum",
      BASE: "base",
      SEPOLIA: "sepolia",
      OPTIMISM: "optimism",
      ARBITRUM_ONE: "arbitrum",
      POLYGON: "polygon",
      BNB: "bnb",
      AVALANCHE: "avalanche",
      UNICHAIN: "unichain",
      MONAD: "monad",
      XLAYER: "xlayer",
      TEMPO: "tempo",
    };
    const expected = new Set<string>();
    for (const match of raw
      .split("export const HOOKS_ADDRESSES_ALLOWLIST:")[1]
      .matchAll(/\[ChainId\.(\w+)\]:\s*\[([^\]]*)\]/g)) {
      for (const entry of match[2]
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item && item !== "ADDRESS_ZERO")) {
        expect(constants.has(entry)).toBe(true);
        expect(chainSlugs[match[1]]).toBeTruthy();
        expected.add(`${chainSlugs[match[1]]}:${constants.get(entry)}`);
      }
    }
    expect(new Set(hooks.map((hook) => hook.id))).toEqual(expected);
    expect(hooks.length).toBe(expected.size);
    expect(hooks.length).toBe(117);
    expect(networks).toHaveLength(12);
    expect(hooks.filter((hook) => hook.testnet)).toHaveLength(2);
  });

  it("preserves descriptions and source status from exact registry matches", () => {
    const metadata = JSON.parse(
      readFileSync("data/upstream/matched-hooklist.json", "utf8"),
    ) as Array<{
      address: string;
      chain: string;
      verifiedSource: boolean;
      description: string;
    }>;
    for (const hook of hooks) {
      const match = metadata.find(
        (item) =>
          item.chain === hook.chain &&
          item.address.toLowerCase() === hook.address,
      );
      expect(hook.verifiedSource).toBe(match?.verifiedSource ?? null);
      if (match) expect(hook.description).toBe(match.description);
      expect(hook.explorerUrl).toContain(hook.address);
      expect(hook.allowlistUrl).toMatch(
        /^https:\/\/github\.com\/Uniswap\/routing-api\/blob\/[a-f0-9]{40}\//,
      );
      expect(hook.address).toMatch(/^0x[a-f0-9]{40}$/);
    }
  });
});

describe("Directory interactions", () => {
  it("searches case-insensitively by name, description, address, and chain ID", () => {
    const hook = hooks.find((item) => item.name === "Angstrom Hook")!;
    expect(filterHooks({ ...defaults, query: "  ANGSTROM  " }, [])).toContain(
      hook,
    );
    expect(
      filterHooks({ ...defaults, query: hook.address.toUpperCase() }, []),
    ).toEqual([hook]);
    expect(filterHooks({ ...defaults, query: "8453" }, [])).toHaveLength(57);
    expect(filterHooks({ ...defaults, query: "hourly daily" }, [])).toContain(
      hooks.find((item) => item.name === "Action Hook"),
    );
    expect(filterHooks({ ...defaults, query: "zzzx-nonexistent" }, [])).toEqual(
      [],
    );
  });
  it("combines filters and searches all pages", () => {
    expect(filterHooks({ ...defaults, chain: "base" }, [])).toHaveLength(57);
    expect(filterHooks({ ...defaults, source: "verified" }, [])).toHaveLength(
      106,
    );
    expect(filterHooks({ ...defaults, source: "unknown" }, [])).toHaveLength(
      11,
    );
    const combined = filterHooks(
      { ...defaults, query: "Clanker", chain: "base", source: "verified" },
      [],
    );
    expect(combined).toHaveLength(4);
    expect(
      combined.every((hook) => hook.chain === "base" && hook.verifiedSource),
    ).toBe(true);
  });
  it("sorts deterministically in both directions and filters saved hooks", () => {
    expect(filterHooks({ ...defaults, sort: "desc" }, [])).toEqual(
      [...filterHooks(defaults, [])].reverse(),
    );
    expect(filterHooks({ ...defaults, view: "saved" }, [hooks[50].id])).toEqual(
      [hooks[50]],
    );
  });
  it("validates persisted data and hash parameters", () => {
    expect(parseSaved("oops")).toEqual([]);
    expect(parseSaved("{}")).toEqual([]);
    expect(
      parseSaved(JSON.stringify([hooks[0].id, hooks[0].id, "unknown", 7])),
    ).toEqual([hooks[0].id]);
    expect(readFilters("#chain=unknown&source=invalid&page=-2")).toEqual(
      defaults,
    );
    const filters = {
      ...defaults,
      query: "Clanker + fee",
      chain: "base",
      page: 3,
    };
    expect(readFilters(writeFilters(filters))).toEqual(filters);
  });
  it("exports every filtered row with provenance and safe CSV escaping", () => {
    const rows = filterHooks(
      { ...defaults, query: "Clanker", chain: "base" },
      [],
    );
    const csv = makeCsv(rows);
    expect(csv.split("\r\n")).toHaveLength(5);
    expect(csv).toContain("Snapshot date");
    for (const hook of rows) expect(csv).toContain(hook.address);
    const hostile = {
      ...hooks[0],
      name: "=1+2",
      description: 'Some "quoted", text\nwith a newline',
    };
    expect(makeCsv([hostile])).toContain('"\'=1+2"');
    expect(makeCsv([hostile])).toContain(
      '"Some ""quoted"", text\nwith a newline"',
    );
  });
});
