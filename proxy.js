// deploy this script to cloudflare worker
// This act as a proxy for getting request from twitter
// for some reason, twitter has banned Vercel address so request
// always return 429
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === "POST" && request.headers.get("content-type") === "application/json") {
    const data = await request.json();
    if (((data || {}).url || "").startsWith("https://api.twitter.com/")) {
      const res = await fetch(data.url, data.body).then((res) => {
        return res.json();
      });
      return new Response(JSON.stringify(res), { headers: { "content-type": "application/json" } });
    }
  }
  return new Response("", { status: 400 });
}
