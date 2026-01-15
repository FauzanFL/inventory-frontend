import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('access_token');
	const isRootPath = event.url.pathname === '/';

	if (!token && isRootPath) {
		throw redirect(303, '/login');
	}

	if (token && isRootPath) {
		throw redirect(303, '/dashboard');
	}

	if (!token && event.url.pathname.startsWith('/dashboard')) {
		throw redirect(303, '/login');
	}

	if (event.url.pathname.startsWith('/admin')) {
		const userRole = event.cookies.get('user_role');
		if (userRole !== 'admin') {
			throw redirect(303, '/dashboard');
		}
	}

	return await resolve(event);
};
