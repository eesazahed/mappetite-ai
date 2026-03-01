export async function GET() {
  return Response.json({ apiKey: process.env.NEXT_PUBLIC_GMAPS_API_KEY });
}
