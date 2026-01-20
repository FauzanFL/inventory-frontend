<script lang="ts">
	import { page } from '$app/state';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let { user, token, profile } = $derived(page.data);

	let editableUsername = $state('');
	let editableEmail = $state('');
	let isEditing = $state(false);
	let isLoading = $state(false);

	$effect(() => {
		if (profile) {
			editableUsername = profile.username || '';
			editableEmail = profile.email || '';
		}
	});

	function toggleEditMode() {
		isEditing = !isEditing;

		if (!isEditing) {
			editableUsername = profile?.username || '';
			editableEmail = profile?.email || '';
		}
	}

	async function handleSaveProfile() {
		isLoading = true;

		try {
			const response = await fetch(`http://localhost:8000/api/users/${user?.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					username: editableUsername,
					email: editableEmail
				})
			});

			if (response.ok) {
				await invalidateAll();
				isEditing = false;
				toast.success('Profile updated successfully!');
			} else {
				if (response.status === 401) {
					toast.error('Unauthorized');
				}
				const errorData = await response.json();
				toast.error('Failed to update profile: ' + errorData.detail || response.statusText);
			}
		} catch (error) {
			toast.error('Failed to update profile');
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container mx-auto max-w-2xl p-6">
	<Card.Root>
		<Card.Header>
			<div class="flex items-center gap-4">
				<Avatar.Root class="h-20 w-20 border text-4xl">
					<Avatar.Fallback class="font-bold"
						>{user?.username ? user.username[0].toUpperCase() : '?'}</Avatar.Fallback
					>
				</Avatar.Root>
				<div>
					<Card.Title class="text-2xl">{user?.username || 'loading...'}</Card.Title>
					<Card.Description>{user?.role || 'loading...'}</Card.Description>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label for="username">Username</Label>
					<Input id="username" bind:value={editableUsername} disabled={!isEditing} />
				</div>
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input id="email" bind:value={editableEmail} disabled={!isEditing} />
				</div>
			</div>
		</Card.Content>
		<Card.Footer>
			{#if isEditing}
				<div class="space-x-2">
					<Button variant="outline" onclick={toggleEditMode}>Cancel</Button>
					<Button type="submit" variant="default" onclick={handleSaveProfile} disabled={isLoading}>
						{isLoading ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>
			{:else}
				<Button onclick={toggleEditMode}>Edit Profile</Button>
			{/if}
		</Card.Footer>
	</Card.Root>
</div>
