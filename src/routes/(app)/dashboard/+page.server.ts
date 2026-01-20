import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, parent, url }) => {
	const layoutData = await parent();
	const token = layoutData.token;
	if (!token) {
		throw redirect(303, '/login');
	}

	const page = url.searchParams.get('page') || 1;

	const response = await fetch(`http://127.0.0.1:8000/api/items?page=${page}&limit=10`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!response.ok) {
		if (response.status === 401) throw redirect(303, '/login');

		return { items: [], pagination: { total_pages: 1, current_page: 1, total_items: 0 }, token };
	}
	const data = await response.json();

	return {
		items: data.items,
		pagination: {
			total_pages: data.total_pages,
			current_page: data.page,
			total_items: data.total
		},
		token
	};
};
