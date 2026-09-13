const API_BASE = 'https://solve.ivy.homes';
const API_KEY = import.meta.env.VITE_IVY_API_KEY;

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('ivy_refresh');

  if (!refreshToken) {
    throw new Error('No refresh token available. Please log in again.');
  }

  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      refresh_token: refreshToken
    })
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      `Token refresh failed with status ${response.status}`
    );
  }

  if (!data?.access_token) {
    throw new Error('Refresh response did not contain access_token');
  }

  localStorage.setItem('ivy_token', data.access_token);

  if (data.refresh_token) {
    localStorage.setItem('ivy_refresh', data.refresh_token);
  }

  return data.access_token;
}

export async function apiFetch(path, options = {}, retry = true) {
  let token = localStorage.getItem('ivy_token');

  const headers = {
    ...(options.headers || {}),
    'X-API-Key': API_KEY
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (
    response.status === 401 &&
    retry &&
    localStorage.getItem('ivy_refresh')
  ) {
    token = await refreshAccessToken();

    const retryHeaders = {
      ...(options.headers || {}),
      'X-API-Key': API_KEY,
      Authorization: `Bearer ${token}`
    };

    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: retryHeaders
    });
  }

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data?.detail
        ? data.detail
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

export async function fetchAllPages(endpoint, limit = 200) {
  const firstPage = await apiFetch(
    `${endpoint}${endpoint.includes('?') ? '&' : '?'}page=1&limit=${limit}`
  );

  const firstResults = Array.isArray(firstPage?.results)
    ? firstPage.results
    : [];

  const total = Number(
    firstPage?.total || firstResults.length
  );

  if (total <= firstResults.length) {
    return firstResults;
  }

  const totalPages = Math.ceil(total / limit);

  const requests = [];

  for (let page = 2; page <= totalPages; page++) {
    requests.push(
      apiFetch(
        `${endpoint}${endpoint.includes('?') ? '&' : '?'}page=${page}&limit=${limit}`
      )
    );
  }

  const remainingPages = await Promise.all(requests);

  const results = [...firstResults];

  for (const pageData of remainingPages) {
    if (Array.isArray(pageData?.results)) {
      results.push(...pageData.results);
    }
  }

  return results;
}