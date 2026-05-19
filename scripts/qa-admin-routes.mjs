import { mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import http from "node:http";
import net from "node:net";
import { globalForbidden, routeChecks } from "./admin-routes-qa.config.mjs";

const args = new Set(process.argv.slice(2));
const jsonOnly = args.has("--json");
const debugText = process.env.ADMIN_ROUTE_QA_DEBUG === "1";
const baseUrl = process.env.ADMIN_ROUTE_QA_BASE_URL ?? "http://localhost:3000";
const localeScript = `localStorage.setItem("sparkirl_locale", "ru")`;
const localeBeforeHydrationScript = `
  try {
    localStorage.setItem("sparkirl_locale", "ru");
  } catch {
    // localStorage can be unavailable on browser-internal pages.
  }
`;

function normalizePathname(value) {
  const url = new URL(value, baseUrl);
  return url.pathname.replace(/\/$/, "") || "/";
}

function findChromeExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate));
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

function waitForProcessExit(processHandle, timeoutMs = 2000) {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve();
    }, timeoutMs);

    processHandle.once("exit", () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve();
    });
  });
}

function cdpHttp(port, method, path) {
  return new Promise((resolve, reject) => {
    const request = http.request({ hostname: "127.0.0.1", port, method, path }, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => resolve({ status: response.statusCode, data }));
    });
    request.on("error", reject);
    request.end();
  });
}

async function waitForChrome(port) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 10_000) {
    try {
      const response = await cdpHttp(port, "GET", "/json/version");
      if (response.status === 200) return;
    } catch {
      // Retry until Chrome opens the DevTools endpoint.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Headless Chrome did not expose a DevTools endpoint in time.");
}

async function newPageWebSocket(port) {
  let response = await cdpHttp(port, "PUT", "/json/new?about:blank");
  if (response.status < 200 || response.status >= 300) {
    response = await cdpHttp(port, "GET", "/json/new?about:blank");
  }
  const target = JSON.parse(response.data);
  return target.webSocketDebuggerUrl;
}

class CdpClient {
  constructor(webSocketUrl) {
    this.id = 0;
    this.pending = new Map();
    this.ws = new WebSocket(webSocketUrl);
  }

  open() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (!message.id || !this.pending.has(message.id)) return;
        const { resolve: resolvePending, reject: rejectPending } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) {
          rejectPending(new Error(JSON.stringify(message.error)));
        } else {
          resolvePending(message.result);
        }
      };
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  close() {
    this.ws.close();
  }
}

