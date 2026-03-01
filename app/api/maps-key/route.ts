export async function GET() {
  return Response.json({ apiKey: process.env.GMAP_API_KEY });
}
