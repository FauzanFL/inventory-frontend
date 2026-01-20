import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const user = layoutData.user;

	if (!user) {
		throw redirect(303, '/login');
	}

	if (user.role !== 'ADMIN') {
		throw redirect(303, '/dashboard');
	}

	return { user };
};
