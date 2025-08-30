import { getApiUrl } from '@/config/env';

export interface FeedbackCountItem {
  id: string;
  hospitalToken: string;
  averageRating: number;
  createAt: string; // e.g., "09 Aug 2025"
  feedbackType: 'positive' | 'negative';
  status: string;
}

export async function fetchFeedbackCounts(): Promise<FeedbackCountItem[]> {
  try {
    const res = await fetch(getApiUrl('authorities/feedback/count'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await safeJson(res);
      throw new Error(err?.message || 'Failed to load analytics');
    }
    const data = await res.json();
    const list = Array.isArray(data) ? data : data?.data;
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.error('fetchFeedbackCounts error:', e);
    return [];
  }
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}
