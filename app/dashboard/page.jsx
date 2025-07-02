'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');

        if (!storedUser) {
            router.push('/login');
            return;
        }

        let user;
        try {
            user = JSON.parse(storedUser);
        } catch (error) {
            console.error('❌ Error al parsear user:', error);
            router.push('/login');
            return;
        }

        if (user.tipo_usuario === 'adoptante') {
            router.push('/adoptante');
        } else if (user.tipo_usuario === 'veterinario') {
            router.push('/veterinario');
        } else {
            router.push('/login');
        }

    }, [router]);

    return <p>Redirigiendo...</p>;
}
