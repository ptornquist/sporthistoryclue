self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Presence of a fetch handler is what makes Chrome treat the site as installable.
  // Requests stay on the network so clue data is never served from a stale cache.
});
