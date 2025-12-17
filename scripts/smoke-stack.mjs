import assert from "node:assert/strict";

const apiUrl = process.env.PUBLIC_API_URL ?? "http://localhost:5000";
const clientUrl = process.env.PUBLIC_WEB_URL ?? "http://localhost:3000";
const destination = "https://example.com/?source=local-docker-test#qr";

async function json(path, options) {
  const response = await fetch(new URL(path, apiUrl), options);
  assert.ok(response.ok, `${path}: HTTP ${response.status}`);
  return response.json();
}

await json("/health");
await json("/ready");
const page = await fetch(new URL("/qr", clientUrl));
assert.equal(page.status, 200);
assert.match(await page.text(), /Create a QR code/);

const { data: link } = await json("/api/links", {
  method: "POST",
  headers: { "content-type": "application/json", origin: clientUrl },
  body: JSON.stringify({ targetUrl: destination, title: "Local Docker smoke test" })
});
assert.equal(new URL(link.shortUrl).origin, new URL(apiUrl).origin);
try {
  const redirect = await fetch(link.shortUrl, { redirect: "manual" });
  assert.equal(redirect.status, 302);
  // The existing server normalizes fragments out of public redirect destinations.
  assert.equal(redirect.headers.get("location"), "https://example.com/?source=local-docker-test");
  await json(`/api/links/${link.code}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", "x-admin-key": link.adminKey },
    body: JSON.stringify({ title: "Local Docker smoke test verified" })
  });
  const { data: audits } = await json(`/api/links/${link.code}/audit`, {
    headers: { "x-admin-key": link.adminKey }
  });
  assert.ok(audits.length >= 2);
} finally {
  await json(`/api/links/${link.code}/status`, {
    method: "PATCH",
    headers: { "content-type": "application/json", "x-admin-key": link.adminKey },
    body: JSON.stringify({ status: "DISABLED" })
  });
}
const disabled = await fetch(link.shortUrl, { redirect: "manual" });
assert.equal(disabled.status, 410);
console.log("Stack verified: QR page, database readiness, link creation, redirect, metadata, audit and disable.");
console.log("One disabled test link was retained in the local database.");