async function getRouteStatus(route) {
  const url = new URL(route, baseUrl);
  const response = await fetch(url, { redirect: "manual" });
  return {
    status: response.status,
    location: response.headers.get("location") ?? "",
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result.result?.value;
}

async function primeLocale(cdp) {
  await cdp.send("Page.navigate", { url: new URL("/", baseUrl).toString() });
  await waitForStableBodyText(cdp);
  await evaluate(cdp, localeScript);
}

async function waitForStableBodyText(cdp, expected = []) {
  let previousText = "";
  let stableCount = 0;

  for (let attempt = 0; attempt < 18; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const payload = await evaluate(
      cdp,
      `(() => ({
        readyState: document.readyState,
        text: document.body ? document.body.innerText : "",
        path: location.pathname
      }))()`,
    );
    const text = payload?.text ?? "";
    const ready = payload?.readyState === "complete" || payload?.readyState === "interactive";
    const hasExpected = expected.length === 0 || expected.every((item) => text.includes(item));
    const textStable = text === previousText && text.length > 0;

    if (ready && hasExpected) return payload;
    if (ready && textStable) stableCount += 1;
    if (stableCount >= 3) return payload;
    previousText = text;
  }

  return evaluate(
    cdp,
    `(() => ({
      readyState: document.readyState,
      text: document.body ? document.body.innerText : "",
      path: location.pathname
    }))()`,
  );
}

function findTerms(text, terms) {
  return terms.filter((term) => text.includes(term));
}

function findMissingTerms(text, terms) {
  return terms.filter((term) => !text.includes(term));
}

async function checkRoute(cdp, config) {
  let status = 0;
  let location = "";
  try {
    const statusResult = await getRouteStatus(config.route);
    status = statusResult.status;
    location = statusResult.location;
  } catch {
    status = 0;
  }

  await cdp.send("Page.navigate", { url: new URL(config.route, baseUrl).toString() });
  await waitForStableBodyText(cdp, config.expected ?? []);
  await evaluate(cdp, localeScript);
  await cdp.send("Page.reload", { ignoreCache: true });
  const hydratedPayload = await waitForStableBodyText(cdp, config.expected ?? []);

  const text = hydratedPayload?.text ?? "";
  const finalPath = normalizePathname(hydratedPayload?.path ?? config.route);
  const expectedFinalPath = config.redirectTo ? normalizePathname(config.redirectTo) : null;
  const redirectMismatch =
    expectedFinalPath && finalPath !== expectedFinalPath
      ? { expected: expectedFinalPath, actual: finalPath }
      : null;
  const missingExpected = findMissingTerms(text, config.expected ?? []);
  const foundForbidden = findTerms(text, [...globalForbidden, ...(config.forbidden ?? [])]);
  const statusOk = config.redirectTo
    ? status === 200 || status === 307 || status === 308
    : status === 200;
  const passed = statusOk && !redirectMismatch && missingExpected.length === 0 && foundForbidden.length === 0;

  return {
    route: config.route,
    group: config.group,
    status,
    finalPath,
    passed,
    missingExpected,
    foundForbidden,
    redirectMismatch,
    location,
    ...(debugText ? { textSample: text.slice(0, 240), textLength: text.length } : {}),
  };
}

function printHumanSummary(summary) {
  console.log(`Admin route QA against ${baseUrl}`);
  console.log(`Total: ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed} | Warnings: ${summary.warnings}`);

  for (const result of summary.routes) {
    const marker = result.passed ? "PASS" : "FAIL";
    const redirect = result.redirectMismatch
      ? ` redirect expected ${result.redirectMismatch.expected}, got ${result.redirectMismatch.actual}`
      : "";
    const missing = result.missingExpected.length ? ` missing: ${result.missingExpected.join(", ")}` : "";
    const forbidden = result.foundForbidden.length ? ` forbidden: ${result.foundForbidden.join(", ")}` : "";
    console.log(`${marker} ${result.status} ${result.route} -> ${result.finalPath}${redirect}${missing}${forbidden}`);
  }
}

async function main() {
  const chromeExecutable = findChromeExecutable();
  if (!chromeExecutable) {
    throw new Error("Google Chrome or Chromium was not found. Set CHROME_PATH to a local Chrome executable.");
  }

  const port = await findFreePort();
  const userDataDir = await mkdtemp(join(tmpdir(), "admin-routes-qa-"));
  const chrome = spawn(chromeExecutable, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "about:blank",
  ], { stdio: "ignore" });

  let cdp;
  try {
    await waitForChrome(port);
    cdp = new CdpClient(await newPageWebSocket(port));
    await cdp.open();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
      source: localeBeforeHydrationScript,
    });
    await primeLocale(cdp);

    const routes = [];
    for (const config of routeChecks) {
      routes.push(await checkRoute(cdp, config));
    }

    const failed = routes.filter((route) => !route.passed).length;
    const summary = {
      total: routes.length,
      passed: routes.length - failed,
      failed,
      warnings: 0,
      routes,
    };

    if (jsonOnly) {
      console.log(JSON.stringify(summary, null, 2));
    } else {
      printHumanSummary(summary);
      console.log("\\nJSON summary:");
      console.log(JSON.stringify(summary, null, 2));
    }

    process.exitCode = failed > 0 ? 1 : 0;
  } finally {
    try {
      cdp?.close();
    } catch {
      // Nothing useful to report after the QA result is printed.
    }
    chrome.kill("SIGTERM");
    await waitForProcessExit(chrome);
    await rm(userDataDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  const failedSummary = {
    total: routeChecks.length,
    passed: 0,
    failed: routeChecks.length,
    warnings: 0,
    routes: [],
    error: error.message,
  };
  if (jsonOnly) {
    console.log(JSON.stringify(failedSummary, null, 2));
  } else {
    console.error(`Admin route QA failed: ${error.message}`);
    console.log(JSON.stringify(failedSummary, null, 2));
  }
  process.exit(1);
});
