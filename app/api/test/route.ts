export async function GET() {
  return new Response(JSON.stringify({ message: "hello" }), {
    headers: { "Content-Type": "application/json" },
  });
}
