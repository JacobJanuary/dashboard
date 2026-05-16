import { readFile } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.ROUTE_QA_BASE_URL ?? "http://localhost:3000";
const manifestPath = join(process.cwd(), "src/lib/v3-route-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const routes = Object.values(manifest).flat();

const expectedRedirects = [
  { from: "/admin", to: "/admin/select-role" },
  { from: "/venue-owner", to: "/owner" },
  { from: "/venue-owner/venues", to: "/owner/venues" },
  { from: "/moderator/hosts", to: "/moderator/claims/organizations" },
  { from: "/moderator/quests", to: "/moderator" },
];

async function checkRoute(route) {
  const response = await fetch(new URL(route, baseUrl), { redirect: "follow" });
  return { route, status: response.status, ok: response.status === 200 };
}

async function checkRedirect(item) {
  const response = await fetch(new URL(item.from, baseUrl), { redirect: "manual" });
  const location = response.headers.get("location") ?? "";
  const ok = response.status >= 300 && response.status < 400 && location.endsWith(item.to);
  return { route: item.from, status: response.status, location, ok };
}

const results = [];
for (const route of routes) {
  results.push(await checkRoute(route));
}
for (const redirect of expectedRedirects) {
  results.push(await checkRedirect(redirect));
}

const failed = results.filter((item) => !item.ok);
if (failed.length) {
  console.error(`Route QA failed for ${failed.length} routes against ${baseUrl}`);
  for (const item of failed) {
    console.error(`${item.status} ${item.route}${item.location ? ` -> ${item.location}` : ""}`);
  }
  process.exit(1);
}

console.log(`Route QA passed: ${routes.length} v3 routes + ${expectedRedirects.length} compatibility redirects.`);
