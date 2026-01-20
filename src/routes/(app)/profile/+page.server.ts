import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, cookies }) => {
	const token = cookies.get('access_token');
	if (!token) {
		throw redirect(303, '/login');
	}

	const layoutData = await parent();
	const user = layoutData.user;

	const response = await fetch(`http://127.0.0.1:8000/api/users/${user.id}`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	if (!response.ok && response.status === 401) {
		throw redirect(303, '/login');
	}
	const data = await response.json();
	return { user, token, profile: data };
};
