export let activeStatus = false;

export async function tokenControl(): Promise<boolean> {
  
  const CHECK  = 'http://localhost:4000/api/auth/check';
  const REFRESH = 'http://localhost:4000/api/auth/refresh';

  /* 1. Is the access token still valid? */
  const res = await fetch(CHECK, { credentials: 'include' });
  if (res.ok) {
    activeStatus = true;
    return true;
  }

  /* 2. Try to refresh */
  if (res.status === 401) {
    const csrf = readCookie('csrf');
    const headers: HeadersInit = {};
    if (csrf) headers['X-CSRF'] = csrf;

    const r = await fetch(REFRESH, {
      method: 'POST',
      credentials: 'include',
      headers,
    });

    if (r.ok) {
      const retry = await fetch(CHECK, { credentials: 'include' });
      activeStatus = retry.ok;
      return retry.ok;
    }
  }
  activeStatus = false;
  return false;
}

function readCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((r) => r.startsWith(name + '='))
    ?.split('=')[1];
}
