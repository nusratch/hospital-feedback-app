import { getApiUrl } from '@/config/env';

export interface HospitalToken {
  id?: string;
  token: string;
  createdAt?: string;
  createdBy?: string;
  used?: boolean;
}

export const fetchTokens = async (): Promise<HospitalToken[]> => {
  try {
    const res = await fetch(getApiUrl('/authorities/token/all'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await safeJson(res);
      throw new Error(err?.message || 'Failed to load tokens');
    }
    const data = await res.json();
    // Support both { data: [] } and []
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (e) {
    console.error('fetchTokens error:', e);
    return [];
  }
};

export const addToken = async (
  token?: string,
  createdBy?: string
): Promise<{ ok: boolean; message?: string; token?: HospitalToken }> => {
  try {
    const res = await fetch(getApiUrl('/authorities/token/add'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token ? { token, createdBy } : { createdBy }),
    });
    const data = await safeJson(res);
    if (!res.ok || data?.success === false) {
      const message = data?.message || 'Failed to add token';
      return { ok: false, message };
    }
    // Success path — try to return message and created token if present
    const message = data?.message || 'Token created successfully';
    const tokenObj: HospitalToken | undefined =
      typeof data?.token === 'string'
        ? { token: data.token, used: false }
        : (data?.data || data?.token);
    return { ok: true, message, token: tokenObj };
  } catch (e) {
    console.error('addToken error:', e);
    return { ok: false, message: 'Failed to add token' };
  }
};

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}
