import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";

test("loads the production export at a subpath without resource or console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()}: ${response.url()}`);
  });
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Discover the hook ecosystem.",
  );
  await expect(page.locator("tbody tr")).toHaveCount(10);
  await expect(
    page.getByText("Showing", { exact: false }).last(),
  ).toContainText("1–10");
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      document.fonts.check('500 16px "DM Sans Variable"'),
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("search, combined filters, empty recovery, pagination, sort, and URL reload", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(page.locator(".pagination")).toContainText("11–20");
  await page.getByLabel("Search hooks", { exact: true }).fill("clanker");
  await page.getByLabel("Chain", { exact: true }).selectOption("base");
  await page
    .getByLabel("Verified source", { exact: true })
    .selectOption("verified");
  await expect(page.locator("tbody tr")).toHaveCount(4);
  await expect(page.locator(".chain-cell .chain-badge")).toHaveText([
    "Base",
    "Base",
    "Base",
    "Base",
  ]);
  const first = await page.locator(".hook-name").first().innerText();
  await page.getByRole("button", { name: "Name", exact: true }).click();
  expect(await page.locator(".hook-name").last().innerText()).toBe(first);
  await page.reload();
  await expect(page.getByLabel("Search hooks", { exact: true })).toHaveValue(
    "clanker",
  );
  await expect(page.locator("tbody tr")).toHaveCount(4);
  await page
    .getByLabel("Search hooks", { exact: true })
    .fill("no-such-hook-987");
  await expect(
    page.getByRole("heading", { name: "No hooks match these filters" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Export CSV" })).toBeDisabled();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .last()
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(10);
  await expect(page.getByLabel("Search hooks", { exact: true })).toBeFocused();
  await page
    .getByLabel("Verified source", { exact: true })
    .selectOption("unknown");
  await expect(page.locator(".result-count")).toHaveText("11");
  await expect(page.locator(".source-badge").first()).toContainText(
    "Not recorded",
  );
});

test("bookmark, saved collection, persistence, remove, and saved empty state", async ({
  page,
}) => {
  await page.goto("./");
  const save = page.getByRole("button", {
    name: "Save Action Hook on Ethereum",
    exact: true,
  });
  await save.click();
  await expect(
    page.getByRole("button", {
      name: "Unsave Action Hook on Ethereum",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /^Saved hooks/ }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Unsave Action Hook on Ethereum",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "A home for your discoveries" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Explore hooks", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(10);
});

test("details, full address, copy, source destination, Escape, and focus return", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  const trigger = page.getByRole("button", {
    name: "Action Hook",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".full-address")).toHaveText(
    "0x00bbc6fc07342cf80d14b60695cf0e1aa8de00cc",
  );
  await dialog
    .getByRole("button", { name: "Copy address", exact: true })
    .click();
  await expect(
    dialog.getByText("Address copied.", { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "0x00bbc6fc07342cf80d14b60695cf0e1aa8de00cc",
  );
  await expect(dialog.locator(".source-badge")).toHaveAttribute(
    "href",
    "https://etherscan.io/address/0x00bbc6fc07342cf80d14b60695cf0e1aa8de00cc#code",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: "How this list works" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "explicit allowlist only",
  );
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "How this list works" }),
  ).toBeFocused();
});

test("CSV export contains the full filtered set beyond the current page", async ({
  page,
}) => {
  await page.goto("./#chain=base");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const download = await downloadEvent;
  const csv = readFileSync((await download.path())!, "utf8");
  expect(download.suggestedFilename()).toBe("hookbook-all-2026-10-09.csv");
  expect(csv.split("\r\n")).toHaveLength(58);
  expect(csv).toContain("Snapshot date");
  expect(csv).toContain("0x448d57cf3cd68a4a56c931da6abec381d23f90c0");
});

test("pagination reaches all 117 entries exactly once, including the final page", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator("tbody tr")).toHaveCount(10);
  const links: string[] = [];
  for (let index = 1; index <= 12; index++) {
    links.push(
      ...(await page
        .locator("tbody .source-badge")
        .evaluateAll((elements) =>
          elements.map((element) => (element as HTMLAnchorElement).href),
        )),
    );
    if (index < 12)
      await page
        .getByRole("button", { name: "Next page", exact: true })
        .click();
  }
  expect(links).toHaveLength(117);
  expect(new Set(links).size).toBe(117);
  await expect(
    page.getByRole("button", { name: "Next page", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".pagination")).toContainText("111–117");
  await page.getByLabel("Chain", { exact: true }).selectOption("sepolia");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await expect(page.locator(".testnet-label")).toHaveCount(2);
  await expect(page.locator(".pagination")).toContainText("1–2");
});

test("keyboard flow and modal focus containment", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page.getByLabel("Search hooks", { exact: true }).focus();
  await page.keyboard.type("Angstrom");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Angstrom Hook", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Close dialog", exact: true }),
  ).toBeFocused();
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => !!document.activeElement?.closest("dialog")),
    ).toBe(true);
  }
});

test("storage failures are recoverable and do not prevent saving in memory", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Disabled", "SecurityError");
    };
  });
  await page.goto("./");
  await page
    .getByRole("button", { name: "Save Action Hook on Ethereum", exact: true })
    .click();
  await expect(
    page.getByText(
      "Saved for this visit only. Browser storage is unavailable.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Saved hooks/ }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
});

for (const width of [1440, 1024, 768, 390, 320]) {
  test(`responsive layout and accessibility at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("./");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByLabel("Search hooks", { exact: true }),
    ).toBeVisible();
    await page.getByLabel("Search hooks", { exact: true }).fill("clanker");
    await page.getByLabel("Chain", { exact: true }).selectOption("base");
    await expect(page.locator("tbody tr")).toHaveCount(4);
    const violations = (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations;
    expect(violations).toEqual([]);
  });
}

test("dialog, empty state, and reduced motion accessibility", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.getByRole("button", { name: "Action Hook", exact: true }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(
    await page
      .getByRole("button", { name: "Close dialog" })
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  ).toBe("0s");
  await page.keyboard.press("Escape");
  await page.getByLabel("Search hooks", { exact: true }).fill("zz-no-result");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
