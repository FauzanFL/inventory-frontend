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

	if (token && event.url.pathname.startsWith('/login')) {
		throw redirect(303, '/dashboard');
	}

	if (!token && !event.url.pathname.startsWith('/login')) {
		throw redirect(303, '/login');
	}

	return await resolve(event);
};
