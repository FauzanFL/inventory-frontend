import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ fetch, parent, url }) => {
	const { user, token } = await parent();

	const page = url.searchParams.get('page') || 1;

	if (!token) {
		throw redirect(303, '/login');
	}

	if (!user || user.role !== 'ADMIN') {
		throw redirect(303, '/dashboard');
	}

	const response = await fetch(`http://127.0.0.1:8000/api/permissions?page=${page}&limit=10`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	if (!response.ok) {
		if (response.status === 401) throw redirect(303, '/dashboard');

		return {
			permissions: [],
			pagination: { total_pages: 1, current_page: 1, total_permissions: 0 },
			token
		};
	}

	const data = await response.json();

	return {
		permissions: data.permissions,
		pagination: {
			total_pages: data.total_pages,
			current_page: data.page,
			total_permissions: data.total
		},
		token
	};
};
