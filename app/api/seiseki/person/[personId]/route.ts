import { NextRequest, NextResponse } from 'next/server';
import { getPersonHistory } from '@/lib/seiseki';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  try {
    const { personId } = await params;

    console.log('[API] Received request for personId:', personId);

    if (!personId) {
      console.log('[API] personId is missing');
      return NextResponse.json(
        { error: 'personId is required' },
        { status: 400 }
      );
    }

    console.log('[API] Calling getPersonHistory for:', personId);
    const personHistory = getPersonHistory(personId);

    console.log('[API] getPersonHistory result:', personHistory ? 'Found' : 'Not found');
    console.log('[API] Result details:', JSON.stringify(personHistory, null, 2));

    if (!personHistory) {
      console.log('[API] Person not found, returning 404');
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    console.log('[API] Returning person history successfully');
    return NextResponse.json(personHistory);
  } catch (error) {
    console.error('Error fetching person history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
