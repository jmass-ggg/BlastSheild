import { NextResponse } from 'next/server';

const MCP_URL = process.env.BLASTSHIELD_MCP_URL ?? 'http://127.0.0.1:8001/mcp';

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(MCP_URL, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json, text/event-stream' },
    });

    // Streamable HTTP returns 400/405/406 when reached without an MCP session.
    // Those protocol responses still prove that the transport is listening.
    const reachable = [200, 400, 405, 406].includes(response.status);
    return NextResponse.json(
      { status: reachable ? 'ok' : 'error' },
      { status: reachable ? 200 : 503 }
    );
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}
