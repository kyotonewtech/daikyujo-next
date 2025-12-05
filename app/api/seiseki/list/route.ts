import { NextResponse } from 'next/server';
import { getArchiveList } from '@/lib/seiseki';

/**
 * GET /api/seiseki/list
 * アーカイブ一覧を取得（公開API）
 */
export async function GET() {
  try {
    const archiveList = getArchiveList();
    return NextResponse.json(archiveList);
  } catch (error) {
    console.error('Error fetching archive list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch archive list' },
      { status: 500 }
    );
  }
}
