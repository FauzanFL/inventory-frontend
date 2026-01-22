<script lang="ts">
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { invalidateAll } from '$app/navigation';
	import SearchInput from '$lib/components/ui/SearchInput.svelte';

	let { roles, permissions, pagination, token } = $derived(page.data);
	let pages = $derived(Array.from({ length: pagination.total_pages }, (_, i) => i + 1));

	let open = $state(false);
	let name = $state('');
	let description = $state('');
	let isLoading = $state(false);

	let editOpen = $state(false);
	let confirmOpen = $state(false);
	let isSheetOpen = $state(false);
	let isEditing = $state(false);
	let isSaving = $state(false);
	let deletionId = $state(0);

	let selectedRole = $state<any>(null);
	let selectedPermissionIds = $state<number[]>([]);

	function openPermissionEditor(role: any) {
		selectedRole = role;
		selectedPermissionIds = role.permissions.map((p: any) => p.id);
		isSheetOpen = true;
	}

	function togglePermission(id: number) {
		if (selectedPermissionIds.includes(id)) {
			selectedPermissionIds = selectedPermissionIds.filter((pid) => pid !== id);
		} else {
			selectedPermissionIds = [...selectedPermissionIds, id];
		}
	}

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

	async function handleSavePermissions() {
		isSaving = true;
		try {
			const response = await fetch(
				`http://localhost:8000/api/roles/${selectedRole.id}/permissions`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify({
						permission_ids: selectedPermissionIds
					})
				}
			);

			if (response.ok) {
				isSheetOpen = false;
				await invalidateAll();
				toast.success('Permissions updated successfully!');
			} else {
				if (response.status === 401) {
					toast.error('Unauthorized');
				}
				toast.error('Failed to update permissions');
			}
		} catch (error) {
			toast.error('Failed to update permissions');
		} finally {
			isSaving = false;
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
		<div class="flex items-center justify-between">
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

			<SearchInput placeholder="Search roles..." />
		</div>

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
									<Button variant="outline" size="sm" onclick={() => openPermissionEditor(role)}
										>Manage Permissions</Button
									>
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

	<!-- Delete Modal -->
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

	<!-- Edit Permissions Sheet -->
	<Sheet.Root bind:open={isSheetOpen}>
		<Sheet.Content side="right" class="flex h-full w-full flex-col p-0 sm:max-w-md">
			<Sheet.Header class="border-b">
				<Sheet.Title>Manage Permissions</Sheet.Title>
				<Sheet.Description
					>Configure what <strong>{selectedRole?.name}</strong> can or cannot do in the system.</Sheet.Description
				>
			</Sheet.Header>

			<div class="flex-1 overflow-y-auto py-2">
				<div class="grid gap-2 overflow-auto p-2">
					{#each permissions as permission}
						<div class="flex items-center space-y-0 space-x-3 rounded-md border p-3 shadow-sm">
							<Checkbox
								id={permission.id}
								checked={selectedPermissionIds.includes(permission.id)}
								onCheckedChange={() => togglePermission(permission.id)}
							/>
							<div class="flex flex-col gap-1 leading-none">
								<Label for={permission.id} class="cursor-pointer text-sm leading-none font-medium">
									{permission.name}
								</Label>
								{#if permission.description}
									<span class="text-xs text-muted-foreground">{permission.description}</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<Sheet.Footer class="flex-col gap-2 sm:flex-col">
				<Button
					variant="default"
					class="w-full"
					onclick={handleSavePermissions}
					disabled={isSaving}
				>
					{isSaving ? 'Saving...' : 'Save Changes'}
				</Button>
				<Button variant="outline" class="w-full" onclick={() => (isSheetOpen = false)}>
					Cancel
				</Button>
			</Sheet.Footer>
		</Sheet.Content>
	</Sheet.Root>
</div>
