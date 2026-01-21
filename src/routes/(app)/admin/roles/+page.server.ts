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

	try {
		const [rolesRes, permissionsRes] = await Promise.all([
			fetch(`http://127.0.0.1:8000/api/roles?page=${page}&limit=10`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			}),

			fetch(`http://127.0.0.1:8000/api/permissions`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
		]);

		if (!rolesRes.ok || !permissionsRes.ok) {
			if (rolesRes.status === 401 || permissionsRes.status === 401) {
				throw redirect(303, '/dashboard');
			}

			return {
				roles: [],
				permissions: [],
				pagination: { total_pages: 1, current_page: 1, total_roles: 0 },
				token
			};
		}

		const rolesData = await rolesRes.json();
		const permissionsData = await permissionsRes.json();

		return {
			roles: rolesData.roles,
			permissions: permissionsData.permissions,
			pagination: {
				total_pages: rolesData.total_pages,
				current_page: rolesData.page,
				total_roles: rolesData.total
			},
			token
		};
	} catch (error) {
		console.error('Fetch error:', error);

		return {
			roles: [],
			permissions: [],
			pagination: { total_pages: 1, current_page: 1, total_roles: 0 },
			token
		};
	}
};
