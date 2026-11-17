export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new ApiError('network', 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error || `HTTP ${res.status}`, res.status, body.fields);
  return body;
}

export const api = {
  content: (lang) => request(`/content?lang=${lang}`),
  modules: (lang) => request(`/modules?lang=${lang}`),
  /** key = "slug|lang|range" so each combination is cached separately */
  dashboard: (key) => {
    const [slug, lang, range] = key.split('|');
    return request(`/modules/${encodeURIComponent(slug)}/dashboard?lang=${lang}&range=${range}`);
  },
  createInquiry: (data) => request('/inquiries', { method: 'POST', body: JSON.stringify(data) }),
};
