<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	let username = '';
	let password = '';
	let error = '';

	async function handleLogin() {
		try {
			const formData = new FormData();
			formData.append('username', username);
			formData.append('password', password);

			const response = await fetch('http://localhost:8000/api/auth/login', {
				method: 'POST',
				body: formData,
				credentials: 'include'
			});

			if (response.ok) {
				goto('/dashboard');
			} else {
				error = 'Invalid username or password.';
			}
		} catch (e) {
			error = 'Server not responding.';
		}
	}
</script>

<div class="flex h-screen items-center justify-center bg-gray-100">
	<form on:submit|preventDefault={handleLogin} class="w-96 rounded-lg bg-white p-8 shadow-md">
		<h1 class="mb-6 text-2xl font-bold">Login</h1>
		{#if error}
			<p class="mb-4 text-red-500">{error}</p>
		{/if}

		<input
			type="text"
			bind:value={username}
			placeholder="Username"
			class="mb-4 w-full border p-2"
			required
		/>
		<input
			type="password"
			bind:value={password}
			placeholder="Password"
			class="mb-6 w-full border p-2"
			required
		/>

		<Button type="submit" class="w-full bg-blue-600 text-white hover:bg-blue-700">Login</Button>
	</form>
</div>
