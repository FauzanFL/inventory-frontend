<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { goto, invalidateAll } from '$app/navigation';
	import { Label } from '$lib/components/ui/label';

	let username = '';
	let password = '';
	let error = '';
	let isLoading = false;

	async function handleLogin() {
		isLoading = true;
		error = '';
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
				await invalidateAll();
				goto('/dashboard');
			} else {
				error = 'Invalid username or password.';
			}
		} catch (e) {
			error = 'Server not responding.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-muted/40">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="space-y-1 text-center">
			<Card.Title class="text-2xl font-bold">Login to your account</Card.Title>
		</Card.Header>
		<Card.Content>
			<form on:submit|preventDefault={handleLogin} class="space-y-4">
				{#if error}
					<div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
						{error}
					</div>
				{/if}
				<div class="space-y-2">
					<Label for="username">Username</Label>
					<Input
						id="username"
						type="text"
						placeholder="your username"
						bind:value={username}
						required
					/>
				</div>
				<div class="space-y-2">
					<Label for="password">Password</Label>
					<Input
						id="password"
						type="password"
						placeholder="Password"
						bind:value={password}
						required
					/>
				</div>
				<Button type="submit" class="w-full" disabled={isLoading}>
					{#if isLoading}
						Processing...
					{:else}
						Login
					{/if}
				</Button>
			</form>
		</Card.Content>
		<Card.Footer class="flex flex-col text-center text-xs text-muted-foreground">
			<p>© 2026 Inventory Management. All rights reserved.</p>
		</Card.Footer>
	</Card.Root>
</div>
