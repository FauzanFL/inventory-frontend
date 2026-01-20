import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const layoutData = await parent();
	const token = layoutData.token;
	const user = layoutData.user;

	if (!token) {
		throw redirect(303, '/login');
	}

	if (!user || user.role !== 'ADMIN') {
		throw redirect(303, '/dashboard');
	}

	const response = await fetch('http://127.0.0.1:8000/api/users', {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	if (!response.ok && response.status === 401) {
		throw redirect(303, '/dashboard');
	}

	const data = await response.json();

	return { user, token, users: data };
};
