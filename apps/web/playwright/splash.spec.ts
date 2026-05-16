import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Splash screen", () => {
  test("renders the Lepo lockup and tagline in Slovenian", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByText("Atelier · Slovenija")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Lepo/ })).toBeVisible();
    await expect(page.getByText(/Rezerviraj termin za lepoto/)).toBeVisible();
  });

  test("has no critical accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const critical = results.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact ?? ""),
    );
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });
});
