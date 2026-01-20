import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, cookies }) => {
	const token = cookies.get('access_token');
	try {
		const response = await fetch('http://127.0.0.1:8000/api/users/me', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		if (response.ok) {
			const user = await response.json();
			return { user, token };
		}
	} catch (error) {
		console.error(error);
		return { user: null, token: null };
	}
};
