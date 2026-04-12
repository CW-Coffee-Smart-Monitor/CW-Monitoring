import { NextRequest, NextResponse } from 'next/server';
import { SensorPayload } from '@/types';

/**
 * POST /api/webhook
 *
 * Endpoint for ESP32 to send sensor data.
 * Validates & sanitizes the incoming JSON before forwarding to the app.
 *
 * Expected body: { tableId: number, uid: string, isOccupied: boolean, distance: number }
 */
export async function POST(request: NextRequest) {
  try {
    // --- Authentication (optional, enabled when API_SECRET_KEY is set) ---
    const secret = process.env.API_SECRET_KEY;
    if (secret && secret !== 'change-me-to-a-secure-random-string') {
      const authHeader = request.headers.get('x-api-key');
      if (authHeader !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();

    // --- Validation & Sanitization ---
    const tableId = Number(body.tableId);
    const uid = typeof body.uid === 'string' ? body.uid.slice(0, 64) : '';
    const isOccupied = Boolean(body.isOccupied);
    const distance = Number(body.distance);

    if (
      !Number.isFinite(tableId) || tableId < 1 || tableId > 100 ||
      !Number.isFinite(distance) || distance < 0 || distance > 1000
    ) {
      return NextResponse.json(
        { error: 'Invalid payload. tableId (1-100) and distance (0-1000) required.' },
        { status: 400 }
      );
    }

    const payload: SensorPayload = {
      tableId,
      uid,
      isOccupied,
      distance,
      timestamp: Date.now(),
    };

    // TODO: In production, push to a message queue or WebSocket broadcast.
    // For now, we store in a simple in-memory buffer that SSE/polling can read.
    console.log('[Webhook] Sensor data received:', payload);

    return NextResponse.json({ success: true, data: payload }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }
}

/** Health check */
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'cw-smartmonitor-webhook' });
}
