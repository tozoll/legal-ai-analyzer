// Docker HEALTHCHECK ve izleme araçları için basit sağlık kontrolü endpoint'i.
// Auth gerektirmez — /api/auth/* middleware'i tarafından korunmaz.

export async function GET() {
  return Response.json({
    status: "ok",
    service: "LexAI",
    timestamp: new Date().toISOString(),
  });
}
