import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { user, token } = await parent();

	if (!token) {
		throw redirect(303, '/login');
	}

	if (!user || user.role !== 'ADMIN') {
		throw redirect(303, '/dashboard');
	}

	const response = await fetch('http://127.0.0.1:8000/api/permissions', {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	if (!response.ok && response.status === 401) {
		throw redirect(303, '/dashboard');
	}

	const data = await response.json();

	return { user, token, permissions: data };
};
