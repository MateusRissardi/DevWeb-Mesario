export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "Portal do Mesário",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
