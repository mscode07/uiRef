import "server-only";
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { fetchPublicResource, publicTarget } from "./network";
import { storage } from "../storage";

export async function captureWebsite(url: string) {
  const capture = await captureWebsiteInMemory(url);
  return { screenshot: await storage.put(capture.bytes, "png"), evidence: capture.evidence };
}

/** Capture for temporary previews: never writes an image or a database record. */
export async function captureWebsiteInMemory(url: string) {
  await publicTarget(url);
  const installedChrome =
    process.platform === "darwin" &&
    existsSync("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
  const serverless = process.env.VERCEL && !process.env.UIREF_BROWSER_PATH
    ? (await import("@sparticuz/chromium")).default
    : undefined;
  const browser = await chromium.launch({
    headless: true,
    chromiumSandbox: !serverless,
    ...(serverless ? {
      args: serverless.args,
      executablePath: await serverless.executablePath(),
    } : {}),
    ...(process.env.UIREF_BROWSER_PATH
      ? { executablePath: process.env.UIREF_BROWSER_PATH }
      : installedChrome
        ? { channel: "chrome" }
        : {}),
  });
  const abort = new AbortController();
  const deadline = setTimeout(() => {
    abort.abort();
    void browser.close();
  }, 50000);
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
      serviceWorkers: "block",
      acceptDownloads: false,
    });
    let requests = 0;
    let bytes = 0;
    await context.routeWebSocket("**/*", (socket) => socket.close());
    await context.route("**/*", async (route) => {
      const request = route.request();
      if (
        ++requests > 220 ||
        bytes > 70 * 1024 * 1024 ||
        request.method() !== "GET" ||
        ["media", "eventsource"].includes(request.resourceType())
      ) {
        await route.abort().catch(() => {});
        return;
      }
      try {
        const resource = await fetchPublicResource(request.url(), abort.signal);
        bytes += resource.body.length;
        await route.fulfill(resource);
      } catch {
        await route.abort().catch(() => {});
      }
    });
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    page.on("dialog", (dialog) => void dialog.dismiss());
    context.on("page", (popup) => {
      if (popup !== page) void popup.close();
    });
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    if (!response || response.status() >= 400)
      throw new Error(
        "The website did not allow a preview. Upload a screenshot instead.",
      );
    await page
      .waitForLoadState("networkidle", { timeout: 8000 })
      .catch(() => {});
    await page.evaluate(() =>
      Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]),
    );
    // Observe the rendered page, including computed styles, rather than guessing tokens from HTML.
    const evidence = await page.evaluate(() => {
      const visible = (el: Element) => {
        const r = el.getBoundingClientRect();
        return (
          r.width > 0 &&
          r.height > 0 &&
          getComputedStyle(el).visibility !== "hidden"
        );
      };
      const describe = (el: Element) => {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          element: el.tagName.toLowerCase(),
          text: (el.textContent || "")
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, 180),
          font: s.fontFamily,
          size: s.fontSize,
          weight: s.fontWeight,
          lineHeight: s.lineHeight,
          tracking: s.letterSpacing,
          color: s.color,
          background: s.backgroundColor,
          radius: s.borderRadius,
          border: s.borderColor,
          padding: s.padding,
          gap: s.gap,
          display: s.display,
          columns: s.gridTemplateColumns,
          width: Math.round(r.width),
        };
      };
      return {
        title: document.title,
        viewport: "1440 × 1000",
        pageHeight: document.documentElement.scrollHeight,
        description:
          document
            .querySelector('meta[name="description"]')
            ?.getAttribute("content") || "",
        body: describe(document.body),
        elements: Array.from(
          document.querySelectorAll(
            "h1,h2,h3,main,header,nav,section,button,a,p",
          ),
        )
          .filter(visible)
          .slice(0, 100)
          .map(describe),
      };
    });
    const height = Math.min(4000, Math.max(1000, evidence.pageHeight));
    const screenshot = await page.screenshot({
      type: "png",
      fullPage: true,
      clip: { x: 0, y: 0, width: 1440, height },
      animations: "disabled",
      timeout: 12000,
    });
    return { bytes: screenshot, evidence };
  } finally {
    clearTimeout(deadline);
    abort.abort();
    await browser.close();
  }
}
export type WebsiteEvidence = Awaited<
  ReturnType<typeof captureWebsite>
>["evidence"];
