<script lang="ts">
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { invalidateAll } from '$app/navigation';

	let { roles, pagination, token } = $derived(page.data);
	let pages = $derived(Array.from({ length: pagination.total_pages }, (_, i) => i + 1));

	let open = $state(false);
	let name = $state('');
	let description = $state('');
	let isLoading = $state(false);

	let editOpen = $state(false);
	let confirmOpen = $state(false);
	let isEditing = $state(false);
	let deletionId = $state(0);

	let selectedRole = $state({
		id: 0,
		name: '',
		description: ''
	});

	function resetAddForm() {
		name = '';
		description = '';
	}

	function openEditModal(role: { id: number; name: string; description: string }) {
		selectedRole = role;
		editOpen = true;
	}

	function openDeleteModal(id: number) {
		deletionId = id;
		confirmOpen = true;
	}

	async function handleAddRole() {
		isLoading = true;
		try {
			const response = await fetch('http://localhost:8000/api/roles', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					name,
					description
				})
			});

			if (response.ok) {
				open = false;
				resetAddForm();
				await invalidateAll();
				toast.success('Role added successfully!');
			} else {
				if (response.status === 401) {
					toast.error('Unauthorized');
				}
				toast.error('Failed to add role');
			}
		} catch (error) {
			toast.error('Failed to add role');
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdateRole() {
		isEditing = true;
		try {
			const response = await fetch(`http://localhost:8000/api/roles/${selectedRole.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					name: selectedRole.name,
					description: selectedRole.description
				})
			});

			if (response.ok) {
				editOpen = false;
				await invalidateAll();
				toast.success('Role updated successfully!');
			} else {
				if (response.status === 401) {
					toast.error('Unauthorized');
				}
				toast.error('Failed to update role');
			}
		} catch (error) {
			toast.error('Failed to update role');
		} finally {
			isEditing = false;
		}
	}

	async function handleDeleteRole() {
		isLoading = true;
		try {
			const response = await fetch(`http://localhost:8000/api/roles/${deletionId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			if (response.ok) {
				confirmOpen = false;
				deletionId = 0;
				await invalidateAll();
				toast.success('Role deleted successfully!');
			} else {
				if (response.status === 401) {
					toast.error('Unauthorized');
				}
				toast.error('Failed to delete role');
			}
		} catch (error) {
			toast.error('Failed to delete role');
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Role Management</h1>
			<p class="text-muted-foreground">Manage your roles here.</p>
		</div>
	</div>

	<div class="space-y-2">
		<Dialog.Root bind:open>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button {...props}>Add Role</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title class="text-xl font-bold">Add Role</Dialog.Title>
					<Dialog.Description>Add a new role.</Dialog.Description>
				</Dialog.Header>

				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label for="name">Name</Label>
						<Input id="name" bind:value={name} />
					</div>
					<div class="grid gap-2">
						<Label for="description">Description</Label>
						<Textarea id="description" bind:value={description} />
					</div>
				</div>

				<Dialog.Footer>
					<Button type="submit" variant="default" onclick={handleAddRole} disabled={isLoading}>
						{isLoading ? 'Adding...' : 'Add'}
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>

		<Card.Root>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="font-bold">Name</Table.Head>
							<Table.Head class="font-bold">Description</Table.Head>
							<Table.Head class="font-bold">Permissions</Table.Head>
							<Table.Head class="text-center font-bold">Action</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each roles as role}
							<Table.Row>
								<Table.Cell>{role.name}</Table.Cell>
								<Table.Cell>{role.description}</Table.Cell>
								<Table.Cell>
									<div class="flex max-w-100 flex-wrap gap-1">
										{#each role.permissions as permission}
											<div class="rounded-full bg-muted px-2 py-1 text-sm">
												{permission.name}
											</div>
										{/each}
									</div>
								</Table.Cell>
								<Table.Cell class="text-center">
									<Button variant="outline" size="sm" onclick={() => openEditModal(role)}
										>Edit</Button
									>
									<Button variant="outline" size="sm">Manage Permissions</Button>
									<Button variant="destructive" size="sm" onclick={() => openDeleteModal(role.id)}
										>Delete</Button
									>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
			<Card.Footer class="flex items-center justify-between border-t p-4">
				<div class="text-sm text-muted-foreground">
					Page <strong>{pagination.current_page}</strong> of
					<strong>{pagination.total_pages}</strong>
				</div>

				<div class="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						href="?page={pagination.current_page - 1}"
						disabled={pagination.current_page <= 1}
						class="hover:cursor-pointer">Previous</Button
					>

					<div class="hidden gap-1 md:flex">
						{#each pages as page}
							<Button
								variant={page === pagination.current_page ? 'default' : 'outline'}
								size="sm"
								href="?page={page}"
								class="hover:cursor-pointer">{page}</Button
							>
						{/each}
					</div>

					<Button
						variant="outline"
						size="sm"
						href="?page={pagination.current_page + 1}"
						disabled={pagination.current_page >= pagination.total_pages}
						class="hover:cursor-pointer">Next</Button
					>
				</div>
			</Card.Footer>
		</Card.Root>
	</div>

	<!-- Edit Modal -->
	<Dialog.Root bind:open={editOpen}>
		<Dialog.Trigger />
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title class="text-xl font-bold">Edit Role</Dialog.Title>
				<Dialog.Description>Edit a role.</Dialog.Description>
			</Dialog.Header>

			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label for="name">Name</Label>
					<Input id="name" bind:value={selectedRole.name} />
				</div>
				<div class="grid gap-2">
					<Label for="description">Description</Label>
					<Textarea id="description" bind:value={selectedRole.description} />
				</div>
			</div>

			<Dialog.Footer>
				<Button type="submit" variant="default" onclick={handleUpdateRole} disabled={isEditing}>
					{isEditing ? 'Updating...' : 'Update'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<AlertDialog.Root bind:open={confirmOpen}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Are you sure?</AlertDialog.Title>
				<AlertDialog.Description>Are you sure you want to delete this role?</AlertDialog.Description
				>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<Button variant="destructive" onclick={handleDeleteRole} disabled={isLoading}
					>{isLoading ? 'Deleting...' : 'Yes, delete!'}</Button
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
</div>
