const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);
  return data;
}

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export function register(username, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function getMe(token) {
  return request('/auth/me', { headers: authHeader(token) });
}

// ── Reports ───────────────────────────────────────────────────────────────────

export function getReports() {
  return request('/api/reports');
}

export function submitReport(token, report) {
  return request('/api/reports', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(report),
  });
}

// ── Normalise an API report to match the local INITIAL_REPORTS shape ──────────
export function normaliseApiReport(r) {
  return {
    id: `api-${r.id}`,
    title: r.title,
    description: r.description,
    type: r.type,
    tag: r.tag,
    lat: r.lat,
    lng: r.lng,
    behaviors: r.behaviors || [],
    image: r.image || '',
    uap_confidence: r.uap_confidence,
    verdict: r.verdict,
    distance: '— km away',   // recalculated client-side in MapTab
    time: new Date(r.created_at).toLocaleString(),
    submittedBy: r.username || 'Anonymous',
    _fromApi: true,
  };
}
