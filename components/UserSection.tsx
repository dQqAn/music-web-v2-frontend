'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { tokenControl } from '@/lib/tokenControl';

export default function UserSection() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => setLoggedIn(await tokenControl()))();
  }, []);

  if (loggedIn === null) return null;         
  if (loggedIn) return <Link href="http://localhost:4000/api/dashboard">Dashboard</Link>;

  const redirect = encodeURIComponent(window.location.href);
  return (
    <Link href={`http://localhost:4000/api/auth/start-login?redirectUrl=${redirect}`}>
      Login
    </Link>
  );
}
