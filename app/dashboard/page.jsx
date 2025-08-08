'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // precargar destinos
    router.prefetch('/adoptante');
    router.prefetch('/veterinario');

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.replace('/login');
      return;
    }

    try {
      const { tipo_usuario } = JSON.parse(storedUser);
      const dest =
        tipo_usuario === 'adoptante'
          ? '/adoptante'
          : tipo_usuario === 'veterinario'
          ? '/veterinario'
          : '/login';

      router.replace(dest);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  return <p>Redirigiendo…</p>;
}
