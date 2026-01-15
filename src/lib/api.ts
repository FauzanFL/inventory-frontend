const BASE_URL = 'http://127.0.0.1:8000/api';

export async function fetchApi(url: string, method = 'GET', body?: any, token?: string) {
	const headers: HeadersInit = {
		'Content-Type': 'application/json'
	};

	if (token) headers['Authorization'] = `Bearer ${token}`;

	const res = await fetch(`${BASE_URL}${url}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined
	});

	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.detail || 'Something went wrong');
	}

	return res.json();
}
