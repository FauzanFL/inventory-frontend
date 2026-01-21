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

	let { permissions, pagination, token } = $derived(page.data);
	let pages = $derived(Array.from({ length: pagination.total_pages }, (_, i) => i + 1));

	let open = $state(false);
	let name = $state('');
	let description = $state('');
	let isLoading = $state(false);

	let editOpen = $state(false);
	let confirmOpen = $state(false);
	let isEditing = $state(false);
	let deletionId = $state(0);

	let selectedPermission = $state({
		id: 0,
		name: '',
		description: ''
	});

	function resetAddForm() {
		name = '';
		description = '';
	}

	async function handleAddPermission() {
		isLoading = true;
		try {
			const response = await fetch('http://localhost:8000/api/permissions', {
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
				toast.success('Permission added successfully!');
			} else {
				if (response.status === 401) {
					toast.error('Unauthorized');
				}
				toast.error('Failed to add permission');
			}
		} catch (error) {
			toast.error('Failed to add permission');
		} finally {
			isLoading = false;
		}
	}

	function openEditDialog(permission: any) {
		selectedPermission = permission;
		editOpen = true;
	}

	async function handleUpdatePermission() {
		isEditing = true;
		try {
			const response = await fetch(
				`http://localhost:8000/api/permissions/${selectedPermission.id}`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify({
						name: selectedPermission.name,
						description: selectedPermission.description
					})
				}
			);

			if (response.ok) {
				editOpen = false;
				await invalidateAll();
				toast.success('Permission updated successfully!');
			} else {
				if (response.status === 401) {
					toast.error('Unauthorized');
				}
				toast.error('Failed to update permission');
			}
		} catch (error) {
			toast.error('Failed to update permission');
		} finally {
			isEditing = false;
		}
	}

	function openConfirmDialog(permissionId: number) {
		deletionId = permissionId;
		confirmOpen = true;
	}

	async function handleDeletePermission() {
		isLoading = true;
		try {
			const response = await fetch(`http://localhost:8000/api/permissions/${deletionId}`, {
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
				toast.success('Permission deleted successfully!');
			} else {
				if (response.status === 401) {
					toast.error('Unauthorized');
				}
				toast.error('Failed to delete permission');
			}
		} catch (error) {
			toast.error('Failed to delete permission');
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Permission Management</h1>
			<p class="text-muted-foreground">Manage your permissions here.</p>
		</div>
	</div>

	<div class="space-y-2">
		<Dialog.Root bind:open>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button {...props}>Add Permission</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title class="text-xl font-bold">Add Permission</Dialog.Title>
					<Dialog.Description>Add a new permission.</Dialog.Description>
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
					<Button
						type="submit"
						variant="default"
						onclick={handleAddPermission}
						disabled={isLoading}
					>
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
							<Table.Head class="text-center font-bold">Action</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each permissions as permission}
							<Table.Row>
								<Table.Cell>{permission.name}</Table.Cell>
								<Table.Cell>{permission.description}</Table.Cell>
								<Table.Cell class="text-center">
									<Button variant="outline" size="sm" onclick={() => openEditDialog(permission)}
										>Edit</Button
									>
									<Button
										variant="destructive"
										size="sm"
										onclick={() => openConfirmDialog(permission.id)}>Delete</Button
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
	<Dialog.Root bind:open={editOpen}>
		<Dialog.Trigger />
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title class="text-xl font-bold">Edit Permission</Dialog.Title>
				<Dialog.Description>Edit a permission.</Dialog.Description>
			</Dialog.Header>

			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label for="name">Name</Label>
					<Input id="name" bind:value={selectedPermission.name} />
				</div>
				<div class="grid gap-2">
					<Label for="description">Description</Label>
					<Textarea id="description" bind:value={selectedPermission.description} />
				</div>
			</div>

			<Dialog.Footer>
				<Button
					type="submit"
					variant="default"
					onclick={handleUpdatePermission}
					disabled={isEditing}
				>
					{isEditing ? 'Updating...' : 'Update'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<AlertDialog.Root bind:open={confirmOpen}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title class="text-xl font-bold">Delete Permission</AlertDialog.Title>
				<AlertDialog.Description>
					Are you sure you want to delete this permission?
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<Button
					variant="destructive"
					onclick={handleDeletePermission}
					class="hover:cursor-pointer"
					disabled={isLoading}
				>
					{isLoading ? 'Deleting...' : 'Yes, delete!'}
				</Button>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
</div>
